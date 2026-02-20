import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: process.env.DB_PORT,
    timezone: process.env.DB_TIMEZONE || '-06:00',
    dialectOptions: {
        timezone: process.env.DB_TIMEZONE || '-06:00',
        ssl: {
            require: true,
            rejectUnauthorized: false,
            charset: 'utf8mb4',
        }
    },
    define: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
    },
});
export default sequelize;