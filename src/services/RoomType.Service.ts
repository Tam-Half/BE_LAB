import { AppDataSource } from "../data-source";
import { RoomType } from "../dto/RoomType";
import { RoomTypeImage } from "../dto/RoomTypeImage";
import AvailabilityService from "./Availability.Service";

const roomTypeRepository = AppDataSource.getRepository(RoomType);
const roomTypeImageRepository = AppDataSource.getRepository(RoomTypeImage);

const roomTypeService = {
    create: async (payload: any, images?: { url: string; public_id: string }[]) => {
        try {
            const roomType = roomTypeRepository.create(payload);
            const savedRoomType = await roomTypeRepository.save(roomType);

            // Ensure we have the saved entity
            const roomTypeId = (savedRoomType as any).id;

            if (images && images.length > 0) {
                const imageEntities = images.map(img => roomTypeImageRepository.create({
                    ...img,
                    roomType: { id: roomTypeId } as any
                }));
                await roomTypeImageRepository.save(imageEntities);
            }

            return await roomTypeRepository.findOne({
                where: { id: roomTypeId },
                relations: ["images"]
            });
        } catch (error) {
            throw error;
        }
    },
    update: async (id: number, payload: any) => {
        try {
            const roomType = await roomTypeRepository.findOne({ where: { id } });
            if (!roomType) {
                throw new Error("Loại phòng không tồn tại");
            }
            return await roomTypeRepository.update(id, payload);
        } catch (error) {
            throw error;
        }
    },
    delete: async (id: number) => {
        try {
            const roomType = await roomTypeRepository.findOne({ where: { id } });
            if (!roomType) {
                throw new Error("Loại phòng không tồn tại");
            }
            return await roomTypeRepository.remove(roomType);
        } catch (error) {
            throw error;
        }
    },
    getAll: async () => {
        try {
            return await roomTypeRepository.find({
                relations: ["images", "reviews", "reviews.user", "roomClass"]
            });
        } catch (error) {
            throw error;
        }
    },
    getById: async (id: number, checkIn?: string, checkOut?: string) => {
        try {
            const roomType = await roomTypeRepository.findOne({
                where: { id },
                relations: ["images", "roomClass"]
            });

            if (!roomType) {
                throw new Error("Loại phòng không tồn tại");
            }

            // Default dates if not provided
            const startDate = checkIn ? new Date(checkIn) : new Date();
            const endDate = checkOut ? new Date(checkOut) : new Date(new Date().setDate(new Date().getDate() + 1));

            // AvailabilityService is imported inside the method to avoid circular dependencies if any
            // but here it's safe to import at the top if needed. 
            // However, AvailabilityService.ts already imports RoomType.ts (the DTO), 
            // and RoomType.Service.ts also imports RoomType.ts.
            // Let's check imports.
            const availability = await AvailabilityService.checkRoomTypeAvailability(id, startDate, endDate);

            return {
                ...roomType,
                ...availability
            };
        } catch (error) {
            throw error;
        }
    }
}

export default roomTypeService;
