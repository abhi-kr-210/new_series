import mongoose from "mongoose";
import {DB_NAME} from "../constsnts.js";

const connectdb=async()=>{
     try{
        const connectioninstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`database connected successfully ,connection host :${
            connectioninstance.connection.host
        }`);

     }catch(err){
        console.log("your  database connection failed :",err);
     }
}

export default connectdb;