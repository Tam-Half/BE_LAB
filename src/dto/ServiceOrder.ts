import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { Booking } from "./Booking";
import { ExtraService } from "./ExtraService";

@Entity({ name: "service_orders" })
export class ServiceOrder {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Booking, (booking) => booking.id, { onDelete: "CASCADE" })
    @JoinColumn({ name: "booking_id" })
    booking: Booking;

    @ManyToOne(() => ExtraService, { onDelete: "RESTRICT" })
    @JoinColumn({ name: "service_id" })
    service: ExtraService;

    // Snapshot name and price to keep history accurate even if ExtraService changes
    @Column({ nullable: false })
    service_name_snapshot: string;

    @Column({ type: "int", default: 1 })
    quantity: number;

    @Column({ type: "decimal", precision: 15, scale: 2, nullable: false })
    unit_price: number;

    @Column({ type: "decimal", precision: 15, scale: 2, nullable: false })
    total_price: number;

    @Column({ default: "pending" }) // pending, fulfilled, cancelled
    status: string;

    @Column({ type: "text", nullable: true })
    note: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
