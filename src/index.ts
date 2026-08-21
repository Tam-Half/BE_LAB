import express from "express"
import cors from "cors"
import { Request, Response } from "express"
import { initDataSource } from "./data-source"

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
import shiftRouter from "./routes/Shift.Route"
import chatRouter from "./routes/Chat.Route"
import roomClassRouter from "./routes/RoomClass.Route"
import reviewRouter from "./routes/Review.Route"
import reportRouter from "./routes/Report.Route"
import { authentification } from "./middleware/auth.middleware"
import { initCron } from "./helpers/cron"
import { loggingMiddleware } from "./middleware/loggin.middleware"

const app = express()
const port = 3000

app.use(express.json())
app.use(cors())
app.use(loggingMiddleware)

const API_PREFIX = "/api/v2";

initDataSource()

    .then(async () => {

        app.use(cors({ origin: '*' }))

        app.use(`${API_PREFIX}/auth`, authRouter)

        app.use(`${API_PREFIX}/user`, authentification, userRouter)
        app.use(`${API_PREFIX}/floor`, floorRouter)
        app.use(`${API_PREFIX}/hotel`, hotelRouter)
        app.use(`${API_PREFIX}/room`, authentification, roomRouter)
        app.use(`${API_PREFIX}/room-type`, roomTypeRouter)
        app.use(`${API_PREFIX}/bookings`, bookingRouter)
        app.use(`${API_PREFIX}/payments`, paymentRouter)
        app.use(`${API_PREFIX}/availability`, availabilityRouter)
        app.use(`${API_PREFIX}/extra-service`, extraServiceRouter)
        app.use(`${API_PREFIX}/shifts`, shiftRouter)
        app.use(`${API_PREFIX}/chat`, chatRouter)
        app.use(`${API_PREFIX}/room-classes`, roomClassRouter)
        app.use(`${API_PREFIX}/reviews`, reviewRouter)
        app.use(`${API_PREFIX}/reports`, reportRouter)
        initCron()

        app.listen(port, () => {
            console.log(`Server is running on ${port}`)
        })

    })
    .catch(error => {
        console.error("Database initialization failed:", error)
    })