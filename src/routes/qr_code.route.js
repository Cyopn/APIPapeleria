import { Router } from "express";
import { rebuildAllQRCodes, getQRStats, deactivateQR, getQRDetails } from "../controllers/qr_code.controller.js";

const router = Router();

router.post("/rebuild-all", rebuildAllQRCodes);
router.get("/stats", getQRStats);
router.get("/:transactionId/details", getQRDetails);
router.put("/:transactionId/deactivate", deactivateQR);

export default router;