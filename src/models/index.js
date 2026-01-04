import sequelize from "../config/db.js";
import User from "./user.model.js";
import Item from "./item.model.js";
import Print from "./print.model.js";
import SpecialService from "./sp_service.model.js";
import SpecialServiceData from "./sp_service.data.model.js";
import SpecialServiceBound from "./sp_service.bound.model.js";
import SpecialServiceSpiral from "./sp_service.spiral.model.js";
import SpecialServiceDocument from "./sp_service.document.model.js";
import Product from "./product.model.js";
import Transaction from "./transaction.model.js";
import DetailTransaction from "./detail_transaction.model.js";
import File from "./file.model.js";

Product.hasOne(Item, {
    foreignKey: "id_item",
    as: "item"
});

Item.belongsTo(Product, {
    foreignKey: "id_item",
    as: "product"
});

Product.hasOne(Print, {
    foreignKey: "id_print",
    as: "print"
});

Print.belongsTo(Product, {
    foreignKey: "id_print",
    as: "product"
});

Product.hasOne(SpecialService, {
    foreignKey: "id_special_service",
    as: "special_service"
});

SpecialService.belongsTo(Product, {
    foreignKey: "id_special_service",
    as: "product"
})

SpecialService.hasOne(SpecialServiceData, {
    foreignKey: "id_special_service_data",
    as: "data"
});
SpecialServiceData.belongsTo(SpecialService, {
    foreignKey: "id_special_service_data",
    as: "special_service"
});

SpecialService.hasOne(SpecialServiceBound, {
    foreignKey: "id_special_service_bound",
    as: "bound"
});
SpecialServiceBound.belongsTo(SpecialService, {
    foreignKey: "id_special_service_bound",
    as: "special_service"
});

SpecialService.hasOne(SpecialServiceSpiral, {
    foreignKey: "id_special_service_spiral",
    as: "spiral"
});
SpecialServiceSpiral.belongsTo(SpecialService, {
    foreignKey: "id_special_service_spiral",
    as: "special_service"
});

SpecialService.hasOne(SpecialServiceDocument, {
    foreignKey: "id_special_service_document",
    as: "document"
});
SpecialServiceDocument.belongsTo(SpecialService, {
    foreignKey: "id_special_service_document",
    as: "special_service"
});

Transaction.hasMany(DetailTransaction, {
    foreignKey: "id_transaction",
    as: "details"
});

DetailTransaction.belongsTo(Transaction, {
    foreignKey: "id_transaction",
    as: "transaction"
});

User.hasMany(Transaction, {
    foreignKey: "id_user",
    as: "transactions"
});

Transaction.belongsTo(User, {
    foreignKey: "id_user",
    as: "user"
});

Product.hasMany(DetailTransaction, {
    foreignKey: "id_product",
    as: "detail_transactions"
});

DetailTransaction.belongsTo(Product, {
    foreignKey: "id_product",
    as: "product"
});

User.hasMany(File, {
    foreignKey: "id_user",
    as: "file"
});

File.belongsTo(User, {
    foreignKey: "id_user",
    as: "user"
});

File.hasMany(Product, {
    foreignKey: "id_file",
    as: "products"
});

Product.belongsTo(File, {
    foreignKey: "id_file",
    as: "file"
});

const db = {
    sequelize,
    User,
    Product,
    Item,
    Print,
    SpecialService,
    SpecialServiceData,
    SpecialServiceBound,
    SpecialServiceSpiral,
    SpecialServiceDocument,
    Transaction,
    DetailTransaction,
    File
};

export default db;
