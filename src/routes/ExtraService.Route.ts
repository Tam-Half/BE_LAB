import { Router } from "express";
import extraServiceController from "../controllers/ExtraService.Controller";

const router = Router();

router.get("/", extraServiceController.getAll);
router.get("/:id", extraServiceController.getById);
router.post("/", extraServiceController.create);
router.patch("/:id", extraServiceController.update);
router.delete("/:id", extraServiceController.delete);

export default router;
