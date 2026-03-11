import Transaction from '../models/transaction.model.js';
import DetailTransaction from '../models/detail_transaction.model.js';
import Product from '../models/product.model.js';
import Item from '../models/item.model.js';
import Print from '../models/print.model.js';
import SpecialService from '../models/sp_service.model.js';
import SpecialServiceData from '../models/sp_service.data.model.js';
import SpecialServiceBound from '../models/sp_service.bound.model.js';
import SpecialServicePhoto from '../models/sp_service.photo.model.js';
import SpecialServiceSpiral from '../models/sp_service.spiral.model.js';
import SpecialServiceDocument from '../models/sp_service.document.model.js';
import QRCode from '../models/qr_code.model.js';
import File from '../models/file.model.js';
import User from '../models/user.model.js';
import sequelize from '../config/db.js';
import QRCodeService from './qr_code.service.js';

const FILE_STATUSES = ['active', 'inactive'];

const detailProductInclude = {
    model: Product,
    as: 'product',
    include: [
        { model: Item, as: 'item' },
        { model: Print, as: 'print' },
        {
            model: SpecialService,
            as: 'special_service',
            include: [
                { model: SpecialServiceData, as: 'data' },
                { model: SpecialServiceBound, as: 'bound' },
                { model: SpecialServicePhoto, as: 'photo' },
                { model: SpecialServiceSpiral, as: 'spiral' },
                { model: SpecialServiceDocument, as: 'document' }
            ]
        }
    ]
};

const attachProductFiles = async (product) => {
    if (!product) return;

    try {
        const ids = product.id_files ?? (product.dataValues && product.dataValues.id_files) ?? null;
        if (ids) {
            let parsed = Array.isArray(ids) ? ids : (typeof ids === 'string' ? JSON.parse(ids) : [ids]);
            parsed = parsed.map(id => Number(id)).filter(n => !isNaN(n));

            if (parsed.length) {
                const files = await File.findAll({ where: { id_file: parsed } });
                const filesById = new Map(files.map(f => [f.id_file, f]));
                product.dataValues.files = parsed.map(id => filesById.get(id) || null).filter(f => f !== null);
            } else {
                product.dataValues.files = [];
            }
        } else {
            product.dataValues.files = [];
        }
    } catch (e) {
        product.dataValues.files = [];
    }

    try {
        const singleId = product.id_file ?? (product.dataValues && product.dataValues.id_file) ?? null;
        const singleNum = singleId !== null ? Number(singleId) : null;

        if (singleNum && !isNaN(singleNum)) {
            const singleFile = await File.findByPk(singleNum);
            product.dataValues.file = singleFile || null;
        } else {
            product.dataValues.file = null;
        }
    } catch (e) {
        product.dataValues.file = null;
    }
};

const stripSpecialServiceFiles = (product) => {
    if (!product) return;

    const type = product.type ?? (product.dataValues && product.dataValues.type);
    if (type !== 'special_service') return;

    if (product.dataValues) {
        delete product.dataValues.file;
        delete product.dataValues.files;
    }

    if (Object.prototype.hasOwnProperty.call(product, 'file')) {
        delete product.file;
    }

    if (Object.prototype.hasOwnProperty.call(product, 'files')) {
        delete product.files;
    }
};

