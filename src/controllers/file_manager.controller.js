import fileManagerService from "../services/file_manager.service.js";

export const uploadFiles = (req, res, next) => {
    if (!req.files || req.files.length === 0) return next("No se enviaron archivos")
    const files = req.files.map(f => ({
        originalName: f.originalName,
        storeName: f.storeName,
        mimetype: f.mimetype,
        downloadUrl: `${req.protocol}://${req.get("host")}/api/file_manager/download/${f.filename}`
    }));

    return res.json(files)
}

export const downloadFile = async (req, res, next) => {
    try {
        const filePath = await fileManagerService.getFilePath(req.params.filename);
        res.download(filePath);
    } catch (error) {
        next(error)
    }
}

export const getAllFiles = async (req, res, next) => {
    try {
        const files = await fileManagerService.listFiles();
        res.json(files);
    } catch (error) {
        next(error)
    }
}
