import jwt from "jsonwebtoken";
import env from "../config/env.js";

export const authMiddleware = (req, res, next) => {
    const header = req.headers["authorization"];
    const queryToken = req.query?.token;

    if (!header && !queryToken) return res.status(401).json({ message: "Sin token proporcionado" });

    const token = header ? header.split(" ")[1] : queryToken;
    jwt.verify(token, env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Token inválido" });
        req.user = decoded;
        next();
    });
};
