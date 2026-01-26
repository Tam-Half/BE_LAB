import { AppDataSource } from "../data-source";
import { RoomType } from "../dto/RoomType";
import { Room } from "../dto/Room";
import { BookingRoomAllocation } from "../dto/BookingRoomAllocation";

const roomTypeRepository = AppDataSource.getRepository(RoomType);
const roomRepository = AppDataSource.getRepository(Room);
const allocationRepository = AppDataSource.getRepository(BookingRoomAllocation);

const AvailabilityService = {
    search: async (payload: {
        checkIn: string;
        checkOut: string;
        adultCount?: number;
        childCount?: number;
        childAges?: number[];
        rooms?: Array<{
            roomTypeId?: number;
            adultCount: number;
            childCount: number;
            childAges: number[];
        }>;
    }) => {
        const { checkIn, checkOut, adultCount, childCount, childAges, rooms } = payload;
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

        // 2. Discovery Mode (Search): fallback to top-level or rooms[0] guest counts
        const searchCriteria = (rooms && rooms.length > 0) ? rooms[0] : {
            adultCount: adultCount || 1,
            childCount: childCount || 0,
            childAges: childAges || []
        };

        return await AvailabilityService.discover(checkInDate, checkOutDate, nights, searchCriteria);
    },

    getQuote: async (checkInDate: Date, checkOutDate: Date, nights: number, rooms: any[]) => {
        const results = [];
        let grandTotal = 0;

        for (const roomReq of rooms) {
            const roomType = await roomTypeRepository.findOne({
                where: { id: roomReq.roomTypeId }
            });

            if (!roomType) continue;

            const availability = await AvailabilityService.checkRoomTypeAvailability(roomType.id, checkInDate, checkOutDate);
            const priceInfo = AvailabilityService.calculatePrice(roomType, nights, roomReq.adultCount, roomReq.childCount, roomReq.childAges);

            results.push({
                roomTypeId: roomType.id,
                roomTypeName: roomType.name,
                availableCount: availability.availableCount,
                ...priceInfo
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

    discover: async (checkInDate: Date, checkOutDate: Date, nights: number, criteria: { adultCount: number, childCount: number, childAges: number[] }) => {
        const allRoomTypes = await roomTypeRepository.find();
        const results = [];

        for (const roomType of allRoomTypes) {
            // Logic check capacity
            const asAdults = criteria.childAges.filter(age => age >= 12).length;
            const totalRequiredAdults = criteria.adultCount + asAdults;

            // Allow up to capacity + 1 (using extra adult fee)
            const capacity = roomType.capacity_people || 2;
            if (totalRequiredAdults > capacity + 1) {
                continue;
            }

            const availability = await AvailabilityService.checkRoomTypeAvailability(roomType.id, checkInDate, checkOutDate);

            if (availability.availableCount > 0) {
                const priceInfo = AvailabilityService.calculatePrice(roomType, nights, criteria.adultCount, criteria.childCount, criteria.childAges);

                results.push({
                    roomTypeId: roomType.id,
                    name: roomType.name,
                    basePrice: roomType.base_price,
                    totalRooms: availability.totalRooms,
                    availableCount: availability.availableCount,
                    capacity: roomType.capacity_people,
                    priceQuote: priceInfo
                });
            }
        }

        return {
            checkIn: checkInDate.toISOString().split('T')[0],
            checkOut: checkOutDate.toISOString().split('T')[0],
            nights,
            searchCriteria: criteria,
            availableRoomTypes: results
        };
    },

    checkRoomTypeAvailability: async (roomTypeId: number, checkIn: Date, checkOut: Date) => {
        const totalRooms = await roomRepository.count({ where: { roomType: { id: roomTypeId } } });

        const busyCount = await allocationRepository.createQueryBuilder("allocation")
            .innerJoin("allocation.room", "room")
            .where("room.room_type_id = :roomTypeId", { roomTypeId })
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

    calculatePrice: (roomType: RoomType, nights: number, adultCount: number, childCount: number, childAges: number[]) => {
        const CHILD_FEE = 100000;
        const EXTRA_ADULT_FEE = 200000;

        let freeChildren = 0;
        let paidChildren = 0;
        let asAdults = 0;

        for (const age of childAges) {
            if (age < 6) freeChildren++;
            else if (age < 12) paidChildren++;
            else asAdults++;
        }

        const totalAdults = adultCount + asAdults;
        const standardCapacity = roomType.capacity_people || 2;
        const extraAdults = Math.max(0, totalAdults - standardCapacity);

        const childFeePerNight = paidChildren * CHILD_FEE;
        const extraAdultFeePerNight = extraAdults * EXTRA_ADULT_FEE;
        const basePrice = Number(roomType.base_price) || 0;

        const nightlyPrice = basePrice + childFeePerNight + extraAdultFeePerNight;
        const itemTotal = nightlyPrice * nights;

        return {
            nights,
            pricePerNight: basePrice,
            childFeePerNight,
            extraAdultFeePerNight,
            totalPerNight: nightlyPrice,
            itemTotal,
            breakdown: { paidChildren, freeChildren, asAdults, extraAdults }
        };
    }
};

export default AvailabilityService;
