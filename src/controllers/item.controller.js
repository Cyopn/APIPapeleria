import itemService from "../services/item.service.js";

export const save = async (req, res, next) => {
    try {
        const item = await itemService.save(req.body);
        res.status(201).json(item);
    } catch (err) {
        next(err);
    }
};

export const update = async (req, res, next) => {
    try {
        const item = await itemService.update(req.body);
        res.json(item);
    } catch (err) {
        next(err);
    }
};

export const listItems = async (req, res, next) => {
    try {
        const items = await itemService.listItems();
        res.json(items);
    } catch (err) {
        next(err);
    }
};
