import { Router } from "express";
import userRoutes from "./user.route.js";
import productRoutes from "./product.route.js";
import paymentMethodRoutes from "./payament_method.route.js";
import transactionRoutes from "./transaction.route.js";
import fileRoutes from "./file.route.js";


const router = Router();

router.use("/users", userRoutes);
router.use("/products", productRoutes);
router.use("/payment-methods", paymentMethodRoutes);
router.use("/transactions", transactionRoutes);
router.use("/files", fileRoutes)

export default router;
