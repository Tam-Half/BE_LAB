# PLAN: PayOS Integration for DoraHotel

## Goal
Tích hợp cổng thanh toán PayOS để tự động hóa luồng thanh toán cho khách hàng khi đặt phòng.

## Task Breakdown

### Phase 1: Chuẩn bị & Cấu hình
- [ ] Cài đặt thư viện `@payos/node` (Backend)
- [ ] Cấu hình Webhook URL trên Dashboard PayOS (Nên dùng ngrok để test local)

### Phase 2: Phát triển Backend
- [ ] Tạo **PayosService**: Xử lý logic tạo link thanh toán và xác thực Webhook.
- [ ] Tạo **PaymentController**: Endpoint `/payos/create-link` và `/payos/webhook`.
- [ ] Cập nhật **PaymentRoute**: Đăng ký các route mới.
- [ ] Logic cập nhật trạng thái: Khi Payment thành công -> Booking "CONFIRMED".

### Phase 3: Kiểm thử & Xác minh
- [ ] Test tạo link thanh toán qua Postman.
- [ ] Giả lập Webhook để kiểm tra logic cập nhật DB.
- [ ] Kiểm tra trường hợp link thanh toán hết hạn.

## Phân công (Agent Assignments)
- **backend-specialist**: Thực hiện Phase 1 & 2.
- **qa-automation-engineer**: Thực hiện Phase 3.

## Danh sách kiểm tra (Verification Checklist)
- [ ] Link thanh toán được tạo đúng số tiền từ đơn đặt phòng.
- [ ] Webhook được xác thực đúng chữ ký (`signature`).
- [ ] Trạng thái thanh toán (`payment_status`) chuyển từ `unpaid` -> `paid`.
- [ ] Trạng thái đơn hàng (`status`) chuyển từ `PENDING` -> `CONFIRMED`.
