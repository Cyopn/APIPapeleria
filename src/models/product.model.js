import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Product = sequelize.define("product", {
    id_product: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    type: {
        type: DataTypes.ENUM("item", "print", "special_service",),
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { min: 0 }
    },
    id_file: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "file", key: "id_file" },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
    },
    id_files: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Array de ids de archivos asociados'
    },
}, {
    tableName: "product",
    timestamps: true,
    underscored: true
});

export default Product;
