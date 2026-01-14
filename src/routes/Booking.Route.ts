import { Router } from "express";
import bookingController from "../controllers/Booking.Controller";

const router = Router();

router.post("/", bookingController.create);
router.get("/", bookingController.getAll);
router.get("/:id", bookingController.getById);
router.put("/:id", bookingController.update);
router.delete("/:id", bookingController.delete);

export default router;
