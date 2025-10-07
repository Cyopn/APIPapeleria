import express from "express";
import helmet from "helmet";
import routes from "./routes/index.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { notFoundMiddleware } from "./middlewares/notfound.middleware.js";
const app = express();

app.use(helmet());
app.use(express.json());
app.use("/api", routes);
app.use(errorMiddleware);
app.use(notFoundMiddleware(routes));

export default app;
