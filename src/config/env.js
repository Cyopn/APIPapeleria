import dotenv from 'dotenv';
dotenv.config();

export default {
    PORT: process.env.PORT || 4000,
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_USER: process.env.DB_USER || 'user',
    DB_PASSWORD: process.env.DB_PASSWORD || 'password',
    DB_NAME: process.env.DB_NAME || 'database',
    JWT_SECRET: process.env.JWT_SECRET || 'huevo',
    KEY_SECRET: process.env.KEY_SECRET || 'huevo'
}

export const PRICING = {
    PAPER_PRICE_CARTA: parseFloat(process.env.PAPER_PRICE_CARTA) || 0.05,
    PAPER_PRICE_OFICIO: parseFloat(process.env.PAPER_PRICE_OFICIO) || 0.07,
    BW_FACTOR: parseFloat(process.env.BW_FACTOR) || 0.6,
    BW_MIN: parseFloat(process.env.BW_MIN) || 0.4,
    BW_PRICE_PER_PAGE: parseFloat(process.env.BW_PRICE_PER_PAGE) || 0.5,
    PRICE_PRECISION: parseInt(process.env.PRICE_PRECISION || '4', 10)
};