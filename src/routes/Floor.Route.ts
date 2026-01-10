import { Router } from "express";
import floorController from "../controllers/Floor.Controller";

const router = Router();

router.post("/", floorController.create);
router.patch("/:id", floorController.update);
router.delete("/:id", floorController.delete);

export default router;
