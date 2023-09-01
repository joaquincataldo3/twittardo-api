import crypto from 'crypto';
// creamos una cadena de caracteres de 32 bytes
export const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')