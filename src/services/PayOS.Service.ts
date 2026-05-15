import { PayOS } from "@payos/node";
import dotenv from "dotenv";

dotenv.config();

const payos = new PayOS({
    clientId: process.env.PAYOS_CLIENT_ID || "",
    apiKey: process.env.PAYOS_API_KEY || "",
    checksumKey: process.env.PAYOS_CHECKSUM_KEY || ""
});

const domain = window.__ENV__?.API_URL || "http://localhost:5173";

const payosService = {
    createPaymentLink: async (booking: any) => {


        const body: any = {
            orderCode: Number(booking.order_code),
            amount: Number(booking.total_price),
            description: `TT DoraHotel ${booking.booking_code}`.slice(0, 25),
            items: booking.bookingDetails.map((detail: any) => ({
                name: detail.roomType.name,
                quantity: detail.quantity,
                price: Number(detail.price_at_booking)
            })),
            returnUrl: `${domain}/payment/success?booking_id=${booking.id}`,
            cancelUrl: `${domain}/payment/cancel?booking_id=${booking.id}`,
            expiredAt: Math.floor(booking.expires_at.getTime() / 1000)
        };

        return await payos.paymentRequests.create(body);
    },

    verifyWebhookData: (webhookBody: any) => {
        return payos.webhooks.verify(webhookBody);
    },

    getPaymentDetail: async (orderCode: number) => {
        return await payos.paymentRequests.get(orderCode);
    }
};

export default payosService;
