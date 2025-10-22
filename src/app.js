import express from "express";
import helmet from "helmet";
import routes from "./routes/index.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { notFoundMiddleware } from "./middlewares/notfound.middleware.js";
import cors from "cors";
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('./public', express.static('./public'));
app.use(express.static('./public'))
app.use("/api", routes);
app.use(errorMiddleware);
app.use(notFoundMiddleware(routes));


export default app;
