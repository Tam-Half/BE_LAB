import { Router } from "express";
const router = Router();
import hotelController from "../controllers/Hotel.Controller";

router.patch("/:id", hotelController.update);