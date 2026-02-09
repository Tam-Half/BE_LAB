import { AppDataSource } from "../data-source";
import { RoomType } from "../dto/RoomType";
import { RoomTypeImage } from "../dto/RoomTypeImage";

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
                relations: ["images"]
            });
        } catch (error) {
            throw error;
        }
    }
}

export default roomTypeService;
