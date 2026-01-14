import { Router } from "express";
import roomController from "../controllers/Room.Controller";

const router = Router();

router.post("/", roomController.create);
router.patch("/:id", roomController.update);
router.delete("/:id", roomController.delete);
router.get("/", roomController.getAll);

export default router;
