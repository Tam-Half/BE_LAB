import { Request, Response } from "express";
import paymentService from "../services/Payment.Service";
import bookingService from "../services/Booking.Service";
import payosService from "../services/PayOS.Service";
import { AppDataSource } from "../data-source";
import { Booking } from "../dto/Booking";

const paymentController = {
    createPayOSLink: async (req: Request, res: Response) => {
        try {
            const { booking_id, amount } = req.body;
            const booking = await bookingService.getById(booking_id);
            if (!booking) {
                return res.status(404).json({ message: "Booking not found" });
            }

            const isBookingPaid = booking.payment_status === 'paid';

            // 1. Check existing order on PayOS if order_code exists (only if booking is NOT paid and no custom amount is requested)
            if (booking.order_code && !isBookingPaid && amount === undefined) {
                try {
                    const paymentDetail = await payosService.getPaymentDetail(Number(booking.order_code));
                    const status = paymentDetail.status;
                    console.log(`[PayOS Debug] Booking ${booking.id}, Status: ${status}, Keys: ${Object.keys(paymentDetail)}`);

                    // If still pending, return the existing checkoutUrl if available
                    if (status === "PENDING" && (paymentDetail as any).checkoutUrl) {
                        console.log(`Reusing existing PENDING link for booking ${booking.id}. URL: ${(paymentDetail as any).checkoutUrl}`);
                        return res.status(200).json({
                            message: "Payment link already exists",
                            data: paymentDetail
                        });
                    }

                    // If already paid, confirm and return error
                    if (status === "PAID") {
                        await bookingService.confirmPayment(booking.id, paymentDetail.id);
                        return res.status(400).json({ message: "Đơn hàng đã được thanh toán trước đó." });
                    }

                    // If EXPIRED, CANCELLED, or PENDING but missing checkoutUrl:
                    // We must generate a new order_code to create a fresh link
                    console.log(`Generating fresh link for booking ${booking.id} (Status: ${status}, No existing URL)`);
                    const newOrderCode = Number(String(Date.now()));
                    await bookingService.update(booking.id, { order_code: newOrderCode });
                    booking.order_code = newOrderCode;
                } catch (err: any) {
                    // If not found on PayOS, we can proceed to create
                    console.log(`Order ${booking.order_code} not found on PayOS or error: ${err.message}`);
                }
            }

            // If the booking was already paid or custom amount is requested, we MUST generate a fresh order_code
            if (isBookingPaid || amount !== undefined) {
                const newOrderCode = Number(String(Date.now()));
                await bookingService.update(booking.id, { order_code: newOrderCode });
                booking.order_code = newOrderCode;
            }

            // 2. Create or Re-create (if new/expired/cancelled)
            try {
                const paymentLink = await payosService.createPaymentLink(booking, amount);
                return res.status(200).json({
                    message: "Payment link created successfully",
                    data: paymentLink
                });
            } catch (payosError: any) {
                // Final fallback if creation still fails with "exists" (race condition or stale code)
                if (payosError.message && (payosError.message.includes("tồn tại") || payosError.message.includes("231"))) {
                    const newOrderCode = Number(String(Date.now()));
                    await bookingService.update(booking.id, { order_code: newOrderCode });
                    booking.order_code = newOrderCode;

                    const finalAttempt = await payosService.createPaymentLink(booking, amount);
                    return res.status(200).json({
                        message: "Payment link created after conflict",
                        data: finalAttempt
                    });
                }
                throw payosError;
            }
        } catch (error: any) {
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
