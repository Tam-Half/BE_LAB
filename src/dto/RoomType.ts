import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    OneToMany,
} from "typeorm";

@Entity({ name: "room_types" })
export class RoomType {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    name: string;

    @Column({ nullable: true })
    slug: string;

    @Column({ type: "text", nullable: true })
    description: string;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    base_price: number;

    @Column({ nullable: true })
    capacity_adults: number;

    @Column({ nullable: true })
    capacity_children: number;

    @Column({ nullable: true })
    size_m2: number;

    @CreateDateColumn()
    created_at: Date;

    @OneToMany("Room", "roomType")
    rooms: any[];
}
