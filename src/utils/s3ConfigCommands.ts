import dotenv from 'dotenv';
import { S3ClientConfig, S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand} from "@aws-sdk/client-s3";
import { randomImageName } from "./randomImageName";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

dotenv.config()

const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;
const bucketName = process.env.BUCKET_NAME;

export const s3Config: S3ClientConfig = {
  credentials: {
    accessKeyId: accessKey!,
    secretAccessKey: secretAccessKey!,
  },
  region: bucketRegion,
};

const s3 = new S3Client(s3Config);
let randomName = null;
// armamos el objeto que tiene que tener estos parametros para el bucket
export const handlePutCommand = async (avatar: Express.Multer.File, folder: string) => {
  const bucketParams = {
    Bucket: bucketName,
    Key: `${folder}/${randomImageName()}`,
    Body: avatar.buffer,
    ContentType: avatar.mimetype
  };
  randomName = bucketParams.Key;
  // instanciamos la clase de put object comand con los params
  const command = new PutObjectCommand(bucketParams);
  // enviamos
  await s3.send(command)
  return randomName;
}

// en este caso recibe el string de avatar que es el randomname
export const handleDeleteCommand = async (avatar: string, folder: string) => {
  const deleteParams = {
    Bucket: bucketName,
    Key: `${folder}/${avatar}`
  };
  const delCommand = new DeleteObjectCommand(deleteParams);
  await s3.send(delCommand);
}

// para obtener la url temporal
export const handleGetCommand = async (image: string, folder: string) => {
  let getObjectParams = {
    Bucket: bucketName,
    Key: `${folder}/${image}`
  }
  let command = new GetObjectCommand(getObjectParams);
  let url = await getSignedUrl(s3, command, { expiresIn: 1800 }); //30 min
  return url;
} 
