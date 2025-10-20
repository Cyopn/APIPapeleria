import payamentService from "../services/payament_method.service.js";

export const createPayamentMethod = async (req, res, next) => {
    try {
        const pm = await payamentService.create(req.body);
        return res.status(201).json(pm);
    } catch (error) {
        next(error);
    }
}

export const listPayamentMethods = async (req, res, next) => {
    try {
        const pms = await payamentService.findAll();
        return res.json(pms);
    } catch (error) {
        next(error);
    }
}

export const getPayamentMethod = async (req, res, next) => {
    try {
        const { id } = req.params;
        const pm = await payamentService.findOne(id);
        return res.json(pm);
    } catch (error) {
        next(error);
    }
}

export const updatePayamentMethod = async (req, res, next) => {
    try {
        const { id } = req.params;
        const pm = await payamentService.update(id, req.body);
        return res.json(pm);
    } catch (error) {
        next(error);
    }
}

export const deletePayamentMethod = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await payamentService.remove(id);
        return res.json(result);
    } catch (error) {
        next(error);
    }
}