class TransactionService {
    async create({ type, date, id_user, details, status, payment_method }) {
        const t = await sequelize.transaction();

        try {
            const transaction = await Transaction.create({
                type,
                date,
                id_user,
                total: details.reduce((sum, detail) => sum + (detail.price * detail.amount), 0),
                status: typeof status !== 'undefined' ? status : undefined,
                payment_method
            }, { transaction: t });

            const detailPromises = details.map(detail =>
                DetailTransaction.create({
                    id_transaction: transaction.id_transaction,
                    id_product: detail.id_product,
                    amount: detail.amount,
                    price: detail.price
                }, { transaction: t })
            );

            await Promise.all(detailPromises);
            await t.commit();

            const qrData = await QRCodeService.createQRForTransaction({
                id_transaction: transaction.id_transaction,
                id_user: transaction.id_user,
                type: transaction.type,
                total: transaction.total,
                date: transaction.date,
                status: transaction.status
            });

            return {
                ...transaction.dataValues,
                qr_code: qrData.qr_code,
                qr_info: qrData.qr_info
            };
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    async findAll() {
        return Transaction.findAll({
            include: [{
                model: User,
                as: 'user'
            }, {
                model: DetailTransaction,
                as: 'details',
                include: [{
                    model: Product,
                    as: 'product'
                }]
            }, {
                model: QRCode,
                as: 'qr_code'
            }]
        });
    }

    async findAllByUserId(id_user) {
        return Transaction.findAll({
            where: { id_user },
            include: [{
                model: User,
                as: 'user'
            }, {
                model: DetailTransaction,
                as: 'details',
                include: [{
                    model: Product,
                    as: 'product'
                }]
            }, {
                model: QRCode,
                as: 'qr_code'
            }]
        });
    }

    async findAllDetails() {
        const transactions = await Transaction.findAll({
            include: [{
                model: DetailTransaction,
                as: 'details',
                include: [detailProductInclude]
            }, {
                model: QRCode,
                as: 'qr_code'
            }]
        });

        for (const transaction of transactions) {
            const details = transaction.details ?? (transaction.dataValues && transaction.dataValues.details) ?? [];
            for (const detail of details) {
                const product = detail.product ?? (detail.dataValues && detail.dataValues.product) ?? null;
                stripSpecialServiceFiles(product);
            }
        }

        return transactions;
    }

    async findAllDetailsByUserId(id_user) {
        const transactions = await Transaction.findAll({
            where: { id_user },
            include: [{
                model: DetailTransaction,
                as: 'details',
                include: [detailProductInclude]
            }, {
                model: QRCode,
                as: 'qr_code'
            }]
        });

        for (const transaction of transactions) {
            const details = transaction.details ?? (transaction.dataValues && transaction.dataValues.details) ?? [];
            for (const detail of details) {
                const product = detail.product ?? (detail.dataValues && detail.dataValues.product) ?? null;
                stripSpecialServiceFiles(product);
            }
        }

        return transactions;
    }

    async findOne(id) {
        const transaction = await Transaction.findByPk(id, {
            include: [{
                model: DetailTransaction,
                as: 'details',
                include: [detailProductInclude]
            }, {
                model: QRCode,
                as: 'qr_code'
            }]
        });

        if (!transaction) {
            throw new Error('Transacción no encontrada');
        }

        const details = transaction.details ?? (transaction.dataValues && transaction.dataValues.details) ?? [];
        await Promise.all(details.map(async (detail) => {
            const product = detail.product ?? (detail.dataValues && detail.dataValues.product) ?? null;
            if ((product?.type ?? (product?.dataValues && product.dataValues.type)) === 'special_service') {
                stripSpecialServiceFiles(product);
                return;
            }

            await attachProductFiles(product);
        }));

        let qrData;
        try {
            qrData = await QRCodeService.getQRByTransactionId(id);
        } catch (error) {
            qrData = await QRCodeService.createQRForTransaction({
                id_transaction: transaction.id_transaction,
                id_user: transaction.id_user,
                type: transaction.type,
                total: transaction.total,
                date: transaction.date,
                status: transaction.status
            });
        }

        return {
            ...transaction.dataValues,
            qr_code: qrData.qr_code,
            qr_info: qrData.qr_info
        };
    }

    async update(id, { type, date, id_user, details, status, payment_method }) {
        const t = await sequelize.transaction();

        try {
            const transaction = await Transaction.findByPk(id);
            if (!transaction) {
                throw new Error('Transacción no encontrada');
            }

            await transaction.update({
                type,
                date,
                id_user,
                total: details.reduce((sum, detail) => sum + (detail.price * detail.amount), 0),
                status: typeof status !== 'undefined' ? status : transaction.status,
                payment_method
            }, { transaction: t });

            await DetailTransaction.destroy({
                where: { id_transaction: id },
                transaction: t
            });

            const detailPromises = details.map(detail =>
                DetailTransaction.create({
                    id_transaction: id,
                    id_product: detail.id_product,
                    amount: detail.amount,
                    price: detail.price
                }, { transaction: t })
            );

            await Promise.all(detailPromises);
            await t.commit();

            const qrData = await QRCodeService.updateQRForTransaction({
                id_transaction: transaction.id_transaction,
                id_user: transaction.id_user,
                type: transaction.type,
                total: transaction.total,
                date: transaction.date,
                status: transaction.status
            });

            return {
                ...transaction.dataValues,
                qr_code: qrData.qr_code,
                qr_info: qrData.qr_info
            };
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    async complete(id) {
        const t = await sequelize.transaction();

        try {
            const transaction = await Transaction.findByPk(id, {
                include: [{
                    model: DetailTransaction,
                    as: 'details',
                    include: [{
                        model: Product,
                        as: 'product',
                        include: [
                            { model: Print, as: 'print' },
                            {
                                model: SpecialService,
                                as: 'special_service',
                                include: [{ model: SpecialServiceData, as: 'data' }]
                            }
                        ]
                    }]
                }],
                transaction: t
            });

            if (!transaction) {
                throw new Error('Transacción no encontrada');
            }

            if (transaction.status === 'completed') {
                await t.rollback();

                let qrData;
                try {
                    qrData = await QRCodeService.getQRByTransactionId(id);
                } catch (error) {
                    qrData = await QRCodeService.createQRForTransaction({
                        id_transaction: transaction.id_transaction,
                        id_user: transaction.id_user,
                        type: transaction.type,
                        total: transaction.total,
                        date: transaction.date,
                        status: 'completed'
                    });
                }

                return {
                    ...transaction.dataValues,
                    status: 'completed',
                    already_completed: true,
                    message: 'La transacción ya estaba finalizada',
                    qr_code: qrData.qr_code,
                    qr_info: qrData.qr_info
                };
            }

            const details = transaction.details ?? [];
            const productTypes = new Set(
                details
                    .map(detail => detail?.product?.type)
                    .filter(Boolean)
            );

            if (productTypes.has('special_service') && productTypes.size === 1) {
                await t.rollback();

                return {
                    ...transaction.dataValues,
                    status: transaction.status,
                    already_completed: false,
                    message: 'Las transacciones de special_service se completan solo al actualizar el status del servicio especial a completed'
                };
            }

            await transaction.update({ status: 'completed' }, { transaction: t });
            const printIds = new Set();

            for (const detail of details) {
                const product = detail.product;
                const directPrintId = product?.print?.id_print;
                const specialServicePrintId = product?.special_service?.data?.id_print;

                if (directPrintId) {
                    printIds.add(directPrintId);
                }

                if (specialServicePrintId) {
                    printIds.add(specialServicePrintId);
                }
            }

            if (printIds.size > 0) {
                await Print.update(
                    { status: 'completed' },
                    {
                        where: { id_print: [...printIds] },
                        transaction: t
                    }
                );
            }

            await t.commit();

            let qrData;
            try {
                qrData = await QRCodeService.updateQRForTransaction({
                    id_transaction: transaction.id_transaction,
                    id_user: transaction.id_user,
                    type: transaction.type,
                    total: transaction.total,
                    date: transaction.date,
                    status: 'completed'
                });
            } catch (error) {
                qrData = await QRCodeService.createQRForTransaction({
                    id_transaction: transaction.id_transaction,
                    id_user: transaction.id_user,
                    type: transaction.type,
                    total: transaction.total,
                    date: transaction.date,
                    status: 'completed'
                });
            }

            return {
                ...transaction.dataValues,
                status: 'completed',
                qr_code: qrData.qr_code,
                qr_info: qrData.qr_info
            };
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    async remove(id) {
        const t = await sequelize.transaction();

        try {
            const transaction = await Transaction.findByPk(id);
            if (!transaction) {
                throw new Error('Transacción no encontrada');
            }

            await DetailTransaction.destroy({
                where: { id_transaction: id },
                transaction: t
            });

            await transaction.destroy({ transaction: t });
            await t.commit();

            return true;
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    async updateFilesStatus(id, status) {
        if (!FILE_STATUSES.includes(status)) {
            throw new Error('Status inválido para file. Valores permitidos: active, inactive');
        }

        const transaction = await Transaction.findByPk(id, {
            include: [{
                model: DetailTransaction,
                as: 'details',
                include: [{
                    model: Product,
                    as: 'product'
                }]
            }]
        });

        if (!transaction) {
            throw new Error('Transacción no encontrada');
        }

        const fileIds = new Set();
        const details = transaction.details ?? [];

        for (const detail of details) {
            const product = detail.product;
            if (!product) continue;

            const singleId = product.id_file ?? (product.dataValues && product.dataValues.id_file) ?? null;
            const singleNum = singleId !== null ? Number(singleId) : null;
            if (singleNum && !isNaN(singleNum)) {
                fileIds.add(singleNum);
            }

            const manyIdsRaw = product.id_files ?? (product.dataValues && product.dataValues.id_files) ?? null;
            if (!manyIdsRaw) continue;

            let parsedIds = manyIdsRaw;
            if (typeof manyIdsRaw === 'string') {
                try {
                    parsedIds = JSON.parse(manyIdsRaw);
                } catch (e) {
                    parsedIds = [manyIdsRaw];
                }
            }

            if (!Array.isArray(parsedIds)) {
                parsedIds = [parsedIds];
            }

            parsedIds
                .map(value => Number(value))
                .filter(value => value && !isNaN(value))
                .forEach(value => fileIds.add(value));
        }

        if (fileIds.size === 0) {
            throw new Error('La transacción no tiene archivos asociados para actualizar');
        }

        await File.update(
            { status },
            { where: { id_file: [...fileIds] } }
        );

        return {
            id_transaction: transaction.id_transaction,
            files_updated: [...fileIds],
            status
        };
    }
}

export default new TransactionService();
