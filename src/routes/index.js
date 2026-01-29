import { Router } from "express";
import userRoutes from "./user.route.js";
import productRoutes from "./product.route.js";
import transactionRoutes from "./transaction.route.js";
import fileRoutes from "./file.route.js";
import fileManagerRoutes from "../routes/file_manager.route.js";
import printingPriceRoutes from "./printing_price.route.js";
import qrCodeRoutes from "./qr_code.route.js";


const router = Router();

router.use("/users", userRoutes);
router.use("/products", productRoutes);
router.use("/transactions", transactionRoutes);
router.use("/files", fileRoutes);
router.use("/file-manager", fileManagerRoutes);
router.use("/printing-price", printingPriceRoutes);
router.use("/qr-codes", qrCodeRoutes);

export default router;
