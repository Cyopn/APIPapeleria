import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Printer = sequelize.define("printer", {
    id_printer: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM("available", "busy", "offline"),
        allowNull: false,
        defaultValue: "available",
    },
    connection_type: {
        type: DataTypes.ENUM("network", "usb"),
        allowNull: false,
    },
    ip: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    port: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    port_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    driver: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    model: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    serial_number: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    mac_address: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status:{
        type: DataTypes.ENUM("available", "busy", "offline"),
        allowNull: false,
        defaultValue: "available",
    }
}, {
    tableName: "printer",
    timestamps: true,
    underscored: true,
});

export default Printer;
