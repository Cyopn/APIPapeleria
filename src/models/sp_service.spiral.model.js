import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const SpecialServiceSpiral = sequelize.define("special_service_spiral", {
    id_special_service_spiral: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: { model: "special_service", key: "id_special_service" }
    },
    spiral_type: {
        type: DataTypes.ENUM("stapled", "glued", "sewn"),
        allowNull: false
    },
}, {
    tableName: "special_service_spiral",
    timestamps: true
});

export default SpecialServiceSpiral;