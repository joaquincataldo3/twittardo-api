import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import userRouter from './routes/user'
import twittRouter from './routes/twitt'
import commentRouter from './routes/comment'
import { PORT } from './types'
import cors from 'cors'
dotenv.config()

const app = express()
const MONGO_URI = process.env.MONGO_URI

app.use(cors())
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: false }));

app.use('/users', userRouter)
app.use('/twitts', twittRouter)
app.use('/comments', commentRouter)

mongoose.set('strictQuery', false)
if (MONGO_URI) {
    mongoose.connect(MONGO_URI)
        .then(() => {
            console.log('Mongo DB Connected');
            const PORT: PORT = process.env.PORT || 3000;
            app.listen(PORT, () => {
                console.log(`Server opened on ${PORT}`);
            })
        })
        .catch(err => {
            console.log(`Mongo DB connection error: ${err}`)
            process.exit(1)
        });
} else {
    console.log('MONGO_URI undefined')
    process.exit(1)
}

