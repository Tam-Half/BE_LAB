import { Request, Response } from "express";
import paymentService from "../services/Payment.Service";

const paymentController = {
    create: async (req: Request, res: Response) => {
        try {
            const payment = await paymentService.create(req.body);
            res.status(201).json({ message: "Payment created successfully", data: payment });
        } catch (error) {
            console.error("Error creating payment:", error);
            res.status(500).json({ message: error.message || "Error creating payment" });
        }
    },

    getAll: async (req: Request, res: Response) => {
        try {
            const payments = await paymentService.getAll();
            res.status(200).json(payments);
        } catch (error) {
            console.error("Error fetching payments:", error);
            res.status(500).json({ message: "Error fetching payments" });
        }
    },

    getById: async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id);
            const payment = await paymentService.getById(id);
            if (!payment) {
                return res.status(404).json({ message: "Payment not found" });
            }
            res.status(200).json(payment);
        } catch (error) {
            console.error("Error fetching payment:", error);
            res.status(500).json({ message: "Error fetching payment" });
        }
    },

    update: async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id);
            const payment = await paymentService.update(id, req.body);
            res.status(200).json({ message: "Payment updated successfully", data: payment });
        } catch (error) {
            console.error("Error updating payment:", error);
            res.status(500).json({ message: error.message || "Error updating payment" });
        }
    },

    delete: async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id);
            await paymentService.delete(id);
            res.status(200).json({ message: "Payment deleted successfully" });
        } catch (error) {
            console.error("Error deleting payment:", error);
            res.status(500).json({ message: "Error deleting payment" });
        }
    }
};

export default paymentController;
