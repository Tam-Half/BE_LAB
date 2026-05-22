import "reflect-metadata"
import { DataSource } from "typeorm"
import * as dotenv from "dotenv"

import { User } from "./dto/User"
import { Account } from "./dto/Account"
import { Hotel } from "./dto/Hotel"
import { Floor } from "./dto/Floor"
import { RoomType } from "./dto/RoomType"
import { RoomTypeImage } from "./dto/RoomTypeImage"
import { Room } from "./dto/Room"
import { RoomClass } from "./dto/RoomClass"
import { Amenities } from "./dto/Amenities"
import { RoomTypeAmenities } from "./dto/RoomTypeAmenities"
import { Promotion } from "./dto/Promotion"
import { Booking } from "./dto/Booking"
import { BookingDetail } from "./dto/BookingDetail"
import { Review } from "./dto/Review"
import { BookingRoomAllocation } from "./dto/BookingRoomAllocation"
import { Payment } from "./dto/Payment"
import { BookingRoom } from "./dto/BookingRoom"
import { ServiceOrder } from "./dto/ServiceOrder"
import { ExtraService } from "./dto/ExtraService"
import { Shift } from "./dto/Shift"

dotenv.config()

const isProduction = process.env.NODE_ENV === "production"

export const AppDataSource = new DataSource({
    type: "postgres",

    ...(isProduction
        ? {
            url: process.env.DB_URL,
            ssl: {
                rejectUnauthorized: false
            }
        }
        : {
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        }),

    synchronize: true,
    logging: false,

    entities: [
        User,
        Account,
        Hotel,
        Floor,
        Room,
        RoomType,
        RoomClass,
        RoomTypeImage,
        Amenities,
        RoomTypeAmenities,
        Promotion,
        Booking,
        BookingDetail,
        Review,
        BookingRoomAllocation,
        Payment,
        BookingRoom,
        ServiceOrder,
        ExtraService,
        Shift
    ],

    migrations: [],
    subscribers: [],
})

export async function initDataSource() {
    try {
        await AppDataSource.initialize()
        console.log("Database connected successfully")
    } catch (error) {
        console.error("Database connection failed:", error)
        throw error
    }
}
