import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { Booking } from "./Booking";
import { User } from "./User";

@Entity({ name: "reviews" })
export class Review {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Booking, (booking) => booking.id)
    @JoinColumn({ name: "booking_id" })
    booking: Booking;

    @ManyToOne(() => User, (user) => user.id)
    @JoinColumn({ name: "user_id" })
    user: User;

    @Column({ nullable: false })
    rating: number;

    @Column({ type: "text", nullable: true })
    comment: string;

    @CreateDateColumn()
    created_at: Date;
}
