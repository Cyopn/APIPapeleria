import { Router } from "express";
import { createUser, listUsers, getUser, updateUser, deleteUser, login } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post('/', createUser);
router.post('/login', login);
router.get('/', authMiddleware, listUsers);
router.get('/:id', authMiddleware, getUser);
router.put('/:id', authMiddleware, updateUser);
router.delete('/:id', authMiddleware, deleteUser);

export default router;
