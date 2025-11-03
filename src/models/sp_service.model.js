import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const SpecialService = sequelize.define("special_service", {
    id_special_service: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: { model: "product", key: "id_product" }
    },
    name: { type: DataTypes.STRING, allowNull: false },
}, { tableName: "special_service", timestamps: true });

export default SpecialService;