import { S3ClientConfig } from "@aws-sdk/client-s3";
import dotenv from 'dotenv';
dotenv.config()

const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

export const s3Config: S3ClientConfig = {
    credentials: {
        accessKeyId: accessKey!,
        secretAccessKey: secretAccessKey!,
      },
      region: bucketRegion,
};