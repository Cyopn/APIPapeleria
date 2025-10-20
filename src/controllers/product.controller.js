import productService from "../services/product.service.js";

export const createProduct = async (req, res, next) => {
    try {
        const product = await productService.create(req.body);
        res.status(201).json(product);
    } catch (err) {
        next(err);
    }
};

export const listProducts = async (req, res, next) => {
    try {
        const products = await productService.findAll();
        res.json(products);
    } catch (err) {
        next(err);
    }
};

export const getProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await productService.findOne(id);
        res.json(product);
    } catch (err) {
        next(err);
    }
};

export const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await productService.update(id, req.body);
        res.json(product);
    } catch (err) {
        next(err);
    }
};

export const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await productService.remove(id);
        res.json(result);
    } catch (err) {
        next(err);
    }
};