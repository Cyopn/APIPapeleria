import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import env from "../config/env.js";
import User from "../models/user.model.js";

class UserService {
    async create({ username, names, lastnames, email, password, role, phone }) {
        const exists = await User.findOne({ where: { username } });
        if (exists) throw new Error("Usuario ya existe");
        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ username: username, names: names, lastnames: lastnames, email: email, password: hashed, role: role, phone: phone });
        return { id: user.id_user || user.id, username: user.username, names: user.names, lastnames: user.lastnames, email: user.email, role: user.role, phone: user.phone };
    }

    async findAll() {
        return await User.findAll({ attributes: ["id_user", "username", "names", "lastnames", "email", "role", "phone", "createdAt", "updatedAt"] });
    }

    async findOne(id) {
        const user = await User.findByPk(id);
        if (!user) throw new Error("Usuario no encontrado");
        return user;
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

    async login({ username, password }) {
        const user = await User.findOne({ where: { username } });
        if (!user) throw new Error("Usuario no encontrado");
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) throw new Error("Contraseña incorrecta");
        const token = jwt.sign(
            { id: user.id_user || user.id, username: user.username },
            env.JWT_SECRET,
        );
        return { token, user: user.dataValues };
    }
}

export default new UserService();
