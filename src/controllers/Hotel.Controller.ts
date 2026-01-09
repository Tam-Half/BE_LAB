import hotelService from "../services/Hotel.service";

const hotelController = {
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const payload = req.body;
            const hotel = await hotelService.update(id, payload);
            res.status(200).json(hotel);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}
export default hotelController