import { Router } from "express";
import paymentController from "../controllers/Payment.Controller";

const router = Router();

router.post("/", paymentController.create);
router.get("/", paymentController.getAll);
router.get("/:id", paymentController.getById);
router.put("/:id", paymentController.update);
router.delete("/:id", paymentController.delete);

export default router;
