import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Item = sequelize.define('item', {
    id_item: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: { model: "product", key: "id_product" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    available: {
        type: DataTypes.BOOLEAN,
        allowNull: false, defaultValue: true
    },
    category: {
        type: DataTypes.ENUM("oficina", "papeleria", "arte_y_diseno", "otros"),
        allowNull: false
    },
}, {
    tableName: 'item',
    timestamps: true,
    underscored: true
});

export default Item;