import crypto from 'crypto';
// creamos una cadena de caracteres de 32 bytes
export const randomImageName = (avatar: Express.Multer.File) => {
    const bytes = 32;
    const randomWord = crypto.randomBytes(bytes).toString('hex');
    const fileName = randomWord + avatar.originalname;
    return fileName;
} 