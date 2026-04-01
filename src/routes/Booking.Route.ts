import { Router } from "express";
import bookingController from "../controllers/Booking.Controller";
import { authentification } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authentification, bookingController.create);
router.get("/", authentification, bookingController.getAll);
router.get("/:id", bookingController.getById);
router.put("/:id", bookingController.update);
router.delete("/:id", bookingController.delete);
router.put('/:bookingId/room-status', bookingController.updateRoomStatus);
export default router;
