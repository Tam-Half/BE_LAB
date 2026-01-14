import { Router } from "express";
import roomTypeController from "../controllers/RoomType.Controller";

const router = Router();

router.post("/", roomTypeController.create);
router.patch("/:id", roomTypeController.update);
router.delete("/:id", roomTypeController.delete);
router.get("/", roomTypeController.getAll);

export default router;
