import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    IntegerType,
    ForeignKey,
    OneToOne,
    JoinColumn,
} from "typeorm";
import { UserRole } from "./Enums";

@Entity({ name: "accounts" })
export class Account {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ nullable: false })
    username: string;

    @Column({ nullable: false })
    email: string;

    @Column({ nullable: false })
    password: string;

    @Column({
        type: "enum",
        enum: UserRole,
        default: UserRole.USER
    })
    role: UserRole;

    @Column({ nullable: false })
    is_active: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}