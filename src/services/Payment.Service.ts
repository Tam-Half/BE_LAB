import { AppDataSource } from "../data-source";
import { Payment } from "../dto/Payment";
import { Booking } from "../dto/Booking";

const paymentRepository = AppDataSource.getRepository(Payment);
const bookingRepository = AppDataSource.getRepository(Booking);

const paymentService = {
    create: async (payload: any) => {
        const { booking_id, ...paymentData } = payload;
        const booking = await bookingRepository.findOneBy({ id: booking_id });
        if (!booking) throw new Error("Booking not found");

        const payment = paymentRepository.create({
            ...paymentData,
            booking
        });
        return await paymentRepository.save(payment);
    },

    getAll: async () => {
        return await paymentRepository.find({
            relations: ["booking"]
        });
    },

    getById: async (id: number) => {
        return await paymentRepository.findOne({
            where: { id },
            relations: ["booking"]
        });
    },

    update: async (id: number, payload: any) => {
        const payment = await paymentRepository.findOneBy({ id });
        if (!payment) throw new Error("Payment not found");

        if (payload.booking_id) {
            const booking = await bookingRepository.findOneBy({ id: payload.booking_id });
            if (!booking) throw new Error("Booking not found");
            payment.booking = booking;
        }

        paymentRepository.merge(payment, payload);
        return await paymentRepository.save(payment);
    },

    delete: async (id: number) => {
        return await paymentRepository.delete(id);
    }
};

export default paymentService;
