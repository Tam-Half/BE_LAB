import { AppDataSource } from "../data-source";
import { Booking } from "../dto/Booking";
import { BookingDetail } from "../dto/BookingDetail";
import { User } from "../dto/User";
import { Hotel } from "../dto/Hotel";
import { Promotion } from "../dto/Promotion";
import { RoomType } from "../dto/RoomType";
import { Room } from "../dto/Room";
import { BookingRoomAllocation } from "../dto/BookingRoomAllocation";

const bookingRepository = AppDataSource.getRepository(Booking);
const bookingDetailRepository = AppDataSource.getRepository(BookingDetail);
const userRepository = AppDataSource.getRepository(User);
const hotelRepository = AppDataSource.getRepository(Hotel);
const promotionRepository = AppDataSource.getRepository(Promotion);
const roomTypeRepository = AppDataSource.getRepository(RoomType);
const roomRepository = AppDataSource.getRepository(Room);
const allocationRepository = AppDataSource.getRepository(BookingRoomAllocation);

const bookingService = {
    create: async (payload: any) => {
        const {
            user_id,
            room_id,
            check_in_date,
            check_out_date,
            guest_count,
            guest_name,
            guest_phone,
            guest_email,
            promotion_code,
            note
        } = payload;

        return await AppDataSource.transaction(async (transactionalEntityManager) => {
            const checkIn = new Date(check_in_date);
            const checkOut = new Date(check_out_date);

            if (checkOut <= checkIn) {
                throw new Error("Check-out date must be after check-in date");
            }

            const room = await roomRepository.findOne({
                where: { id: room_id },
                relations: ["roomType", "floor", "floor.hotel"]
            });

            if (!room) throw new Error("Room not found");
            if (!room.floor || !room.floor.hotel) throw new Error("Room's hotel information is missing");

            // Check overlap
            const existingAllocation = await transactionalEntityManager.createQueryBuilder(BookingRoomAllocation, "allocation")
                .where("allocation.room_id = :room_id", { room_id })
                .andWhere("(allocation.check_in_date < :checkOut AND allocation.check_out_date > :checkIn)", {
                    checkIn,
                    checkOut
                })
                .getOne();

            if (existingAllocation) {
                throw new Error("Phòng đã có người đặt vào ngày này");
            }

            let promotion = null;
            if (promotion_code) {
                promotion = await promotionRepository.findOneBy({ code: promotion_code, is_active: true });
                // Note: More complex promotion logic (expiry, etc.) could be added here
            }

            const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24));
            const basePrice = room.roomType.base_price || 0;
            let totalPrice = basePrice * nights;

            if (promotion && promotion.discount_percent) {
                const discount = (totalPrice * promotion.discount_percent) / 100;
                totalPrice -= Math.min(discount, promotion.max_discount_amount || discount);
            }

            const user = user_id ? await userRepository.findOneBy({ id: user_id }) : null;

            const booking = transactionalEntityManager.create(Booking, {
                user,
                hotel: room.floor.hotel,
                promotion,
                booking_code: `BK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                check_in_date: checkIn,
                check_out_date: checkOut,
                total_price: totalPrice,
                status: "PENDING",
                payment_status: "unpaid",
                expires_at: new Date(Date.now() + 15 * 60 * 1000),
                note,
                guest_count,
                guest_name,
                guest_phone
            });

            const savedBooking = await transactionalEntityManager.save(booking);

            // Create allocation
            const allocation = transactionalEntityManager.create(BookingRoomAllocation, {
                booking: savedBooking,
                room: room,
                check_in_date: checkIn,
                check_out_date: checkOut,
                price_at_booking: basePrice
            });
            await transactionalEntityManager.save(allocation);

            // Create booking detail (1 row for the room type)
            const detail = transactionalEntityManager.create(BookingDetail, {
                booking: savedBooking,
                roomType: room.roomType,
                quantity: 1,
                price_at_booking: basePrice
            });
            await transactionalEntityManager.save(detail);

            return await transactionalEntityManager.findOne(Booking, {
                where: { id: savedBooking.id },
                relations: ["bookingDetails", "bookingDetails.roomType", "user", "hotel", "promotion"]
            });
        });
    },

    getAll: async () => {
        return await bookingRepository.find({
            relations: ["bookingDetails", "bookingDetails.roomType", "user", "hotel", "promotion"]
        });
    },

    getById: async (id: number) => {
        return await bookingRepository.findOne({
            where: { id },
            relations: ["bookingDetails", "bookingDetails.roomType", "user", "hotel", "promotion"]
        });
    },

    update: async (id: number, payload: any) => {
        const booking = await bookingRepository.findOneBy({ id });
        if (!booking) throw new Error("Booking not found");

        bookingRepository.merge(booking, payload);
        return await bookingRepository.save(booking);
    },

    delete: async (id: number) => {
        const result = await bookingRepository.delete(id);
        return result;
    }
};

export default bookingService;
