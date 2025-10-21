import { DataTypes } from "sequelize";
import sequelize from "../config/db";

const File = sequelize.define("file", {
    id_file: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    id_user: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "user", key: "id_user" },
    },
    name_file: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM("active", "inactive"),
        allowNull: false,
        defaultValue: "active",
    }
}, { tableName: "file", timestamps: true });

export default File;