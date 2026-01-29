import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const SpecialServicePhoto = sequelize.define("special_service_photo", {
    id_special_service_photo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: { model: "special_service", key: "id_special_service" }
    },
    photo_size: { type: DataTypes.STRING, allowNull: false },
    paper_type: { type: DataTypes.ENUM("bright", "mate", "satiny"), allowNull: false },
}, { tableName: "special_service_photo", timestamps: true });

export default SpecialServicePhoto;