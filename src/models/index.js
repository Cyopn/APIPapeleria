import sequelize from "../config/db.js";
import User from "./user.model.js";
import Item from "./item.model.js";
import Print from "./print.model.js";
import PayamentMethod from "./payament_method.model.js";
import Product from "./product.model.js";
import Transaction from "./transaction.model.js";
import DetailTransaction from "./detail_transaction.model.js";

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
    foreignKey: "id_printF",
    as: "product"
});

Transaction.hasMany(DetailTransaction, {
    foreignKey: "id_transaction",
    as: "details"
});

DetailTransaction.belongsTo(Transaction, {
    foreignKey: "id_transaction",
    as: "transaction"
});

Transaction.belongsTo(User, {
    foreignKey: "id_user",
    as: "user"
});

User.hasMany(Transaction, {
    foreignKey: "id_user",
    as: "transactions"
});

DetailTransaction.belongsTo(Product, {
    foreignKey: "id_product",
    as: "product"
});

Product.hasMany(DetailTransaction, {
    foreignKey: "id_product",
    as: "detail_transactions"
});

const db = { sequelize, User, PayamentMethod, Product, Transaction, DetailTransaction };

export default db;