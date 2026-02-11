import { AppDataSource } from "../data-source";
import { ExtraService } from "../dto/ExtraService";

const extraServiceRepository = AppDataSource.getRepository(ExtraService);

const extraServiceService = {
    create: async (payload: any) => {
        try {
            const service = extraServiceRepository.create(payload);
            return await extraServiceRepository.save(service);
        } catch (error) {
            throw error;
        }
    },
    update: async (id: number, payload: any) => {
        try {
            const service = await extraServiceRepository.findOne({ where: { id } });
            if (!service) {
                throw new Error("Dịch vụ không tồn tại");
            }
            return await extraServiceRepository.update(id, payload);
        } catch (error) {
            throw error;
        }
    },
    delete: async (id: number) => {
        try {
            const service = await extraServiceRepository.findOne({ where: { id } });
            if (!service) {
                throw new Error("Dịch vụ không tồn tại");
            }
            return await extraServiceRepository.remove(service);
        } catch (error) {
            throw error;
        }
    },
    getAll: async () => {
        try {
            return await extraServiceRepository.find();
        } catch (error) {
            throw error;
        }
    },
    getById: async (id: number) => {
        try {
            const service = await extraServiceRepository.findOne({ where: { id } });
            if (!service) {
                throw new Error("Dịch vụ không tồn tại");
            }
            return service;
        } catch (error) {
            throw error;
        }
    }
}

export default extraServiceService;
