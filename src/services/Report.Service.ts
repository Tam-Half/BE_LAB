import { AppDataSource } from "../data-source"; // điều chỉnh đường dẫn nếu cần
import { Booking } from "../dto/Booking";
import { BookingDetail } from "../dto/BookingDetail";
import { Room } from "../dto/Room";
import { BookingStatus, PaymentStatus } from "../dto/Enums";
import { Between, LessThanOrEqual, MoreThanOrEqual } from "typeorm";

// ─── Types ────────────────────────────────────────────────────────────────────

export type DashboardType = "today" | "week" | "month" | "quarter" | "custom";

export interface DataPoint {
    label: string;      // nhãn trục X: "08:00", "Mon", "W1", "Jan"
    revenue: number;
    bookings: number;
}

export interface RoomTypeBreakdown {
    name: string;
    value: number;      // số đêm được đặt
    revenue: number;
}

export interface RecentTransaction {
    id: number;
    booking_code: string;
    guest_name: string;
    guest_email: string;
    check_in_date: Date;
    check_out_date: Date;
    total_price: number;
    status: string;
    payment_status: string;
    created_at: Date;
}

export interface DashboardStats {
    totalRevenue: number;
    totalBookings: number;
    occupancyRate: number;   // %
    revPAR: number;          // Revenue Per Available Room
    avgBookingValue: number;
}

export interface DashboardData {
    stats: DashboardStats;
    chartData: DataPoint[];
    roomTypeData: RoomTypeBreakdown[];
    recentTransactions: RecentTransaction[];
}

