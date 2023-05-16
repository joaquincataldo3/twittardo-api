import express from 'express'
import userRouter from './routes/user'
import twittRouter from './routes/twitt'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
// npm i @types of whatever library we are usi

dotenv.config()

const app = express()
const MONGO_URI = process.env.MONGO_URI

app.use(cookieParser())

app.use(express.json())
app.use('/user', userRouter)
app.use('/twitt', twittRouter)

mongoose.set('strictQuery', false)
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Mongo DB Connected');
        const PORT = 3000;
        app.listen(PORT, () => {
            console.log(`Server opened on ${PORT}`);
        })
    })
    .catch(err => {
        console.log(`Mongo DB connection error: ${err}`)
        process.exit(1)
    });
