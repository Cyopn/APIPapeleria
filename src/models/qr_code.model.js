import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const QRCode = sequelize.define("qr_code", {
    id_qr: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    id_transaction: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "transaction",
            key: "id_transaction",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        unique: true
    },
    qr_data: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: "JSON con datos de la transacción para el QR"
    },
    qr_image_base64: {
        type: DataTypes.TEXT('long'),
        allowNull: false,
        comment: "Imagen del QR en formato base64"
    },
    qr_info: {
        type: DataTypes.STRING(500),
        allowNull: false,
        comment: "Información legible del QR"
    },
    generated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: "Fecha y hora de generación del QR"
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: "Indica si el QR está activo"
    },
    scan_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "Número de veces que se ha escaneado el QR"
    },
    last_scanned_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "Última fecha de escaneo del QR"
    }
}, {
    tableName: "qr_code",
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['id_transaction']
        },
        {
            fields: ['is_active']
        },
        {
            fields: ['generated_at']
        }
    ]
});

export default QRCode;