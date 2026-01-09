import { Router } from "express";
const router = Router();
import userController from "../controllers/User.Controller";

router.post("/", userController.signup);

export default router;