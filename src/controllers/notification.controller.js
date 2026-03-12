import notificationService from "../services/notification.service.js";

export const streamNotifications = async (req, res, next) => {
    try {
        const userId = Number(req.params?.id_user);
        if (!userId) {
            return res.status(400).json({ error: "id_user inválido" });
        }

        const authUserId = Number(req.user?.id);
        if (!authUserId || authUserId !== userId) {
            return res.status(403).json({ error: "No autorizado para escuchar notificaciones de este usuario" });
        }

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("X-Accel-Buffering", "no");

        if (typeof res.flushHeaders === "function") {
            res.flushHeaders();
        }

        res.write("retry: 10000\n\n");

        const recent = await notificationService.findByUser(userId);
        notificationService.sendSSE(res, "init", recent.slice(0, 30));

        const clientId = notificationService.subscribeUser(userId, res);
        notificationService.sendSSE(res, "connected", {
            user_id: userId,
            connected_at: new Date().toISOString()
        });

        const heartbeat = setInterval(() => {
            res.write(`: ping ${Date.now()}\n\n`);
        }, 25000);

        req.on("close", () => {
            clearInterval(heartbeat);
            notificationService.unsubscribeUser(userId, clientId);
            res.end();
        });
    } catch (err) {
        next(err);
    }
};

export const listNotifications = async (req, res, next) => {
    try {
        const notifications = await notificationService.findAll();
        res.json(notifications);
    } catch (err) {
        next(err);
    }
};

export const listNotificationsByUser = async (req, res, next) => {
    try {
        const { id_user } = req.params;
        const notifications = await notificationService.findByUser(id_user);
        res.json(notifications);
    } catch (err) {
        next(err);
    }
};

export const markNotificationAsRead = async (req, res, next) => {
    try {
        const { id } = req.params;
        const notification = await notificationService.markAsRead(id);
        res.json(notification);
    } catch (err) {
        next(err);
    }
};

export const deleteNotification = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await notificationService.remove(id);
        res.json(result);
    } catch (err) {
        next(err);
    }
};
