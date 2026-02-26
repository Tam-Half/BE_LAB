import { Router } from "express";
import shiftController from "../controllers/Shift.Controller"; 

const shiftRouter = Router();

shiftRouter.get("/current", shiftController.getCurrentShift);
// 1. Mở ca làm việc
// Method: POST
// URL: /api/shifts/start
// Body: { "staffId": "uuid...", "initialCash": 500000 }
shiftRouter.post("/start", shiftController.startShift);

// 2. Xem chi tiết/thống kê của ca (Dùng để xem báo cáo hoặc in bill chốt ca)
// Method: GET
// URL: /api/shifts/123
shiftRouter.get("/:id", shiftController.getStats);

// 3. Chốt ca
// Method: POST
// URL: /api/shifts/123/end
// Body: { "actualCash": 5500000, "note": "Ổn áp" }
shiftRouter.post("/:id/end", shiftController.endShift);


export default shiftRouter;