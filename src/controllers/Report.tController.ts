import { Request, Response } from "express";
import { reportService, DashboardType } from "../services/Report.Service";

// ─── GET /api/reports/dashboard ────────────────────────────────────────────
//
// Query params:
//   type       : "today" | "week" | "month" | "quarter" | "custom"  (mặc định: "month")
//   startDate  : ISO string – bắt buộc khi type=custom
//   endDate    : ISO string – bắt buộc khi type=custom
//   hotelId    : number     – tuỳ chọn, lọc theo khách sạn cụ thể
//
export async function getDashboardData(req: Request, res: Response) {
    try {
        const type = (req.query.type as DashboardType) ?? "month";
        const hotelId = req.query.hotelId ? Number(req.query.hotelId) : undefined;
        const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
        const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

        const VALID_TYPES: DashboardType[] = ["today", "week", "month", "quarter", "custom"];
        if (!VALID_TYPES.includes(type)) {
            return res.status(400).json({
                success: false,
                message: `Giá trị type không hợp lệ. Phải là một trong: ${VALID_TYPES.join(", ")}`,
            });
        }

        if (type === "custom" && (!startDate || !endDate)) {
            return res.status(400).json({
                success: false,
                message: "startDate và endDate là bắt buộc khi type=custom",
            });
        }

        if (startDate && isNaN(startDate.getTime())) {
            return res.status(400).json({ success: false, message: "startDate không hợp lệ" });
        }
        if (endDate && isNaN(endDate.getTime())) {
            return res.status(400).json({ success: false, message: "endDate không hợp lệ" });
        }

        const data = await reportService.getDashboardData(type, startDate, endDate, hotelId);

        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        console.error("[ReportController] getDashboardData error:", error);
        return res.status(500).json({
            success: false,
            message: error?.message ?? "Lỗi server khi lấy dữ liệu dashboard",
        });
    }
}

// ─── GET /api/reports/compare ──────────────────────────────────────────────
//
// Query params:
//   month1  : "YYYY-MM"  (ví dụ: "2024-01")
//   month2  : "YYYY-MM"  (ví dụ: "2024-02")
//   hotelId : number – tuỳ chọn
//
export async function getMonthlyComparison(req: Request, res: Response) {
    try {
        const { month1: m1, month2: m2, hotelId: hId } = req.query;

        if (!m1 || !m2) {
            return res.status(400).json({
                success: false,
                message: "month1 và month2 là bắt buộc (định dạng YYYY-MM)",
            });
        }

        const parseMonth = (raw: string): { year: number; month: number } | null => {
            const parts = raw.split("-");
            if (parts.length !== 2) return null;
            const year = parseInt(parts[0]);
            const month = parseInt(parts[1]);
            if (isNaN(year) || isNaN(month) || month < 1 || month > 12) return null;
            return { year, month };
        };

        const month1 = parseMonth(m1 as string);
        const month2 = parseMonth(m2 as string);

        if (!month1 || !month2) {
            return res.status(400).json({
                success: false,
                message: "Định dạng month1/month2 phải là YYYY-MM (ví dụ: 2024-01)",
            });
        }

        const hotelId = hId ? Number(hId) : undefined;
        const data = await reportService.getMonthlyComparison(month1, month2, hotelId);

        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        console.error("[ReportController] getMonthlyComparison error:", error);
        return res.status(500).json({
            success: false,
            message: error?.message ?? "Lỗi server khi so sánh tháng",
        });
    }
}