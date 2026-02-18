import { Router } from "express";
import paymentController from "../controllers/Payment.Controller";

const router = Router();

router.post("/", paymentController.create);
router.post("/payos/create-link", paymentController.createPayOSLink);
router.post("/payos/webhook", paymentController.handleWebhook);
router.post("/payos/verify-status", paymentController.verifyPaymentStatus);
router.get("/", paymentController.getAll);
router.get("/:id", paymentController.getById);
router.put("/:id", paymentController.update);
router.delete("/:id", paymentController.delete);

export default router;
