import productService from "../services/product.service.js";

export const createProduct = async (req, res, next) => {
    try {
        const payload = normalizeProductPayload(req.body);
        const product = await productService.create(payload);
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
        const payload = normalizeProductPayload(req.body);
        const product = await productService.update(id, payload);
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

function normalizeProductPayload(body = {}) {
    const p = Object.assign({}, body);
    if (typeof p.typePrint !== 'undefined' && typeof p.type_print === 'undefined') p.type_print = p.typePrint;
    if (typeof p.typePaper !== 'undefined' && typeof p.type_paper === 'undefined') p.type_paper = p.typePaper;
    if (typeof p.paperSize !== 'undefined' && typeof p.paper_size === 'undefined') p.paper_size = p.paperSize;
    if (typeof p.printAmount !== 'undefined' && typeof p.print_amount === 'undefined') p.print_amount = p.printAmount;
    if (typeof p.bothSides !== 'undefined' && typeof p.both_sides === 'undefined') p.both_sides = p.bothSides;
    if (typeof p.serviceType !== 'undefined' && typeof p.service_type === 'undefined') p.service_type = p.serviceType;
    if (typeof p.coverType !== 'undefined' && typeof p.cover_type === 'undefined') p.cover_type = p.coverType;
    if (typeof p.coverColor !== 'undefined' && typeof p.cover_color === 'undefined') p.cover_color = p.coverColor;
    if (typeof p.spiralType !== 'undefined' && typeof p.spiral_type === 'undefined') p.spiral_type = p.spiralType;
    if (typeof p.documentType !== 'undefined' && typeof p.document_type === 'undefined') p.document_type = p.documentType;
    if (typeof p.bindingType !== 'undefined' && typeof p.binding_type === 'undefined') p.binding_type = p.bindingType;
    if (typeof p.type_print !== 'undefined' && typeof p.typePrint === 'undefined') p.typePrint = p.type_print; // keep both for compatibility
    return p;
}
