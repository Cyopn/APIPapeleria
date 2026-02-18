import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const User = sequelize.define('user', {
    id_user: {
        type: DataTypes.INTEGER,
        primaryKey: true, autoIncrement: true
    },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    names: { type: DataTypes.STRING, allowNull: false },
    lastnames: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('default', 'student', 'professor', 'admin', 'manager', 'supervisor', 'employee'), allowNull: false, defaultValue: 'default' },
    phone: { type: DataTypes.STRING, allowNull: false },
}, { tableName: 'user', timestamps: true, underscored: true });

export default User;