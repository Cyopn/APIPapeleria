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
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { min: 0 }
    },
    status: {
        type: DataTypes.ENUM("pending", "completed"),
        allowNull: false,
        defaultValue: "pending",
    },
    payament_method: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, { tableName: "transaction", timestamps: true, underscored: true });

export default Transaction;