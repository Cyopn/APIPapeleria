import Product from "../models/product.model.js";
import Print from "../models/print.model.js";
import Item from "../models/item.model.js";
import SpecialService from "../models/sp_service.model.js";
import File from "../models/file.model.js";
import SpecialServiceData from "../models/sp_service.data.model.js";
import SpecialServiceBound from "../models/sp_service.bound.model.js";
import SpecialServiceSpiral from "../models/sp_service.spiral.model.js";
import SpecialServiceDocument from "../models/sp_service.document.model.js";
import SpecialServicePhoto from "../models/sp_service.photo.model.js";
import DetailTransaction from "../models/detail_transaction.model.js";
import sequelize from "../config/db.js";

class ProductService {
    async create({ type, description, price, filename, filehash, id_file = null, id_files = null, name, type_print, type_paper, paper_size, range, both_sides, print_amount, observations, status, mode, service_type, delivery, id_print, cover_type, cover_color, spiral_type, document_type, binding_type, photo_size, paper_type }) {
        const t = await sequelize.transaction();
        try {
            if ((filename || filehash) && !id_file && !id_files) {
                throw new Error("Para asociar un archivo primero súbelo con file.service y pasa 'id_file' o 'id_files' en el payload");
            }

            if (type === "item") {
                const existsItem = await Item.findOne({ where: { name }, transaction: t });
                if (existsItem) throw new Error("Ya existe un producto con el mismo nombre");
                const product = await Product.create({ type: type, description: description, price: price, id_file, id_files }, { transaction: t });
                const item = await Item.create({ id_item: product.id_product, name: name }, { transaction: t });
                await t.commit();
                return { id_item: product.id_product, name: item.name, type: product.type, description: product.description, price: product.price }
            } else if (type === "print") {
                const product = await Product.create({ type: type, description: description, price: price, id_file, id_files }, { transaction: t });
                const print = await Print.create({
                    id_print: product.id_product,
                    print_type: type_print,
                    paper_type: type_paper,
                    paper_size: (typeof paper_size !== 'undefined' ? paper_size : (typeof product.paper_size !== 'undefined' ? product.paper_size : '')),
                    range: (typeof range !== 'undefined' ? range : (typeof product.range !== 'undefined' ? product.range : 'all')),
                    both_sides: (typeof both_sides !== 'undefined' ? both_sides : false),
                    amount: (typeof print_amount !== 'undefined' ? print_amount : 0),
                    observations: (typeof observations !== 'undefined' ? observations : null),
                    status: typeof status !== 'undefined' ? status : undefined
                }, { transaction: t });
                await t.commit();
                return { id_item: product.id_product, type_print: print.print_type, type_paper: print.paper_type, status: print.status, type: product.type, description: product.description, price: product.price }
            } else {
                const product = await Product.create({ type: type, description: description, price: price, id_file, id_files }, { transaction: t });
                const sp_services = await SpecialService.create({ id_special_service: product.id_product, type: service_type, mode: mode, delivery: delivery, observations: observations }, { transaction: t });
                if (mode === "online") {
                    let linkedPrintId = id_print;
                    if (!linkedPrintId) {
                        if (!type_print || !type_paper) throw new Error("Faltan datos de impresión para crear el print asociado (type_print, type_paper)");
                        const printProduct = await Product.create({ type: 'print', description: `Print for special_service ${product.id_product}`, price: 0, id_file: null, id_files: null }, { transaction: t });
                        await Print.create({ id_print: printProduct.id_product, print_type: type_print, paper_type: type_paper, paper_size: (typeof paper_size !== 'undefined' ? paper_size : null), range: (typeof range !== 'undefined' ? range : null), both_sides: (typeof both_sides !== 'undefined' ? both_sides : false), amount: (typeof print_amount !== 'undefined' ? print_amount : 0), observations: (typeof observations !== 'undefined' ? observations : null), status: typeof status !== 'undefined' ? status : undefined }, { transaction: t });
                        linkedPrintId = printProduct.id_product;
                    }
                    await SpecialServiceData.create({ id_special_service_data: product.id_product, id_print: linkedPrintId }, { transaction: t });
                }

                if (service_type === "enc_imp") {
                    await SpecialServiceBound.create({
                        id_special_service_bound: product.id_product,
                        cover_type: (typeof cover_type !== 'undefined' ? cover_type : 'hard'),
                        cover_color: (typeof cover_color !== 'undefined' ? cover_color : 'red'),
                        spiral: (typeof spiral_type !== 'undefined' ? spiral_type : null)
                    }, { transaction: t });
                } else if (service_type === "ani_imp") {
                    await SpecialServiceSpiral.create({ id_special_service_spiral: product.id_product, spiral_type: spiral_type }, { transaction: t });
                } else if (service_type === "doc_esp") {
                    await SpecialServiceDocument.create({ id_special_service_document: product.id_product, document_type: document_type, binding_type: binding_type }, { transaction: t });
                } else if (service_type === "photo") {
                    await SpecialServicePhoto.create({ id_special_service_photo: product.id_product, photo_size: photo_size, paper_type: paper_type }, { transaction: t });
                }

                await t.commit();
                return { id_item: product.id_product, type: product.type, description: product.description, price: product.price }
            }
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }

    async findAll() {
        const prints = await Print.findAll();
        const items = await Item.findAll();
        const products = await Product.findAll({
            include: [
                { model: File, as: "file" },
                { model: Item, as: "item" },
                { model: Print, as: "print" },
                {
                    model: SpecialService, as: "special_service", include: [
                        { model: SpecialServiceData, as: "data" },
                        { model: SpecialServiceBound, as: "bound" },
                        { model: SpecialServiceSpiral, as: "spiral" },
                        { model: SpecialServiceDocument, as: "document" },
                        { model: SpecialServicePhoto, as: "photo" },
                    ]
                },
                { model: DetailTransaction, as: "detail_transactions" }
            ]
        });

        for (const p of products) {
            try {
                const ids = p.id_files || (p.dataValues && p.dataValues.id_files) || null;
                if (ids) {
                    const parsed = Array.isArray(ids) ? ids : (typeof ids === 'string' ? JSON.parse(ids) : [ids]);
                    const files = await File.findAll({ where: { id_file: parsed } });
                    p.dataValues.files = files;
                }
            } catch (e) {

            }
        }

        return { prints, items, products };
    }

    async findOne(id) {
        const product = await Product.findByPk(id, {
            include: [
                { model: File, as: "file" },
                { model: Item, as: "item" },
                { model: Print, as: "print" },
                {
                    model: SpecialService, as: "special_service", include: [
                        { model: SpecialServiceData, as: "data" },
                        { model: SpecialServiceBound, as: "bound" },
                        { model: SpecialServiceSpiral, as: "spiral" },
                        { model: SpecialServiceDocument, as: "document" },
                        { model: SpecialServicePhoto, as: "photo" },
                    ]
                },
                { model: DetailTransaction, as: "detail_transactions" }
            ]
        });
        if (!product) throw new Error('Producto no encontrado');
        try {
            const ids = product.id_files || (product.dataValues && product.dataValues.id_files) || null;
            if (ids) {
                const parsed = Array.isArray(ids) ? ids : (typeof ids === 'string' ? JSON.parse(ids) : [ids]);
                const files = await File.findAll({ where: { id_file: parsed } });
                product.dataValues.files = files;
            }
        } catch (e) {
        }
        return product;
    }

    async update(id, payload) {
        const t = await sequelize.transaction();
        try {
            const product = await Product.findByPk(id, { transaction: t });
            if (product === null) throw new Error("El producto no existe")

            const { description, price, id_file, id_files } = payload;
            const productUpdates = {};
            if (typeof description !== 'undefined') productUpdates.description = description;
            if (typeof price !== 'undefined') productUpdates.price = price;
            if (typeof id_file !== 'undefined') productUpdates.id_file = id_file;
            if (typeof id_files !== 'undefined') productUpdates.id_files = id_files;
            if (Object.keys(productUpdates).length) {
                await Product.update(productUpdates, { where: { id_product: id }, transaction: t });
            }

            const prodType = product.type;
            if (prodType === 'item') {
                if (typeof payload.name !== 'undefined') {
                    await Item.update({ name: payload.name }, { where: { id_item: id }, transaction: t });
                }
            } else if (prodType === 'print') {
                const printUpdates = {};
                if (typeof payload.type_print !== 'undefined') printUpdates.print_type = payload.type_print;
                if (typeof payload.paper_type !== 'undefined') printUpdates.paper_type = payload.paper_type;
                if (typeof payload.paper_size !== 'undefined') printUpdates.paper_size = payload.paper_size;
                if (typeof payload.range !== 'undefined') printUpdates.range = payload.range;
                if (typeof payload.both_sides !== 'undefined') printUpdates.both_sides = payload.both_sides;
                if (typeof payload.print_amount !== 'undefined') printUpdates.amount = payload.print_amount;
                if (typeof payload.observations !== 'undefined') printUpdates.observations = payload.observations;
                if (typeof payload.status !== 'undefined') printUpdates.status = payload.status;
                if (Object.keys(printUpdates).length) await Print.update(printUpdates, { where: { id_print: id }, transaction: t });
            } else if (prodType === 'special_service') {
                const ssUpdates = {};
                if (typeof payload.service_type !== 'undefined') ssUpdates.type = payload.service_type;
                if (typeof payload.mode !== 'undefined') ssUpdates.mode = payload.mode;
                if (Object.keys(ssUpdates).length) await SpecialService.update(ssUpdates, { where: { id_special_service: id }, transaction: t });

                if (typeof payload.id_print !== 'undefined') {
                    const existsData = await SpecialServiceData.findOne({ where: { id_special_service_data: id }, transaction: t });
                    if (existsData) {
                        await SpecialServiceData.update({ id_print: payload.id_print }, { where: { id_special_service_data: id }, transaction: t });
                    } else {
                        await SpecialServiceData.create({ id_special_service_data: id, id_print: payload.id_print }, { transaction: t });
                    }
                }

                if (typeof payload.cover_type !== 'undefined' || typeof payload.cover_color !== 'undefined') {
                    const existsBound = await SpecialServiceBound.findOne({ where: { id_special_service_bound: id }, transaction: t });
                    const boundUpdates = {};
                    if (typeof payload.cover_type !== 'undefined') boundUpdates.cover_type = payload.cover_type;
                    if (typeof payload.cover_color !== 'undefined') boundUpdates.cover_color = payload.cover_color;
                    if (existsBound) await SpecialServiceBound.update(boundUpdates, { where: { id_special_service_bound: id }, transaction: t });
                    else await SpecialServiceBound.create(Object.assign({ id_special_service_bound: id }, boundUpdates), { transaction: t });
                }

                if (typeof payload.spiral_type !== 'undefined') {
                    const existsSpiral = await SpecialServiceSpiral.findOne({ where: { id_special_service_spiral: id }, transaction: t });
                    if (existsSpiral) await SpecialServiceSpiral.update({ spiral_type: payload.spiral_type }, { where: { id_special_service_spiral: id }, transaction: t });
                    else await SpecialServiceSpiral.create({ id_special_service_spiral: id, spiral_type: payload.spiral_type }, { transaction: t });
                }

                if (typeof payload.document_type !== 'undefined' || typeof payload.binding_type !== 'undefined') {
                    const existsDoc = await SpecialServiceDocument.findOne({ where: { id_special_service_document: id }, transaction: t });
                    const docUpdates = {};
                    if (typeof payload.document_type !== 'undefined') docUpdates.document_type = payload.document_type;
                    if (typeof payload.binding_type !== 'undefined') docUpdates.binding_type = payload.binding_type;
                    if (existsDoc) await SpecialServiceDocument.update(docUpdates, { where: { id_special_service_document: id }, transaction: t });
                    else await SpecialServiceDocument.create(Object.assign({ id_special_service_document: id }, docUpdates), { transaction: t });
                }

                if (typeof payload.photo_size !== 'undefined' || typeof payload.paper_type !== 'undefined') {
                    const existsPhoto = await SpecialServicePhoto.findOne({ where: { id_special_service_photo: id }, transaction: t });
                    const photoUpdates = {};
                    if (typeof payload.photo_size !== 'undefined') photoUpdates.photo_size = payload.photo_size;
                    if (typeof payload.paper_type !== 'undefined') photoUpdates.paper_type = payload.paper_type;
                    if (existsPhoto) await SpecialServicePhoto.update(photoUpdates, { where: { id_special_service_photo: id }, transaction: t });
                    else await SpecialServicePhoto.create(Object.assign({ id_special_service_photo: id }, photoUpdates), { transaction: t });
                }
            }

            await t.commit();
            return this.findOne(id);
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }

    async remove(id) {
        const t = await sequelize.transaction();
        try {
            await SpecialServiceData.destroy({ where: { id_special_service_data: id }, transaction: t });
            await SpecialServiceBound.destroy({ where: { id_special_service_bound: id }, transaction: t });
            await SpecialServiceSpiral.destroy({ where: { id_special_service_spiral: id }, transaction: t });
            await SpecialServiceDocument.destroy({ where: { id_special_service_document: id }, transaction: t });
            await SpecialServicePhoto.destroy({ where: { id_special_service_photo: id }, transaction: t });

            await DetailTransaction.destroy({ where: { id_product: id }, transaction: t });

            await Item.destroy({ where: { id_item: id }, transaction: t });
            await Print.destroy({ where: { id_print: id }, transaction: t });
            await SpecialService.destroy({ where: { id_special_service: id }, transaction: t });
            await Product.destroy({ where: { id_product: id }, transaction: t });

            await t.commit();
            return { message: 'Producto eliminado' };
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }
}

export default new ProductService();
