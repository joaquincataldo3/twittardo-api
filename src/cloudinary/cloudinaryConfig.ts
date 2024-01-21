import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { ICloudinaryFolders } from '../utils/interfaces/interfaces'; 

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
    secure: true
});
   
export const handleUploadImage = async (imagePath: string, folder: string): Promise<UploadApiResponse> => {
    try {
        const result = await cloudinary.uploader.upload(imagePath, {
            folder
        });
        return result;
    } catch (error) {
        throw error
    }
}

export const handleDeleteImage = async (imagePublicId: string): Promise<any> => {
    try {
        const result = await cloudinary.uploader.destroy(imagePublicId);
        return result;
    } catch (error) {
        throw error;
    }
}

export const folderNames : ICloudinaryFolders = {
    twittsFolder: 'twitts',
    avatarsFolder: 'avatars'
}