import { Router } from "express";
import reviewController from "../controllers/Review.Controller";
import { authentification } from "../middleware/auth.middleware";

const router = Router();

// Public routes
router.get("/room-type/:id", reviewController.getByRoomType);

// Protected routes
router.post("/", authentification, reviewController.create);
router.patch("/:id/visibility", authentification, reviewController.toggleVisibility);

export default router;
