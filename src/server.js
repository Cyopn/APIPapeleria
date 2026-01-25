import dotenv from "dotenv";
dotenv.config();

import http from "http";
import env from "./config/env.js";
import app from "./app.js";
import db from "./models/index.js";

const server = http.createServer(app);

const start = async () => {
    try {
        await db.sequelize.authenticate();
        await db.sequelize.sync({ alter: true });
        server.listen(env.PORT, () => {
            console.log(`Servidor en http://localhost:${env.PORT}`);
        });
    } catch (err) {
        console.error("Error al iniciar servidor:", err);
    }
};

start();
