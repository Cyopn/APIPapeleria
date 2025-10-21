import sequelize from "../config/db.js";
import User from "./user.model.js";
import Item from "./item.model.js";
import Print from "./print.model.js";
import SpecialService from "./sp_service.model.js";
import PayamentMethod from "./payament_method.model.js";
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



const db = { sequelize, User, PayamentMethod, Product, Transaction, DetailTransaction };

export default db;