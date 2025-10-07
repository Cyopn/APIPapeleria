import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import env from "../config/env.js";
import User from "../models/user.model.js";

class UserService {
    async register({ username, names, lastnames, email, password, role }) {
        const exists = await User.findOne({ where: { username } });
        if (exists) throw new Error("Usuario ya existe");
        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ username: username, names: names, lastnames: lastnames, email: email, password: hashed, role: role });
        return { id: user.id, username: user.username, names: user.names, lastnames: user.lastnames, email: user.email, password: user.hashed, role: user.role };
    }
    async login({ username, password }) {
        const user = await User.findOne({ where: { username } });
        if (!user) throw new Error("Usuario no encontrado");
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) throw new Error("Contraseña incorrecta");
        const token = jwt.sign(
            { id: user.id, username: user.username },
            env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        return { token };
    }
    async listUsers() {
        return await User.findAll({ attributes: ["id", "username", "createdAt"] });
    }
}

export default new UserService();
