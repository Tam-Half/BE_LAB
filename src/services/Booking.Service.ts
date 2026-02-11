import { AppDataSource } from "../data-source";
import { Booking } from "../dto/Booking";
import { BookingDetail } from "../dto/BookingDetail";
import { User } from "../dto/User";
import { Hotel } from "../dto/Hotel";
import { Promotion } from "../dto/Promotion";
import { RoomType } from "../dto/RoomType";
import { Room } from "../dto/Room";
import { BookingRoom } from "../dto/BookingRoom";
import { BookingRoomAllocation } from "../dto/BookingRoomAllocation";
// <<<<<<< main
// import AvailabilityService from "./Availability.Service";
// =======
import { BookingFilter } from "../interfaces/Booking";
// >>>>>>> Tam-Vault

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
            check_in_date,
            check_out_date,
            rooms, // Array of { roomTypeId, quantity }
            guest_name,
            guest_phone,
            guest_email,
            promotion_code,
            note
        } = payload;

        return await AppDataSource.transaction(async (transactionalEntityManager) => {
            const checkIn = new Date(check_in_date);
            const checkOut = new Date(check_out_date)
            if (checkOut <= checkIn) {
                throw new Error("Check-out date must be after check-in date");
            }

            const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24));
            let promotion = null;
            if (promotion_code) {
                promotion = await promotionRepository.findOneBy({ code: promotion_code, is_active: true });
            }

            const user = user_id ? await userRepository.findOneBy({ id: user_id }) : null;

            // Pre-calculate total price and fetch basic info
            let totalPrice = 0;
            const hotel = (await roomRepository.findOne({ where: {}, relations: ["floor", "floor.hotel"] }))?.floor.hotel;
            // Note: In real world, we'd probably get hotel_id from payload or room types. 
            // For now, assuming rooms belong to the same hotel.

            // 1. Create Booking Master
            const booking = transactionalEntityManager.create(Booking, {
                user,
                hotel, // Should be verified if multiple hotels exist
                promotion,
                booking_code: `BK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                check_in_date: checkIn,
                check_out_date: checkOut,
                total_price: 0, // Update later
                status: "PENDING",
                payment_status: "unpaid",
                expires_at: new Date(Date.now() + 15 * 60 * 1000),
                note,
                guest_name,
                guest_phone,
                guest_email
            });

            const savedBooking = await transactionalEntityManager.save(booking);

            let calculatedTotalPrice = 0;

            for (const roomReq of rooms) {
                const roomType = await roomTypeRepository.findOneBy({ id: roomReq.roomTypeId });
                if (!roomType) throw new Error(`Room type ${roomReq.roomTypeId} not found`);

                const basePrice = Number(roomType.base_price) || 0;
                const itemTotal = basePrice * nights * roomReq.quantity;
                calculatedTotalPrice += itemTotal;

                // 2. Create Booking Detail (for each room type)
                const detail = transactionalEntityManager.create(BookingDetail, {
                    booking: savedBooking,
                    roomType: roomType,
                    quantity: roomReq.quantity,
                    price_at_booking: basePrice
                });
                const savedDetail = await transactionalEntityManager.save(detail);

                const availableRooms = await AvailabilityService.findAvailableRooms(roomType.id, checkIn, checkOut, roomReq.quantity);
                if (availableRooms.length < roomReq.quantity) {
                    throw new Error(`Insufficient availability for room type: ${roomType.name}`);
                }

                for (let i = 0; i < roomReq.quantity; i++) {
                    const physicalRoom = availableRooms[i];

                    // 3. Create Booking Room (individual room record)
                    const bookingRoom = transactionalEntityManager.create(BookingRoom, {
                        booking: savedBooking,
                        bookingDetail: savedDetail,
                        roomType: roomType,
                        price_at_booking: basePrice,
                        pricing_snapshot: {
                            base_price: basePrice,
                            nights: nights
                        }
                    });
                    const savedBookingRoom = await transactionalEntityManager.save(bookingRoom);

                    // 4. Create Allocation (physical room assignment)
                    const allocation = transactionalEntityManager.create(BookingRoomAllocation, {
                        bookingRoom: savedBookingRoom,
                        room: physicalRoom,
                        check_in_date: checkIn,
                        check_out_date: checkOut,
                        price_at_booking: basePrice
                    });
                    await transactionalEntityManager.save(allocation);
                }
            }

            // Apply promotion if any
            if (promotion && promotion.discount_percent) {
                const discount = (calculatedTotalPrice * promotion.discount_percent) / 100;
                calculatedTotalPrice -= Math.min(discount, promotion.max_discount_amount || discount);
            }

            savedBooking.total_price = calculatedTotalPrice;
            await transactionalEntityManager.save(savedBooking);

            return await transactionalEntityManager.findOne(Booking, {
                where: { id: savedBooking.id },
                relations: [
                    "bookingDetails",
                    "bookingDetails.roomType",
                    "bookingRooms",
                    "bookingRooms.allocation",
                    "bookingRooms.allocation.room",
                    "user",
                    "hotel",
                    "promotion"
                ]
            });
        });
    },

    getAll: async (filters: BookingFilter) => {
        const { status, user_id, hotel_id } = filters;

        // Xây dựng điều kiện lọc động
        const whereCondition: any = {};

        if (status) {
            whereCondition.status = status;
        }

        if (user_id) {
            whereCondition.user = { id: user_id };
        }

        if (hotel_id) {
            whereCondition.hotel = { id: hotel_id };
        }

        return await bookingRepository.find({
            where: whereCondition,
            relations: ["bookingDetails", "bookingDetails.roomType", "user", "hotel", "promotion"],
            order: { created_at: "DESC" } // Thường booking nên hiện cái mới nhất lên đầu
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
