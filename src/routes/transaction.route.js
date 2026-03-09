import { Router } from "express";
import {
    createTransaction,
    listTransactions,
    listTransactionsDetails,
    getTransaction,
    updateTransaction,
    deleteTransaction,
    generateTransactionQR,
    scanQR
} from "../controllers/transaction.controller.js";

const router = Router();

router.post("/", createTransaction);
router.post("/scan-qr", scanQR);
router.get("/", listTransactions);
router.get("/details", listTransactionsDetails);
router.get("/:id", getTransaction);
router.get("/:id/qr", generateTransactionQR);
router.put("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);

export default router;
