import { Router } from "express";
import { updateFile, listFiles, getFile, uploadFile, deleteFile } from "../controllers/file.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post('/', authMiddleware, updateFile);
router.get('/', authMiddleware, listFiles);
router.get('/:id', authMiddleware, getFile);
router.put('/:id', authMiddleware, updateFile);
router.delete('/:id', authMiddleware, deleteFile);