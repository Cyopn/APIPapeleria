import printerService from "../services/printer.service.js";

export const createPrinter = async (req, res, next) => {
    try {
        const payload = req.body;
        const printer = await printerService.create(payload);
        res.status(201).json(printer);
    } catch (err) {
        next(err);
    }
};

export const listPrinters = async (req, res, next) => {
    try {
        const printers = await printerService.findAll();
        res.json(printers);
    } catch (err) {
        next(err);
    }
};

export const getPrinter = async (req, res, next) => {
    try {
        const { id } = req.params;
        const printer = await printerService.findOne(id);
        res.json(printer);
    } catch (err) {
        next(err);
    }
};

export const updatePrinter = async (req, res, next) => {
    try {
        const { id } = req.params;
        const payload = req.body;
        const printer = await printerService.update(id, payload);
        res.json(printer);
    } catch (err) {
        next(err);
    }
};

export const deletePrinter = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await printerService.remove(id);
        res.json(result);
    } catch (err) {
        next(err);
    }
};
