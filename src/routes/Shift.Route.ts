import { Router } from "express";
import shiftController from "../controllers/Shift.Controller";

const shiftRouter = Router();

shiftRouter.get("/", shiftController.getAllShifts);
shiftRouter.get("/current", shiftController.getCurrentShift);
shiftRouter.post("/start", shiftController.startShift);

shiftRouter.get("/:id", shiftController.getStats);

shiftRouter.post("/:id/end", shiftController.endShift);


export default shiftRouter;