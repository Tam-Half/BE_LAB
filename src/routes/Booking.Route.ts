import { Router } from "express";
import bookingController from "../controllers/Booking.Controller";
import { authentification } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authentification, bookingController.create);
router.get("/", authentification, bookingController.getAll);
router.get("/:id", bookingController.getById);
router.put("/:id", bookingController.update);
router.post("/:id/cancel", authentification, bookingController.cancel);
router.delete("/:id", bookingController.delete);
router.put('/:bookingId/room-status', bookingController.updateRoomStatus);
router.post("/:id/checkout", bookingController.checkout);
export default router;
