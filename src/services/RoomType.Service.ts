import { AppDataSource } from "../data-source";
import { RoomType } from "../dto/RoomType";

const roomTypeRepository = AppDataSource.getRepository(RoomType);

const roomTypeService = {
    create: async (payload: any) => {
        try {
            const roomType = roomTypeRepository.create(payload);
            return await roomTypeRepository.save(roomType);
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
            return await roomTypeRepository.find();
        } catch (error) {
            throw error;
        }
    }
}

export default roomTypeService;
