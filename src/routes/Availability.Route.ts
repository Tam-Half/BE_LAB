import { Router } from "express";
import AvailabilityController from "../controllers/Availability.Controller";

const router = Router();

router.post("/search", AvailabilityController.search);
router.post("/available-rooms", AvailabilityController.getAvailableRooms);

export default router;
