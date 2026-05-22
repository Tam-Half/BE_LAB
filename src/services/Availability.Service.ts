import { AppDataSource } from "../data-source";
import { RoomType } from "../dto/RoomType";
import { Room } from "../dto/Room";
import { BookingRoomAllocation } from "../dto/BookingRoomAllocation";
import { BookingStatus } from "../dto/Enums";

const roomTypeRepository = AppDataSource.getRepository(RoomType);
const roomRepository = AppDataSource.getRepository(Room);
const allocationRepository = AppDataSource.getRepository(BookingRoomAllocation);

const AvailabilityService = {
    search: async (payload: {
        checkIn: string;
        checkOut: string;
        rooms?: Array<{
            roomTypeId?: number;
        }>;
    }) => {
        const { checkIn, checkOut, rooms } = payload;
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
            throw new Error("Invalid date format. Use YYYY-MM-DD.");
        }

        if (checkOutDate <= checkInDate) {
            throw new Error("Check-out date must be after check-in date.");
        }

        const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

        // Detect mode:
        // 1. Specific Room Quote: 'rooms' is present AND all items have 'roomTypeId'
        if (rooms && rooms.length > 0 && rooms.every(r => r.roomTypeId)) {
            return await AvailabilityService.getQuote(checkInDate, checkOutDate, nights, rooms);
        }

        // 2. Discovery Mode (Search)
        return await AvailabilityService.discover(checkInDate, checkOutDate, nights);
    },

    getQuote: async (checkInDate: Date, checkOutDate: Date, nights: number, rooms: any[]) => {
        const results = [];
        let grandTotal = 0;

        for (const roomReq of rooms) {
            const roomType = await roomTypeRepository.findOne({
                where: { id: roomReq.roomTypeId },
                relations: ["images", "roomClass"]
            });

            if (!roomType) continue;

            const availability = await AvailabilityService.checkRoomTypeAvailability(roomType.id, checkInDate, checkOutDate);
            const priceInfo = AvailabilityService.calculatePrice(roomType, nights);

            results.push({
                roomTypeId: roomType.id,
                roomTypeName: roomType.name,
                availableCount: availability.availableCount,
                average_rating: roomType.average_rating,
                size_m2: roomType.size_m2,
                capacity_people: roomType.capacity_people,
                review_count: roomType.review_count,
                roomClass: roomType.roomClass,
                ...priceInfo,
            });

            grandTotal += priceInfo.itemTotal;
        }

        return {
            quoteId: `q_${Math.random().toString(36).substring(2, 9)}`,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
            items: results,
            totalAmount: grandTotal
        };
    },

    discover: async (checkInDate: Date, checkOutDate: Date, nights: number) => {
        const allRoomTypes = await roomTypeRepository.find({
            relations: ["images", "roomClass"]
        });
        const results = [];

        for (const roomType of allRoomTypes) {
            const availability = await AvailabilityService.checkRoomTypeAvailability(roomType.id, checkInDate, checkOutDate);

            if (availability.availableCount > 0) {
                const priceInfo = AvailabilityService.calculatePrice(roomType, nights);

                results.push({
                    roomTypeId: roomType.id,
                    name: roomType.name,
                    basePrice: roomType.base_price,
                    totalRooms: availability.totalRooms,
                    busyCount: availability.busyCount,
                    availableCount: availability.availableCount,
                    capacity: roomType.capacity_people,
                    average_rating: roomType.average_rating,
                    review_count: roomType.review_count,
                    roomClass: roomType.roomClass,
                    priceQuote: priceInfo,
                    images: roomType.images,
                    size_m2: roomType.size_m2,
                    capacity_people: roomType.capacity_people,

                });
            }
        }

        return {
            checkIn: checkInDate.toISOString().split('T')[0],
            checkOut: checkOutDate.toISOString().split('T')[0],
            nights,
            availableRoomTypes: results
        };
    },

    checkRoomTypeAvailability: async (roomTypeId: number, checkIn: Date, checkOut: Date) => {
        const totalRooms = await roomRepository.count({ where: { roomType: { id: roomTypeId } } });

        const busyCount = await allocationRepository.createQueryBuilder("allocation")
            .innerJoin("allocation.room", "room")
            .innerJoin("allocation.bookingRoom", "bookingRoom")
            .innerJoin("bookingRoom.booking", "booking")
            .where("room.room_type_id = :roomTypeId", { roomTypeId })
            .andWhere("booking.status != :cancelled AND booking.status != :expired", { cancelled: BookingStatus.CANCELLED, expired: BookingStatus.EXPIRED })
            .andWhere("allocation.check_in_date < :checkOut AND allocation.check_out_date > :checkIn", {
                checkIn,
                checkOut
            })
            .getCount();

        return {
            totalRooms,
            busyCount,
            availableCount: totalRooms - busyCount
        };
    },

    calculatePrice: (roomType: RoomType, nights: number) => {
        const basePrice = Number(roomType.base_price) || 0;

        const nightlyPrice = basePrice;
        const itemTotal = nightlyPrice * nights;

        return {
            nights,
            pricePerNight: basePrice,
            totalPerNight: nightlyPrice,
            itemTotal,
        };
    },

    findAvailableRooms: async (roomTypeId: number, checkInDate: Date, checkOutDate: Date, limit: number, transactionalManager?: any) => {
        const manager = transactionalManager || AppDataSource.manager;

        // Find rooms of type that don't have overlapping allocations from active bookings
        const availableRooms = await manager.createQueryBuilder(Room, "room")
            .where("room.room_type_id = :roomTypeId", { roomTypeId })
            .andWhere((qb) => {
                const subQuery = qb.subQuery()
                    .select("allocation.room_id")
                    .from(BookingRoomAllocation, "allocation")
                    .innerJoin("allocation.bookingRoom", "bookingRoom")
                    .innerJoin("bookingRoom.booking", "booking")
                    .where("booking.status != :cancelled AND booking.status != :expired", { cancelled: BookingStatus.CANCELLED, expired: BookingStatus.EXPIRED })
                    .andWhere("allocation.check_in_date < :checkOutDate AND allocation.check_out_date > :checkInDate")
                    .getQuery();
                return "room.id NOT IN (" + subQuery + ")";
            })
            .setParameter("cancelled", BookingStatus.CANCELLED)
            .setParameter("expired", BookingStatus.EXPIRED)
            .setParameter("checkInDate", checkInDate)
            .setParameter("checkOutDate", checkOutDate)
            .limit(limit)
            .getMany();

        return availableRooms;
    }
};

export default AvailabilityService;
