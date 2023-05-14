import express from 'express'
import userRouter from './routes/user'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()
// npm i @types/express -D

const app = express()
const MONGO_URI = process.env.MONGO_URI

app.use(express.json())
app.use('/user', userRouter)

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
