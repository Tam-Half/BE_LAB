import shiftService from "../services/Shift.Service"; 

const shiftController = {
    
    // API: POST /start
    startShift: async (req, res) => {
        try {
            // req.body chứa { staffId, initialCash }
            const result = await shiftService.startShift(req.body);
            return res.status(200).json({ message: "Mở ca thành công", data: result });
        } catch (error) {
            console.log("Lỗi mở ca:", error);
            return res.status(500).json({ message: error.message });
        }
    },

    // API: GET /:id/stats
    getStats: async (req, res) => {
        try {
            const shiftId = Number(req.params.id);
            const result = await shiftService.getShiftReport(shiftId);
            return res.status(200).json({ data: result });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    // API: POST /:id/end
    endShift: async (req, res) => {
        try {
            const shiftId = Number(req.params.id);
            const { actualCash, note } = req.body;
            
            // Gom lại thành 1 payload để gửi sang service
            const result = await shiftService.endShift({ shiftId, actualCash, note });
            
            return res.status(200).json({ message: "Chốt ca thành công", data: result });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
}

export default shiftController;