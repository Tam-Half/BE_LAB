import { AppDataSource } from "./data-source"
import { User } from "./dto/User"
import { Account } from "./dto/Account"
import * as express from "express"
import * as cors from "cors"
import { Request, Response } from "express"
import authRouter from "./routes/Auth.Route"
import userRouter from "./routes/User.Route"
import { authentification } from "./middleware/auth.middleware"

const app = express()
app.use(express.json())
app.use(cors())

AppDataSource.initialize().then(async () => {

    app.use("/api/auth", authRouter)
    app.use("/api/user", userRouter)

    app.listen(3000, () => {
        console.log("Server is running on port 3000")
    })

}).catch(error => console.log(error))
