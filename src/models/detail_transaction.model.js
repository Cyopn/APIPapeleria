// models/DetalleTransaccion.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js"

const DetailTransaction = sequelize.define("detail_transaction", {
    id_detail_transaction: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    id_transaction: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "transaction",
            key: "id_transaction",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    },
    id_product: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "product",
            key: "id_product",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 0 }
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { min: 0 }
    },
}, { tableName: "detail_transaction", timestamps: true, underscored: true });

export default DetailTransaction;