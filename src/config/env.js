import dotenv from 'dotenv';
dotenv.config();

export default {
    PORT: process.env.PORT,
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
    JWT_SECRET: process.env.JWT_SECRET,
    KEY_SECRET: process.env.KEY_SECRET,
    PUPPETEER_EXECUTABLE_PATH: process.env.PUPPETEER_EXECUTABLE_PATH
}

export const PRICING = {
    PAPER_PRICE_CARTA: parseFloat(process.env.PAPER_PRICE_CARTA),
    PAPER_PRICE_OFICIO: parseFloat(process.env.PAPER_PRICE_OFICIO),
    BW_PRICE_PER_PAGE: parseFloat(process.env.BW_PRICE_PER_PAGE),
    COLOR_FACTOR: parseFloat(process.env.COLOR_FACTOR),
    COLOR_MIN: parseFloat(process.env.COLOR_MIN),
    COLOR_BASE_COST: parseFloat(process.env.COLOR_BASE_COST),
    COLOR_STANDARD_PRICE: parseFloat(process.env.COLOR_STANDARD_PRICE),
    COVER_PRICE_DURA: parseFloat(process.env.COVER_PRICE_DURA),
    COVER_PRICE_BLANDA: parseFloat(process.env.COVER_PRICE_BLANDA),
    COVER_PRICE_HARD: parseFloat(process.env.COVER_PRICE_HARD),
    COVER_PRICE_SOFT: parseFloat(process.env.COVER_PRICE_SOFT),
    BINDING_PRICE_ESPIRAL: parseFloat(process.env.BINDING_PRICE_ESPIRAL),
    BINDING_PRICE_ENCOLADA: parseFloat(process.env.BINDING_PRICE_ENCOLADA),
    BINDING_PRICE_SPIRAL: parseFloat(process.env.BINDING_PRICE_SPIRAL),
    BINDING_PRICE_GLUE: parseFloat(process.env.BINDING_PRICE_GLUE),
    PRICE_PRECISION: parseInt(process.env.PRICE_PRECISION, 10)
};