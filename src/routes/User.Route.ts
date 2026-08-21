import { Router } from "express";
import userController from "../controllers/User.Controller";
import { authentification, checkRole } from "../middleware/auth.middleware";
import { UserRole } from "../dto/Enums";

const router = Router();

router.post("/", userController.signup);
router.get("/profile", authentification, userController.getProfile);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);

// Các route quản trị (Admin)
router.get("/admin/accounts", authentification, checkRole([UserRole.ADMIN]), userController.getAccountsForAdmin);
router.put("/admin/accounts/:id", authentification, checkRole([UserRole.ADMIN]), userController.updateAccountByAdmin);
router.put("/admin/accounts/:id/password", authentification, checkRole([UserRole.ADMIN]), userController.resetPasswordByAdmin);

export default router;