export interface MonthlyComparisonData {
    month1: { label: string; revenue: number; bookings: number; occupancyRate: number };
    month2: { label: string; revenue: number; bookings: number; occupancyRate: number };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

function startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

function endOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

/**
 * Tính số ngày giữa 2 mốc (tối thiểu 1).
 */
function daysBetween(start: Date, end: Date): number {
    const ms = end.getTime() - start.getTime();
    return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

/**
 * Lấy tổng số phòng hiện có trong hệ thống (dùng để tính occupancy & RevPAR).
 * Nếu multi-hotel, truyền thêm hotelId để lọc.
 */
async function getTotalRooms(hotelId?: number): Promise<number> {
    const roomRepo = AppDataSource.getRepository(Room);
    const qb = roomRepo.createQueryBuilder("room");

    if (hotelId) {
        qb.innerJoin("room.floor", "floor")
            .where("floor.hotel_id = :hotelId", { hotelId });
    }

    return qb.getCount();
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class ReportService {

    // ── Lấy dữ liệu dashboard chính ────────────────────────────────────────

    async getDashboardData(
        type: DashboardType,
        startDate?: Date,
        endDate?: Date,
        hotelId?: number
    ): Promise<DashboardData> {

        // 1. Xác định khoảng thời gian
        const now = new Date();
        let rangeStart: Date;
        let rangeEnd: Date;

        switch (type) {
            case "today":
                rangeStart = startOfDay(now);
                rangeEnd = endOfDay(now);
                break;
            case "week": {
                const day = now.getDay(); // 0 = CN
                rangeStart = startOfDay(addDays(now, -day));
                rangeEnd = endOfDay(addDays(rangeStart, 6));
                break;
            }
            case "month":
                rangeStart = new Date(now.getFullYear(), now.getMonth(), 1);
                rangeEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
                break;
            case "quarter": {
                const q = Math.floor(now.getMonth() / 3);
                rangeStart = new Date(now.getFullYear(), q * 3, 1);
                rangeEnd = new Date(now.getFullYear(), q * 3 + 3, 0, 23, 59, 59);
                break;
            }
            case "custom":
                if (!startDate || !endDate) throw new Error("startDate và endDate là bắt buộc khi type=custom");
                rangeStart = startOfDay(startDate);
                rangeEnd = endOfDay(endDate);
                break;
        }

        const bookingRepo = AppDataSource.getRepository(Booking);

        // 2. Truy vấn bookings đã xác nhận / hoàn thành trong khoảng
        const qb = bookingRepo.createQueryBuilder("b")
            .leftJoinAndSelect("b.user", "user")
            .leftJoinAndSelect("b.bookingDetails", "bd")
            .leftJoinAndSelect("bd.roomType", "rt")  // BookingDetail → RoomType
            .where("b.check_in_date BETWEEN :start AND :end", {
                start: rangeStart,
                end: rangeEnd
            })
            .andWhere("b.status IN (:...statuses)", {
                statuses: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED]
            });

        if (hotelId) qb.andWhere("b.hotel_id = :hotelId", { hotelId });

        const bookings = await qb.getMany();

        // 3. Tổng doanh thu & booking
        const totalRevenue = bookings.reduce((s, b) => s + Number(b.total_price), 0);
        const totalBookings = bookings.length;
        const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

        // 4. Occupancy & RevPAR
        const totalRooms = await getTotalRooms(hotelId);
        const totalDays = daysBetween(rangeStart, rangeEnd);
        const availableRoomNights = totalRooms * totalDays;

        // Tổng số đêm đã đặt = sum(checkout - checkin) của từng booking
        const bookedNights = bookings.reduce((s, b) => {
            return s + daysBetween(b.check_in_date, b.check_out_date);
        }, 0);

        const occupancyRate = availableRoomNights > 0
            ? Math.min(100, (bookedNights / availableRoomNights) * 100)
            : 0;
        const revPAR = availableRoomNights > 0
            ? totalRevenue / availableRoomNights
            : 0;

        // 5. Chart data – nhóm theo loại
        const chartData = this.buildChartData(bookings, type, rangeStart, rangeEnd);

        // 6. Room type breakdown (từ BookingDetail)
        const roomTypeMap = new Map<string, { value: number; revenue: number }>();
        for (const b of bookings) {
            const nights = daysBetween(b.check_in_date, b.check_out_date);
            for (const bd of b.bookingDetails ?? []) {
                const name = bd.roomType?.name ?? "Không rõ";
                const prev = roomTypeMap.get(name) ?? { value: 0, revenue: 0 };
                // Giả sử bd.quantity là số phòng, bd.unit_price là giá/đêm/phòng
                const bdRevenue = Number(bd.price_at_booking ?? 0) * (bd.quantity ?? 1) * nights;
                roomTypeMap.set(name, {
                    value: prev.value + (bd.quantity ?? 1) * nights,
                    revenue: prev.revenue + bdRevenue,
                });
            }
        }
        const roomTypeData: RoomTypeBreakdown[] = Array.from(roomTypeMap.entries()).map(
            ([name, v]) => ({ name, ...v })
        );

        // 7. 10 giao dịch gần nhất
        const recentBookings = await bookingRepo.find({
            where: hotelId ? { hotel: { id: hotelId } } : {},
            order: { created_at: "DESC" },
            take: 10,
            relations: ["user"],
        });

        const recentTransactions: RecentTransaction[] = recentBookings.map(b => ({
            id: b.id,
            booking_code: b.booking_code,
            guest_name: b.guest_name ?? b.user?.account?.username ?? "—",
            guest_email: b.guest_email ?? b.user?.account?.email ?? "—",
            check_in_date: b.check_in_date,
            check_out_date: b.check_out_date,
            total_price: Number(b.total_price),
            status: b.status,
            payment_status: b.payment_status,
            created_at: b.created_at,
        }));

        return {
            stats: {
                totalRevenue,
                totalBookings,
                occupancyRate: Math.round(occupancyRate * 10) / 10,
                revPAR: Math.round(revPAR),
                avgBookingValue: Math.round(avgBookingValue),
            },
            chartData,
            roomTypeData,
            recentTransactions,
        };
    }

    // ── So sánh 2 tháng ────────────────────────────────────────────────────

    async getMonthlyComparison(
        month1: { year: number; month: number },   // month: 1-12
        month2: { year: number; month: number },
        hotelId?: number
    ): Promise<MonthlyComparisonData> {

        const [data1, data2] = await Promise.all([
            this.getMonthSummary(month1.year, month1.month, hotelId),
            this.getMonthSummary(month2.year, month2.month, hotelId),
        ]);

        const MONTH_VI = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];

        return {
            month1: { label: `${MONTH_VI[month1.month - 1]}/${month1.year}`, ...data1 },
            month2: { label: `${MONTH_VI[month2.month - 1]}/${month2.year}`, ...data2 },
        };
    }

    // ── Private helpers ────────────────────────────────────────────────────

    private async getMonthSummary(year: number, month: number, hotelId?: number) {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59);

        const bookingRepo = AppDataSource.getRepository(Booking);
        const qb = bookingRepo.createQueryBuilder("b")
            .where("b.check_in_date BETWEEN :start AND :end", { start, end })
            .andWhere("b.status IN (:...statuses)", {
                statuses: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED]
            });
        if (hotelId) qb.andWhere("b.hotel_id = :hotelId", { hotelId });

        const bookings = await qb.getMany();
        const totalRevenue = bookings.reduce((s, b) => s + Number(b.total_price), 0);
        const totalBookings = bookings.length;

        const totalRooms = await getTotalRooms(hotelId);
        const totalDays = daysBetween(start, end);
        const bookedNights = bookings.reduce((s, b) => s + daysBetween(b.check_in_date, b.check_out_date), 0);
        const occupancyRate = totalRooms * totalDays > 0
            ? Math.min(100, (bookedNights / (totalRooms * totalDays)) * 100)
            : 0;

