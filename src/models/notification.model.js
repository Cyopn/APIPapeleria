import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Notification = sequelize.define("notification", {
    id_notification: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    type: {
        type: DataTypes.ENUM(
            "print_status_changed",
            "special_service_status_changed",
            "transaction_updated"
        ),
        allowNull: false,
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    id_user: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "user",
            key: "id_user"
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    }
}, {
    tableName: "notification",
    timestamps: true,
    underscored: true,
});

export default Notification;
