import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import env from "../config/env.js";
import User from "../models/user.model.js";
import File from "../models/file.model.js";

class UserService {
    getAvatarInclude() {
        return {
            model: File,
            as: "file",
            attributes: ["filehash", "type"],
            where: { type: "avatar" },
            required: false
        };
    }

    buildUserWithAvatar(user, baseUrl = "") {
        const data = user.toJSON();
        const avatarFile = Array.isArray(data.file) ? data.file[0] : null;
        const avatar = avatarFile && avatarFile.type === "avatar"
            ? `${baseUrl}/api/file-manager/download/avatar/${avatarFile.filehash}`
            : null;

        return {
            ...data,
            avatar,
            file: undefined
        };
    }

    async create({ username, names, lastnames, email, password, role, phone }) {
        const exists = await User.findOne({ where: { username } });
        if (exists) throw new Error("Usuario ya existe");
        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ username: username, names: names, lastnames: lastnames, email: email, password: hashed, role: role, phone: phone });
        return { id: user.id_user || user.id, username: user.username, names: user.names, lastnames: user.lastnames, email: user.email, role: user.role, phone: user.phone };
    }

    async findAll(baseUrl = "") {
        const users = await User.findAll({
            attributes: ["id_user", "username", "names", "lastnames", "email", "role", "phone", "createdAt", "updatedAt"],
            include: [this.getAvatarInclude()]
        });

        return users.map((user) => this.buildUserWithAvatar(user, baseUrl));
    }

    async findOne(id, baseUrl = "") {
        const user = await User.findByPk(id, {
            include: [this.getAvatarInclude()]
        });
        if (!user) throw new Error("Usuario no encontrado");
        return this.buildUserWithAvatar(user, baseUrl);
    }

    async update(id, { username, names, lastnames, email, password, role, phone }) {
        const user = await User.findByPk(id);
        if (!user) throw new Error("Usuario no encontrado");
        const hashed = password ? await bcrypt.hash(password, 10) : user.password;
        await User.update({ username, names, lastnames, email, password: hashed, role, phone }, { where: { id_user: id } });
        return this.findOne(id);
    }

    async remove(id) {
        await User.destroy({ where: { id_user: id } });
        return { message: 'Usuario eliminado' };
    }

    async login({ username, password }, baseUrl = "") {
        const user = await User.findOne({
            where: { username },
            include: [this.getAvatarInclude()]
        });
        if (!user) throw new Error("Usuario no encontrado");
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) throw new Error("Contraseña incorrecta");
        const token = jwt.sign(
            { id: user.id_user || user.id, username: user.username },
            env.JWT_SECRET,
        );
        return { token, user: this.buildUserWithAvatar(user, baseUrl) };
    }

    async changePassword(userId, { currentPassword, newPassword }) {
        if (!currentPassword || !newPassword) {
            throw new Error("Debes enviar currentPassword y newPassword");
        }

        if (currentPassword === newPassword) {
            throw new Error("La nueva contraseña debe ser diferente a la actual");
        }

        const user = await User.findByPk(userId);
        if (!user) throw new Error("Usuario no encontrado");

        const valid = await bcrypt.compare(currentPassword, user.password);
        if (!valid) throw new Error("Contraseña actual incorrecta");

        const hashed = await bcrypt.hash(newPassword, 10);
        await User.update({ password: hashed }, { where: { id_user: userId } });

        return { message: "Contraseña actualizada correctamente" };
    }
}

export default new UserService();
