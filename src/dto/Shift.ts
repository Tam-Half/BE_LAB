import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn
} from "typeorm";
import { Account } from "./Account"; // Import entity Account cũ của bạn

@Entity({ name: "shifts" })
export class Shift {
    @PrimaryGeneratedColumn()
    id: number;

    // Nhân viên trực ca
    @ManyToOne(() => Account, (account) => account.id)
    @JoinColumn({ name: "staff_id" })
    staff: Account;

    // Thời gian bắt đầu ca (Check-in)
    @Column({ type: "timestamp", nullable: false })
    start_time: Date;

    // Thời gian kết thúc ca (Check-out) - Nullable vì khi mới tạo ca thì chưa kết thúc
    @Column({ type: "timestamp", nullable: true })
    end_time: Date;

    // Tiền mặt đầu ca (Ví dụ: Tiền lẻ để thối lại)
    @Column({ type: "decimal", precision: 15, scale: 2, default: 0 })
    initial_cash: number;

    // Tổng doanh thu hệ thống tính toán được trong khoảng thời gian này (Lưu lại khi đóng ca)
    @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
    system_revenue: number;

    // Số tiền thực tế nhân viên bàn giao (Dùng để đối soát xem có bị lệch/mất tiền không)
    @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
    actual_cash_handover: number;

    // Ghi chú khi giao ca (ví dụ: "Khách phòng 302 nợ giấy tờ")
    @Column({ type: "text", nullable: true })
    note: string;

    // Trạng thái: 'open' (đang làm) | 'closed' (đã chốt)
    @Column({ default: "open" })
    status: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}