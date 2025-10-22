import { Router } from "express";
import { uploadFile } from "../config/multer.js";
import { uploadFiles, downloadFile, getAllFiles } from "../controllers/file_manager.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", authMiddleware, uploadFile.array("files", 10), uploadFiles);
router.get("/download/:filename",authMiddleware, downloadFile);
router.get("/",authMiddleware, getAllFiles);

export default router;