import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import userRouter from './routes/user';
import twittRouter from './routes/twitt';
import commentRouter from './routes/comment';
import { PORT } from './utils/interfaces/interfaces';
import cors from 'cors';
import path from 'path';
import session from 'express-session';
import fileUpload from 'express-fileupload';
import { tempFilePath } from './utils/constants/userUtils';
dotenv.config();

declare module 'express' {
    interface Request {
      user?: any;
    }
  }

const app = express()
const MONGO_URI = process.env.MONGO_URI;
const SESSION_SECRET = process.env.SESSION_SECRET!;

app.use('/images', express.static(path.join(__dirname, '../')));
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : tempFilePath,
    debug: true
}));
app.use(cookieParser())
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60,
        sameSite: false,
        secure: process.env.NODE_ENV == 'production' ? true : false
    }
}));
app.use(cors({
    origin: process.env.REACT_APP_URL,
    credentials:true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/users', userRouter);
app.use('/twitts', twittRouter);
app.use('/comments', commentRouter);

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

