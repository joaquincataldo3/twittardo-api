import multer from 'multer';
import express from 'express';

type Request = express.Request

const storage = multer.diskStorage({
    destination: (_req: Request, _file, cb) => {
        cb(null, 'src/images/twitsImages');
    },
    filename: (_req: Request, file, cb) => {
        cb(null, Date.now() + file.originalname)
    }
})

const uploadFile = multer({storage: storage}); 

export default uploadFile