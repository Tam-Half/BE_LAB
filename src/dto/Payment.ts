import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
    CreateDateColumn
} from "typeorm";
import { Booking } from "./Booking";
import { PaymentStatus } from "./Enums";

@Entity({ name: "payments" })
export class Payment {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => Booking)
    @JoinColumn({ name: "booking_id" })
    booking: Booking;

    @Column({ type: "decimal", precision: 15, scale: 2, nullable: false })
    amount: number;

    @Column({ nullable: true })
    payment_method: string;

    @Column({ nullable: true })
    transaction_id: string;

    @Column({
        type: "enum",
        enum: PaymentStatus,
        default: PaymentStatus.PENDING
    })
    status: PaymentStatus;

    @Column({ type: "timestamp", nullable: true })
    payment_time: Date;

    @CreateDateColumn()
    created_at: Date;
}
