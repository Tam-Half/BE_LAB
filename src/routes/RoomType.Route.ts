import { Router } from "express";
import roomTypeController from "../controllers/RoomType.Controller";
import upload from "../middleware/upload";

const router = Router();

router.get("/", roomTypeController.getAll);
router.post("/", upload.array("images"), roomTypeController.create);
router.patch("/:id", roomTypeController.update);
router.delete("/:id", roomTypeController.delete);


export default router;
