import fileManagerService from "../services/file_manager.service.js";

export const uploadFiles = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0)
            return next("No se enviaron archivos");
        const service = req.query.service || "general";
        const usernameOrId = req.body.username || req.body.id || "anon";
        const files = [];
        for (const f of req.files) {
            await fileManagerService.addFileMetadata(
                usernameOrId,
                service,
                f.filename,
                f.originalname,
                f.mimetype
            );
            files.push({
                originalName: f.originalname,
                storedName: f.filename,
                mimetype: f.mimetype,
                service,
                downloadUrl: `${req.protocol}://${req.get("host")}/api/file_manager/download/${service}/${f.filename}`
            });
        }
        return res.json(files);
    } catch (error) {
        next(error);
    }
};

export const downloadFile = async (req, res, next) => {
    try {
        const { service, filename } = req.params;
        const filePath = await fileManagerService.getFilePath(service, filename);
        res.download(filePath);
    } catch (error) {
        next(error);
    }
};

export const getUserFiles = async (req, res, next) => {
    try {
        const { usernameOrId } = req.params;
        const files = await fileManagerService.listUserFiles(usernameOrId);
        res.json(files);
    } catch (error) {
        next(error);
    }
};

export const getServiceFiles = async (req, res, next) => {
    try {
        const { service } = req.params;
        const files = await fileManagerService.listServiceFiles(service);
        res.json(files);
    } catch (error) {
        next(error);
    }
};
