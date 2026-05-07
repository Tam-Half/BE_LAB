import { Router } from "express";
import RoomClassController from "../controllers/RoomClass.Controller";

const router = Router();

router.get("/", RoomClassController.getAll);
router.get("/:id", RoomClassController.getById);
router.post("/", RoomClassController.create);
router.put("/:id", RoomClassController.update);
router.delete("/:id", RoomClassController.delete);

export default router;
