import multer from 'multer';
import express from 'express';

type Request = express.Request

const storage = multer.diskStorage({
    destination: (_req: Request, _file, cb) => {
        cb(null, 'images/avatarUploads');
    },
    filename: (_req: Request, file, cb) => {
        console.log(file)
        cb(null, file.originalname)
    }
})

const uploadFile = multer({storage: storage}); 

export default uploadFile