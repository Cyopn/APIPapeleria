import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const SpecialServiceDocument = sequelize.define("special_service_document", {
    id_special_service_document: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: { model: "special_service", key: "id_special_service" }
    },
    document_type: { type: DataTypes.ENUM("tesis", "reporte", "examen","otro"), allowNull: false },
}, { tableName: "special_service_document", timestamps: true });

export default SpecialServiceDocument;