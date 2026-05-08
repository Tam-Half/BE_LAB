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
import extraServiceRouter from "./routes/ExtraService.Route"
import shiftRouter from "./routes/Shift.Route";
import chatRouter from "./routes/Chat.Route"
import { RoomClass } from "./dto/RoomClass"
import roomClassRouter from "./routes/RoomClass.Route"
import reviewRouter from "./routes/Review.Route"
import { authentification } from "./middleware/auth.middleware"

import { initCron } from "./helpers/cron"
import { loggingMiddleware } from "./middleware/loggin.middleware"

const app = express()
const port = 3000
app.use(express.json())
app.use(cors())
app.use(loggingMiddleware)

AppDataSource.initialize().then(async () => {
    app.use(cors({ origin: '*' }));
    app.use("/api/auth", authRouter)
    app.use("/api/user", userRouter)
    app.use("/api/floor", floorRouter)
    app.use("/api/hotel", hotelRouter)
    app.use("/api/room", roomRouter)
    app.use("/api/room-type", roomTypeRouter)
    app.use("/api/bookings", bookingRouter)
    app.use("/api/payments", paymentRouter)
    app.use("/api/availability", availabilityRouter)
    app.use("/api/extra-service", extraServiceRouter)
    app.use("/api/shifts", shiftRouter);
    app.use("/api/chat", chatRouter)
    app.use("/api/room-classes", roomClassRouter)
    app.use("/api/reviews", reviewRouter)

    initCron()

    app.listen(port, () => {
        console.log(`Server is running on ${port}`)
    })

}).catch(error => console.log(error))
