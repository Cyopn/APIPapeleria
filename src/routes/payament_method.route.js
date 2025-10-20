import { Router } from "express";
import { createPayamentMethod, listPayamentMethods, getPayamentMethod, updatePayamentMethod, deletePayamentMethod } from "../controllers/payament_method.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post('/', authMiddleware, createPayamentMethod);
router.get('/', authMiddleware, listPayamentMethods);
router.get('/:id', authMiddleware, getPayamentMethod);
router.put('/:id', authMiddleware, updatePayamentMethod);
router.delete('/:id', authMiddleware, deletePayamentMethod);

export default router;
