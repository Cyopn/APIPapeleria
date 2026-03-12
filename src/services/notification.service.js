import Notification from "../models/notification.model.js";

class NotificationService {
    constructor() {
        this.sseClients = new Map();
        this.nextClientId = 1;
    }

    sendSSE(res, event, data) {
        res.write(`event: ${event}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    }

    subscribeUser(userId, res) {
        const key = String(userId);
        if (!this.sseClients.has(key)) {
            this.sseClients.set(key, new Map());
        }

        const id = this.nextClientId++;
        this.sseClients.get(key).set(id, res);
        return id;
    }

    unsubscribeUser(userId, clientId) {
        const key = String(userId);
        const userClients = this.sseClients.get(key);
        if (!userClients) return;

        userClients.delete(clientId);
        if (userClients.size === 0) {
            this.sseClients.delete(key);
        }
    }

    emitToUser(userId, event, payload) {
        const key = String(userId);
        const userClients = this.sseClients.get(key);
        if (!userClients) return;

        for (const [clientId, res] of userClients.entries()) {
            try {
                this.sendSSE(res, event, payload);
            } catch (error) {
                userClients.delete(clientId);
            }
        }

        if (userClients.size === 0) {
            this.sseClients.delete(key);
        }
    }

    publishNotification(notification) {
        const payload = notification?.toJSON ? notification.toJSON() : notification;
        if (!payload) return;

        if (payload.id_user !== null && typeof payload.id_user !== "undefined") {
            this.emitToUser(payload.id_user, "notification", payload);
        }
    }

    async create({ type, message, id_user = null, metadata = null }, options = {}) {
        const notification = await Notification.create({ type, message, id_user, metadata }, options);

        if (options.transaction && typeof options.transaction.afterCommit === "function") {
            options.transaction.afterCommit(() => {
                this.publishNotification(notification);
            });
        } else {
            this.publishNotification(notification);
        }

        return notification;
    }

    async findAll() {
        return Notification.findAll({ order: [["createdAt", "DESC"]] });
    }

    async findByUser(id_user) {
        return Notification.findAll({
            where: { id_user },
            order: [["createdAt", "DESC"]]
        });
    }

    async markAsRead(id) {
        const notification = await Notification.findByPk(id);
        if (!notification) throw new Error("Notificación no encontrada");
        await Notification.update({ is_read: true }, { where: { id_notification: id } });
        return Notification.findByPk(id);
    }

    async remove(id) {
        const deleted = await Notification.destroy({ where: { id_notification: id } });
        if (!deleted) throw new Error("Notificación no encontrada");
        return { message: "Notificación eliminada" };
    }
}

export default new NotificationService();