        return {
            revenue: Math.round(totalRevenue),
            bookings: totalBookings,
            occupancyRate: Math.round(occupancyRate * 10) / 10,
        };
    }

    /**
     * Nhóm bookings thành các điểm dữ liệu cho biểu đồ.
     * today    → theo giờ (00-23)
     * week     → theo ngày trong tuần (Mon-Sun)
     * month    → theo ngày trong tháng (1-31)
     * quarter  → theo tuần (W1-W13)
     * custom   → theo ngày nếu ≤31 ngày, theo tuần nếu ≤90, theo tháng nếu lớn hơn
     */
    private buildChartData(
        bookings: Booking[],
        type: DashboardType,
        rangeStart: Date,
        rangeEnd: Date
    ): DataPoint[] {

        const totalDays = daysBetween(rangeStart, rangeEnd);

        if (type === "today") {
            return this.groupByHour(bookings, rangeStart);
        }
        if (type === "week") {
            return this.groupByDayOfWeek(bookings, rangeStart);
        }
        if (type === "month") {
            return this.groupByDayInMonth(bookings, rangeStart);
        }
        if (type === "quarter") {
            return this.groupByWeek(bookings, rangeStart, rangeEnd);
        }
        // custom
        if (totalDays <= 31) return this.groupByDayInMonth(bookings, rangeStart);
        if (totalDays <= 90) return this.groupByWeek(bookings, rangeStart, rangeEnd);
        return this.groupByMonth(bookings, rangeStart, rangeEnd);
    }

    private groupByHour(bookings: Booking[], day: Date): DataPoint[] {
        const map: Record<string, DataPoint> = {};
        for (let h = 0; h < 24; h++) {
            const label = `${String(h).padStart(2, "0")}:00`;
            map[label] = { label, revenue: 0, bookings: 0 };
        }
        for (const b of bookings) {
            const h = b.created_at.getHours();
            const label = `${String(h).padStart(2, "0")}:00`;
            if (map[label]) {
                map[label].revenue += Number(b.total_price);
                map[label].bookings += 1;
            }
        }
        return Object.values(map);
    }

    private groupByDayOfWeek(bookings: Booking[], weekStart: Date): DataPoint[] {
        const DAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
        const map: Record<string, DataPoint> = {};
        for (let i = 0; i < 7; i++) {
            const d = addDays(weekStart, i);
            const label = DAY_LABELS[d.getDay()];
            map[label] = { label, revenue: 0, bookings: 0 };
        }
        for (const b of bookings) {
            const label = DAY_LABELS[b.check_in_date.getDay()];
            if (map[label]) {
                map[label].revenue += Number(b.total_price);
                map[label].bookings += 1;
            }
        }
        return Object.values(map);
    }

    private groupByDayInMonth(bookings: Booking[], monthStart: Date): DataPoint[] {
        const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
        const map: Record<number, DataPoint> = {};
        for (let d = 1; d <= daysInMonth; d++) {
            map[d] = { label: String(d), revenue: 0, bookings: 0 };
        }
        for (const b of bookings) {
            const d = b.check_in_date.getDate();
            if (map[d]) {
                map[d].revenue += Number(b.total_price);
                map[d].bookings += 1;
            }
        }
        return Object.values(map);
    }

    private groupByWeek(bookings: Booking[], rangeStart: Date, rangeEnd: Date): DataPoint[] {
        const points: DataPoint[] = [];
        let cursor = new Date(rangeStart);
        let weekNum = 1;
        while (cursor <= rangeEnd) {
            const wEnd = addDays(cursor, 6);
            const label = `W${weekNum}`;
            const inWeek = bookings.filter(b =>
                b.check_in_date >= cursor && b.check_in_date <= wEnd
            );
            points.push({
                label,
                revenue: inWeek.reduce((s, b) => s + Number(b.total_price), 0),
                bookings: inWeek.length,
            });
            cursor = addDays(wEnd, 1);
            weekNum++;
        }
        return points;
    }

    private groupByMonth(bookings: Booking[], rangeStart: Date, rangeEnd: Date): DataPoint[] {
        const MONTH_VI = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
        const map: Record<string, DataPoint> = {};

        let y = rangeStart.getFullYear();
        let m = rangeStart.getMonth();
        const endY = rangeEnd.getFullYear();
        const endM = rangeEnd.getMonth();

        while (y < endY || (y === endY && m <= endM)) {
            const label = `${MONTH_VI[m]}/${y}`;
            map[label] = { label, revenue: 0, bookings: 0 };
            m++;
            if (m > 11) { m = 0; y++; }
        }

        for (const b of bookings) {
            const label = `${MONTH_VI[b.check_in_date.getMonth()]}/${b.check_in_date.getFullYear()}`;
            if (map[label]) {
                map[label].revenue += Number(b.total_price);
                map[label].bookings += 1;
            }
        }
        return Object.values(map);
    }
}

export const reportService = new ReportService();