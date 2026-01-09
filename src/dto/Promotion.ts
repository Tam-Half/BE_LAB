import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "promotions" })
export class Promotion {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false, unique: true })
    code: string;

    @Column({ nullable: true })
    discount_percent: number;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    max_discount_amount: number;

    @Column({ type: "timestamp", nullable: true })
    start_date: Date;

    @Column({ type: "timestamp", nullable: true })
    end_date: Date;

    @Column({ default: true })
    is_active: boolean;
}
