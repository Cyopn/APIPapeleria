import { Router } from "express";
import { updateFile, listFiles, getFile, deleteFile, createFile } from "../controllers/file.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post('/', authMiddleware, createFile);
router.get('/', authMiddleware, listFiles);
router.get('/:id', authMiddleware, getFile);
router.put('/:id', authMiddleware, updateFile);
router.delete('/:id', authMiddleware, deleteFile);

export default router;