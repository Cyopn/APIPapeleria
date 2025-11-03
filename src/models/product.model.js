import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Product = sequelize.define("product", {
    id_product: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    type: {
        type: DataTypes.ENUM("item", "print"),
        allowNull: false,
    },
    description: { type: DataTypes.STRING, allowNull: true },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    filename: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    filehash: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, { tableName: "product", timestamps: true });

export default Product;
