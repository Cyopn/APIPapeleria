import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const SpecialServiceData = sequelize.define("special_service_data", {
    id_special_service_data: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: { model: "special_service", key: "id_special_service" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    },
    id_print: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "print", key: "id_print" }
    },
}, {
    tableName: "special_service_data",
    timestamps: true
});

export default SpecialServiceData;
