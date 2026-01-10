import { Router } from "express";
const router = Router();
import hotelController from "../controllers/Hotel.Controller";

router.post("/", hotelController.create);
router.patch("/:id", hotelController.update);
router.delete("/:id", hotelController.delete);

export default router;