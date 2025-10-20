import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Transaction = sequelize.define("transaction", {
    id_transaction: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    type: {
        type: DataTypes.ENUM("compra", "venta"),
        allowNull: false,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    id_user: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "user",
            key: "id_user",
        },
    },
    total: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
}, { tableName: "transaction", timestamps: true });

export default Transaction;