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

    getAllShifts: async () => {
        try {
            const shifts = await shiftRepository.find({
                relations: ["staff"],
                order: {
                    start_time: "DESC"
                }
            });
            return shifts.map((shift: any) => {
                const staffName = shift.staff ? (shift.staff.name || shift.staff.username || shift.staff.fullname) : null;

                const { staff, ...shiftData } = shift;

                return {
                    ...shiftData,
                    staff_name: staffName
                };
            });
        } catch (error) {
            throw error;
        }
    },
    startShift: async (payload: { staffId: string; initialCash: number }) => {
        try {
            const { staffId, initialCash } = payload;
            const staff = await accountRepository.findOneBy({ id: staffId });
            if (!staff) throw new Error("Nhân viên không tồn tại");

            const newShift = new Shift();
            newShift.staff = staff;
            newShift.initial_cash = initialCash;
            newShift.start_time = new Date();
            newShift.status = "open";

            const savedShift = await shiftRepository.save(newShift);
            return savedShift;
        } catch (error) {
            throw error;
        }
    },

    getCurrentShiftByStaff: async (staffId: string) => {
        try {
            return await shiftRepository.findOne({
                where: { staff: { id: staffId }, status: "open" },
                relations: ["staff"]
            });
        } catch (error) {
            throw error;
        }
    },

    getShiftReport: async (shiftId: number) => {
        try {
            const shift = await shiftRepository.findOne({
                where: { id: shiftId },
                relations: ["staff"]
            });

            if (!shift) throw new Error("Không tìm thấy ca làm việc");

            const sTime = new Date(shift.start_time);
            const eTime = shift.end_time ? new Date(shift.end_time) : new Date();

            // --- BÙ TRỪ MÚI GIỜ ---
            // Lấy độ lệch múi giờ của server (VD: Việt Nam là -420 phút, tức -7 giờ)
            const timezoneOffsetMs = new Date().getTimezoneOffset() * 60 * 1000;
            const sTimeDB = new Date(sTime.getTime() + timezoneOffsetMs);
            const eTimeDB = new Date(eTime.getTime() + timezoneOffsetMs);


            // 1. Lấy thông tin Bookings trong ca
            const bookingsInShift = await bookingRepository.createQueryBuilder("b")
                .leftJoinAndSelect("b.user", "u")
                .where("b.created_at >= :start", { start: sTimeDB })
                .andWhere("b.created_at <= :end", { end: eTimeDB })
                .getMany();

            // 2. Lấy thông tin Payments trong ca (CHỈ LẤY GIAO DỊCH THÀNH CÔNG)
            const paymentsInShift = await paymentRepository.createQueryBuilder("p")
                .where("p.created_at >= :start", { start: sTimeDB })
                .andWhere("p.created_at <= :end", { end: eTimeDB })
                .andWhere("p.status = :status", { status: PaymentStatus.PAID })
                .getMany();

            let cashCollected = 0;
            let bankCollected = 0;

            paymentsInShift.forEach(payment => {
                const method = (payment.payment_method || "").trim().toUpperCase();
                if (method === "CASH" || method === "TIỀN MẶT" || method === "TIEN MAT") {
                    cashCollected += Number(payment.amount);
                } else {
                    bankCollected += Number(payment.amount);
                }
            });

            // 4. Lấy Service Orders trong ca
            const serviceOrdersInShift = await serviceOrderRepository.createQueryBuilder("so")
                .where("so.created_at >= :start", { start: sTimeDB })
                .andWhere("so.created_at <= :end", { end: eTimeDB })
                .getMany();

            return {
                shift_info: shift,
                revenue: {
                    start_cash: Number(shift.initial_cash),
                    cash_collected: cashCollected,
                    bank_collected: bankCollected,
                    total_system_revenue: cashCollected + bankCollected,
                    expected_cash_in_drawer: Number(shift.initial_cash) + cashCollected
                },
                activities: {
                    total_payments: paymentsInShift.length,
                    total_bookings: bookingsInShift.length,
                    total_service_orders: serviceOrdersInShift.length,
                    booking_list: bookingsInShift,
                    payment_list: paymentsInShift,
                    service_order_list: serviceOrdersInShift
                }
            };
        } catch (error) {
            throw error;
        }
    },

    endShift: async (payload: { shiftId: number; actualCash: number; note: string }) => {
        try {
            const { shiftId, actualCash, note } = payload;
            const shift = await shiftRepository.findOneBy({ id: shiftId });
            if (!shift) throw new Error("Không tìm thấy ca");

            shift.end_time = new Date();
            shift.status = "closed";
            shift.actual_cash_handover = actualCash;
            shift.note = note;
            return await shiftRepository.save(shift);
        } catch (error) {
            throw error;
        }
    }
};

export default shiftService;