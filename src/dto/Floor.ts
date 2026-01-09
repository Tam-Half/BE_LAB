import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { Hotel } from "./Hotel";

@Entity({ name: "floors" })
export class Floor {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Hotel, (hotel) => hotel.floors, { onDelete: "CASCADE" })
    @JoinColumn({ name: "hotel_id" })
    hotel: Hotel;

    @Column({ nullable: true })
    name: string;

    @CreateDateColumn()
    created_at: Date;
}
