import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    OneToMany,
} from "typeorm";
import { Floor } from "./Floor";

@Entity({ name: "hotels" })
export class Hotel {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    name: string;

    @Column({ nullable: true })
    address: string;

    @Column({ type: "text", nullable: true })
    description: string;

    @Column({ nullable: true })
    hotline: string;

    @Column({ nullable: true })
    email_contact: string;

    @CreateDateColumn()
    created_at: Date;

    @OneToMany(() => Floor, (floor) => floor.hotel)
    floors: Floor[];
}
