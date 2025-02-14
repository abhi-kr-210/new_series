import {v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv"
dotenv.config({path:'./.env'});
// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});



const uploadOnCloudinary=async (localFilePath)=>{
    try{
         if(!localFilePath)return null;
         const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
         })
         //the file has been succesfully uploaded on clodinary
         console.log("file has been successfully uploaded ",response.url)
         fs.unlinkSync(localFilePath);
         return response;
    }catch(err){

        console.error("Error uploading to Cloudinary:", err);

        // Check if the file exists before trying to delete it
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath); //remove the locally saved temporary file as the upload operation 
//         operation got failed
        }
          return null
    }
}

export default uploadOnCloudinary;