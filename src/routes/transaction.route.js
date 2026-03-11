import { Router } from "express";
import {
    createTransaction,
    listTransactions,
    listTransactionsByUser,
    listTransactionsDetails,
    listTransactionsDetailsByUser,
    getTransaction,
    updateTransaction,
    completeTransaction,
    updateTransactionFilesStatus,
    deleteTransaction,
    generateTransactionQR,
    scanQR
} from "../controllers/transaction.controller.js";

const router = Router();

router.post("/", createTransaction);
router.post("/scan-qr", scanQR);
router.get("/", listTransactions);
router.get("/details", listTransactionsDetails);
router.get("/user/:id_user", listTransactionsByUser);
router.get("/user/:id_user/details", listTransactionsDetailsByUser);
router.get("/:id", getTransaction);
router.get("/:id/qr", generateTransactionQR);
router.put("/:id", updateTransaction);
router.patch("/:id/complete", completeTransaction);
router.patch("/:id/files/status", updateTransactionFilesStatus);
router.delete("/:id", deleteTransaction);

export default router;
