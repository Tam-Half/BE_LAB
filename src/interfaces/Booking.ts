export interface BookingFilter {
    status?: string;
    user_id?: number;
    hotel_id?: number;
    start_date?: string;
    end_date?: string;
    page?: number;   // Dùng cho phân trang
    limit?: number;  // Dùng cho phân trang
    booking_code?: string;
}