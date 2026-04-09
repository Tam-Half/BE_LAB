import { Between } from "typeorm";
import { AppDataSource } from "../data-source";
import { Shift } from "../dto/Shift";
import { Payment } from "../dto/Payment";
import { Booking } from "../dto/Booking";
import { ServiceOrder } from "../dto/ServiceOrder";
import { Account } from "../dto/Account";
import { BookingStatus, BookingRoomAllocationStatus, ServiceOrderStatus, PaymentStatus } from "../dto/Enums";

const shiftRepository = AppDataSource.getRepository(Shift);
const paymentRepository = AppDataSource.getRepository(Payment);
const serviceOrderRepository = AppDataSource.getRepository(ServiceOrder);
const accountRepository = AppDataSource.getRepository(Account);
const bookingRepository = AppDataSource.getRepository(Booking);

const shiftService = {
    // 1. Mở ca làm việc
    startShift: async (payload: { staffId: string; initialCash: number }) => {
        try {
            const { staffId, initialCash } = payload;

            const existingShift = await shiftRepository.findOne({
                where: { staff: { id: staffId }, status: "open" }
            });

            if (existingShift) {
                throw new Error("Bạn đang có một ca làm việc chưa kết thúc!");
            }

            const staff = await accountRepository.findOneBy({ id: staffId });
            if (!staff) throw new Error("Nhân viên không tồn tại");

            const newShift = new Shift();
            newShift.staff = staff;
            newShift.initial_cash = initialCash;
            newShift.start_time = new Date();
            newShift.status = "open";

            // Lưu vào DB
            const savedShift = await shiftRepository.save(newShift);

            // [FIX] Trả về dữ liệu đã lọc bỏ password
            return {
                ...savedShift,
                staff: {
                    id: staff.id,
                    username: staff.username,
                    email: staff.email
                    // Chỉ lấy những trường bạn muốn hiển thị
                }
            };

        } catch (error) {
            throw error;
        }
    },

    // [MỚI] 1b. Lấy thông tin ca hiện tại của nhân viên (Ca đang Open)
    getCurrentShiftByStaff: async (staffId: string) => {
        try {
            const shift = await shiftRepository.findOne({
                where: { 
                    staff: { id: staffId }, 
                    status: "open" // Quan trọng: Chỉ lấy ca đang mở
                },
                relations: ["staff"],
                select: {
                    // Chọn trường bảng Shift
                    id: true,
                    initial_cash: true,
                    start_time: true,
                    status: true,
                    // Chọn trường bảng Staff (loại bỏ password)
                    staff: {
                        id: true,
                        username: true,
                        email: true
                    }
                }
            });

            // Nếu không có ca nào đang mở, trả về null (để frontend biết mà hiện nút Mở Ca)
            return shift; 
        } catch (error) {
            throw error;
        }
    },

    // 2. Lấy báo cáo thống kê
   getShiftReport: async (shiftId: number) => {
        try {
            const shift = await shiftRepository.findOne({
                where: { id: shiftId },
                relations: ["staff"],
                select: {
                    id: true,
                    initial_cash: true,
                    start_time: true,
                    end_time: true,
                    status: true,
                    system_revenue: true,
                    actual_cash_handover: true,
                    note: true,
                    created_at: true,
                    updated_at: true,
                    staff: {
                        id: true,
                        username: true,
                        email: true
                    }
                }
            });

            if (!shift) throw new Error("Không tìm thấy ca làm việc");

            const startTime = shift.start_time;
            const endTime = shift.end_time ? shift.end_time : new Date();

            // A. Doanh thu Payment
            // [SỬA LỖI] Thay vì dùng chuỗi "completed", hãy dùng Enum PaymentStatus.PAID
            const payments = await paymentRepository.find({
                where: { 
                    created_at: Between(startTime, endTime), 
                    status: PaymentStatus.PAID // <-- Sửa tại đây
                }
            });

            const cashRevenue = payments
                .filter(p => p.payment_method === "CASH")
                .reduce((sum, p) => sum + Number(p.amount), 0);

            const bankRevenue = payments
                .filter(p => ["BANKING", "CARD", "CREDIT"].includes(p.payment_method))
                .reduce((sum, p) => sum + Number(p.amount), 0);

            // B. Booking & Service Order
            const bookings = await bookingRepository.find({
                where: { created_at: Between(startTime, endTime) },
                relations: ["user"]
            });

            // Lưu ý: Đảm bảo các relation name này khớp chính xác với entity của bạn
            const serviceOrders = await serviceOrderRepository.find({
                where: { created_at: Between(startTime, endTime) },
                relations: ["booking", "booking.bookingRooms", "booking.bookingRooms.allocation.room"]
            });

            return {
                shift_info: shift,
                revenue: {
                    start_cash: Number(shift.initial_cash),
                    cash_collected: cashRevenue,
                    bank_collected: bankRevenue,
                    total_system_revenue: cashRevenue + bankRevenue,
                    expected_cash_in_drawer: Number(shift.initial_cash) + cashRevenue
                },
                activities: {
                    total_payments: payments.length,
                    total_bookings: bookings.length,
                    total_service_orders: serviceOrders.length,
                    booking_list: bookings,
                    service_order_list: serviceOrders
                }
            };
        } catch (error) {
            throw error;
        }
    },

    // 3. Chốt ca
    endShift: async (payload: { shiftId: number; actualCash: number; note: string }) => {
        try {
            const { shiftId, actualCash, note } = payload;
            
            // Gọi hàm getShiftReport (lúc này shift_info bên trong đã sạch password nhờ đoạn select ở trên)
            const report = await shiftService.getShiftReport(shiftId);
            const shift = report.shift_info;

            if (shift.status === "closed") throw new Error("Ca này đã đóng rồi!");

            shift.end_time = new Date();
            shift.status = "closed";
            shift.system_revenue = report.revenue.total_system_revenue;
            shift.actual_cash_handover = actualCash;
            shift.note = note;

            await shiftRepository.save(shift);

            return shift;
        } catch (error) {
            throw error;
        }
    }
}

export default shiftService;