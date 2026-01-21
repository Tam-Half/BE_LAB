import { Router } from "express";
import floorController from "../controllers/Floor.Controller";

const router = Router();

router.post("/", floorController.create);
router.patch("/:id", floorController.update);
router.delete("/:id", floorController.delete);
router.get("/", floorController.getAll);


export default router;
