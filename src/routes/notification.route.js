import { Router } from "express";
import {
    streamNotifications,
    listNotifications,
    listNotificationsByUser,
    markNotificationAsRead,
    deleteNotification
} from "../controllers/notification.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/stream/:id_user", authMiddleware, streamNotifications);
router.get("/", authMiddleware, listNotifications);
router.get("/user/:id_user", authMiddleware, listNotificationsByUser);
router.patch("/:id/read", authMiddleware, markNotificationAsRead);
router.delete("/:id", authMiddleware, deleteNotification);

export default router;
