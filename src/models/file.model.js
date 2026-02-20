import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

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
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    },
    filename: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM("active", "inactive"),
        allowNull: false,
        defaultValue: "active",
    },
    type: {
        type: DataTypes.ENUM("image", "document", "other"),
        allowNull: false
    },
    filehash: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}, {
    tableName: "file",
    timestamps: true,
    underscored: true
});

export default File;