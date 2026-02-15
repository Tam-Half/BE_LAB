import { Between } from "typeorm";
import { AppDataSource } from "../data-source";
import { Shift } from "../dto/Shift";
import { Payment } from "../dto/Payment";
import { Booking } from "../dto/Booking";
import { ServiceOrder } from "../dto/ServiceOrder";
import { Account } from "../dto/Account";

// Khởi tạo Repository bên ngoài object service
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

            // Kiểm tra nhân viên có ca nào chưa đóng không
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

            return await shiftRepository.save(newShift);
        } catch (error) {
            throw error;
        }
    },

    // 2. Lấy báo cáo thống kê (Dùng chung cho cả xem báo cáo và chốt ca)
    getShiftReport: async (shiftId: number) => {
        try {
            const shift = await shiftRepository.findOne({
                where: { id: shiftId },
                relations: ["staff"]
            });

            if (!shift) throw new Error("Không tìm thấy ca làm việc");

            const startTime = shift.start_time;
            const endTime = shift.end_time ? shift.end_time : new Date();

            // A. Doanh thu Payment
            const payments = await paymentRepository.find({
                where: { created_at: Between(startTime, endTime), status: "completed" }
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
            
            // Gọi hàm getShiftReport ngay trong object này
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