import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./dto/User"
import { Account } from "./dto/Account"
import * as dotenv from "dotenv"
import { Hotel } from "./dto/Hotel"
import { Floor } from "./dto/Floor"
import { RoomType } from "./dto/RoomType"
import { RoomTypeImage } from "./dto/RoomTypeImage"
import { Room } from "./dto/Room"

import { Amenities } from "./dto/Amenities"
import { RoomTypeAmenities } from "./dto/RoomTypeAmenities"

import { Promotion } from "./dto/Promotion"
import { Booking } from "./dto/Booking"
import { BookingDetail } from "./dto/BookingDetail"

import { Review } from "./dto/Review"
import { BookingRoomAllocation } from "./dto/BookingRoomAllocation"
import { Payment } from "./dto/Payment"

dotenv.config()

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: [User, Account, Hotel, Floor, Room, RoomType, RoomTypeImage, Amenities, RoomTypeAmenities, Promotion, Booking, BookingDetail, Review, BookingRoomAllocation, Payment],
    migrations: [],
    subscribers: [],
})
