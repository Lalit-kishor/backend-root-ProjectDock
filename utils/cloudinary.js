import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config();

// console.log('first cloud name: ', process.env.CLOUDINARY_CLOUD_NAME);


if (!process.env.CLOUDINARY_CLOUD_NAME
	|| !process.env.CLOUDINARY_API_KEY
	|| !process.env.CLOUDINARY_API_SECRET) {
	console.error("Environment variables not set");
	
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

if (!cloudinary.config().cloud_name
	|| !cloudinary.config().api_key
	|| !cloudinary.config().api_secret) {
	console.error("Cloudinary config not set up");
	
}

export const uploadOnCloudinary = async (localPath) => {
    try {
        if(!localPath) return null;

        // console.log('cloud name: ', process.env.CLOUDINARY_CLOUD_NAME);

        const response = await cloudinary.uploader.upload(localPath, {
            resource_type: 'auto'
        });

        // console.log('File uploaded on cloudinary: ', response.url);
        fs.unlinkSync(localPath);

        return response;
        
    } catch (error) {
        console.log('Error in uploadOnCloudinary: ', error);
        fs.unlinkSync(localPath);
        return null;
    }
};