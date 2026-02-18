import { Request, Response } from "express";
import paymentService from "../services/Payment.Service";
import bookingService from "../services/Booking.Service";
import payosService from "../services/PayOS.Service";
import { AppDataSource } from "../data-source";
import { Booking } from "../dto/Booking";

const paymentController = {
    createPayOSLink: async (req: Request, res: Response) => {
        try {
            const { booking_id } = req.body;
            const booking = await bookingService.getById(booking_id);
            if (!booking) {
                return res.status(404).json({ message: "Booking not found" });
            }

            const paymentLink = await payosService.createPaymentLink(booking);
            res.status(200).json({
                message: "Payment link created successfully",
                data: paymentLink
            });
        } catch (error) {
            console.error("Error creating PayOS link:", error);
            res.status(500).json({ message: error.message || "Error creating payment link" });
        }
    },

    handleWebhook: async (req: Request, res: Response) => {
        try {
            const webhookData = await payosService.verifyWebhookData(req.body);

            // Check if payment successful
            if (webhookData.code === "00") {
                const orderCode = webhookData.orderCode;
                // Find booking by order_code
                const booking = await (AppDataSource.getRepository(Booking).findOneBy({ order_code: orderCode }));
                if (booking) {
                    await bookingService.confirmPayment(booking.id, webhookData.paymentLinkId);
                }
            }

            res.status(200).json({ message: "Webhook processed" });
        } catch (error) {
            console.error("Error handling webhook:", error);
            res.status(200).json({ message: "Webhook received with error" });
        }
    },

    verifyPaymentStatus: async (req: Request, res: Response) => {
        try {
            const { booking_id } = req.body;
            const booking = await bookingService.getById(booking_id);
            if (!booking) {
                return res.status(404).json({ message: "Booking not found" });
            }

            if (!booking.order_code) {
                return res.status(400).json({ message: "No payment link found for this booking" });
            }

            // Sync with PayOS
            const paymentDetail = await payosService.getPaymentDetail(Number(booking.order_code));

            if (paymentDetail.status === "PAID") {
                await bookingService.confirmPayment(booking.id, paymentDetail.id);
                return res.status(200).json({
                    message: "Payment confirmed",
                    status: "PAID",
                    data: paymentDetail
                });
            }

            res.status(200).json({
                message: "Payment status retrieved",
                status: paymentDetail.status,
                data: paymentDetail
            });
        } catch (error) {
            console.error("Error verifying payment status:", error);
            res.status(500).json({ message: error.message || "Error verifying status" });
        }
    },

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
            const id = parseInt(req.params.id as string);
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
            const id = parseInt(req.params.id as string);
            const payment = await paymentService.update(id, req.body);
            res.status(200).json({ message: "Payment updated successfully", data: payment });
        } catch (error) {
            console.error("Error updating payment:", error);
            res.status(500).json({ message: error.message || "Error updating payment" });
        }
    },

    delete: async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id as string);
            await paymentService.delete(id);
            res.status(200).json({ message: "Payment deleted successfully" });
        } catch (error) {
            console.error("Error deleting payment:", error);
            res.status(500).json({ message: "Error deleting payment" });
        }
    }
};

export default paymentController;
