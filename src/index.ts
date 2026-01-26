import { AppDataSource } from "./data-source"
import { User } from "./dto/User"
import { Account } from "./dto/Account"
import express from "express"
import cors from "cors"
import { Request, Response } from "express"
import authRouter from "./routes/Auth.Route"
import userRouter from "./routes/User.Route"
import floorRouter from "./routes/Floor.Route"
import hotelRouter from "./routes/Hotel.Route"
import roomRouter from "./routes/Room.Route"
import roomTypeRouter from "./routes/RoomType.Route"
import bookingRouter from "./routes/Booking.Route"
import paymentRouter from "./routes/Payment.Route"
import availabilityRouter from "./routes/Availability.Route"
import { authentification } from "./middleware/auth.middleware"
import { initCron } from "./helpers/cron"

const app = express()
const port = 3000
app.use(express.json())
app.use(cors())

AppDataSource.initialize().then(async () => {

    app.use("/api/auth", authRouter)
    app.use("/api/user", userRouter)
    app.use("/api/floor", floorRouter)
    app.use("/api/hotel", hotelRouter)
    app.use("/api/room", roomRouter)
    app.use("/api/room-type", roomTypeRouter)
    app.use("/api/booking", bookingRouter)
    app.use("/api/payment", paymentRouter)
    app.use("/api/availability", availabilityRouter)

    initCron()

    app.listen(port, () => {
        console.log(`Server is running on ${port}`)
    })

}).catch(error => console.log(error))
