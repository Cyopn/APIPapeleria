import fileService from "../services/file.service.js";

export const createFile = async (req, res, next) => {
    try {
        if (Array.isArray(req.body)) {
            const files = await fileService.uploadMany(req.body);
            return res.status(201).json(files);
        } else {
            const file = await fileService.upload(req.body);
            return res.status(201).json(file);
        }
    } catch (error) {
        next(error);
    }
}

export const listFiles = async (req, res, next) => {
    try {
        const files = await fileService.findAll();
        return res.json(files);
    } catch (error) {
        next(error);
    }
}

export const getFile = async (req, res, next) => {
    try {
        const { id } = req.params;
        const file = await fileService.findOne(id);
        return res.json(file);
    } catch (error) {
        next(error);
    }
}

export const updateFile = async (req, res, next) => {
    try {
        const { id } = req.params;
        const file = await fileService.update(id, req.body);
        return res.json(file)
    } catch (error) {
        next(error);
    }
}

export const deleteFile = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await fileService.remove(id);
        return res.json(result);
    } catch (error) {
        next(error);
    }
}