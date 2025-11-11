import { Router } from "express";
import { uploadFile } from "../config/multer.js";
import {
    uploadFiles,
    downloadFile,
    getUserFiles,
    getServiceFiles
} from "../controllers/file_manager.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", authMiddleware, uploadFile.array("files", 10), uploadFiles);
router.get("/download/:service/:filename", downloadFile);
router.get("/user/:usernameOrId", authMiddleware, getUserFiles);
router.get("/service/:service", authMiddleware, getServiceFiles);

export default router;