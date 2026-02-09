import { Router } from "express";
import AvailabilityController from "../controllers/Availability.Controller";

const router = Router();

router.post("/search", AvailabilityController.search);

export default router;
