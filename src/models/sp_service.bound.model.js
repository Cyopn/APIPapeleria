import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const SpecialServiceBound = sequelize.define("special_service_bound", {
    id_special_service_bound: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: { model: "special_service", key: "id_special_service" }
    },
    cover_type: {
        type: DataTypes.ENUM("hard", "soft"),
        allowNull: false
    },
    cover_color: {
        type: DataTypes.ENUM("red", "green", "blue", "yellow"),
        allowNull: false
    },
    spiral: { type: DataTypes.ENUM("plastic", "gluing") }
}, {
    tableName: "special_service_bound",
    timestamps: true
});

export default SpecialServiceBound;