import multer from "multer";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import env from "./env.js";

const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const service = req.query.service || "general";
        const dir = `./src/public/${service}`;
        await fs.mkdir(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const userIdentifier = req.body.username || req.body.id || "anon";
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext);
        const hash = crypto.createHmac("sha256", env.KEY_SECRET)
            .update(userIdentifier + baseName + Date.now())
            .digest("hex")
            .slice(0, 16);
        cb(null, `${hash}${ext}`);
    },
});

function fileFilter(req, file, cb) {
    const allowedMimes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",
    ];
    if (allowedMimes.includes(file.mimetype)) cb(null, true);
    else cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`));
}

export const uploadFile = multer({
    storage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 },
});
