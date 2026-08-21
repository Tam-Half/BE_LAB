import { Router } from "express";
import roomTypeController from "../controllers/RoomType.Controller";
import upload from "../middleware/upload";

const router = Router();

router.get("/", roomTypeController.getAll);
router.get("/:id", roomTypeController.getById);
router.post("/", upload.array("images"), roomTypeController.create);
router.patch("/:id", upload.array("images"), roomTypeController.update);
router.delete("/:id", roomTypeController.delete);


export default router;
