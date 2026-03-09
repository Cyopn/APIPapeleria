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
import User from '../models/user.model.js';
import sequelize from '../config/db.js';
import QRCodeService from './qr_code.service.js';

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

    async findAllDetails() {
        return Transaction.findAll({
            include: [{
                model: DetailTransaction,
                as: 'details',
                include: [detailProductInclude]
            }, {
                model: QRCode,
                as: 'qr_code'
            }]
        });
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
}

export default new TransactionService();
