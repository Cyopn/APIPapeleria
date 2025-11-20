import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const PayamentMethod = sequelize.define('payament_method', {
    id_payament_method: {
        type: DataTypes.INTEGER,
        primaryKey: true, autoIncrement: true
    },
    type: { type: DataTypes.STRING, allowNull: true }
}, { tableName: 'payament_method', timestamps: true, underscored: true });

export default PayamentMethod;