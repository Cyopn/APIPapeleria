import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const SpecialService = sequelize.define("special_service", {
    id_special_service: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: { model: "product", key: "id_product" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    },
    type: {
        type: DataTypes.ENUM("enc_imp", "ani_imp", "doc_esp", "photo"),
        allowNull: false,
    },
    mode: {
        type: DataTypes.ENUM("online", "presential"),
        allowNull: false,
    },
    delivery: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    observations: {
        type: DataTypes.TEXT,
        allowNull: true
    },
}, {
    tableName: "special_service",
    timestamps: true,
    underscored: true
});

export default SpecialService;
