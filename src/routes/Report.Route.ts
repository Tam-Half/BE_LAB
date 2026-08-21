import { Router } from "express";
import { getDashboardData, getMonthlyComparison } from "../controllers/Report.tController";
import { authentification } from "../middleware/auth.middleware";

const router = Router();


router.get("/dashboard", getDashboardData);
router.get("/compare", getMonthlyComparison);

export default router;
