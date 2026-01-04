import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Print = sequelize.define("print", {
    id_print: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: { model: "product", key: "id_product" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    },
    print_type: { type: DataTypes.STRING, allowNull: false },
    paper_type: { type: DataTypes.STRING, allowNull: false },
    paper_size: { type: DataTypes.STRING, allowNull: false },
    range: { type: DataTypes.STRING, allowNull: false },
    both_sides: { type: DataTypes.BOOLEAN, allowNull: false },
    amount: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0 } },
    observations: { type: DataTypes.TEXT, allowNull: true },
    status: {
        type: DataTypes.ENUM("pending", "in_progress", "completed"),
        allowNull: false,
        defaultValue: "pending",
    }
}, { tableName: "print", timestamps: true, underscored: true });

export default Print;