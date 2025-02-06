import mongoose, { model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema=new mongoose.Schema(
    {
        videoFile:{
            type:String,   //cloudinary url
            required:true
        },
        thumbnail:{
            type:String,   //cloudinary url
            required:true
        },
        title:{
            type:String,
            required:true
        },
        description:{
            type:String,
            required:true
        },
        duration:{
            type:String,  //cloudinary
            required:true
        },
        views:{
            type:Number,
            default:0
        },
        likes:{
            type:Number,
            default:0
        },
        dislikes:{
            type:Number,
            default:0
        },
        comments:[
            {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
           }
        ],
        owner:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        isPublished:{
            type:Boolean,
            default:true
        }
    },
    {
        timestamps:true
    }
)

videoSchema.plugin(mongooseAggregatePaginate);
export const Video=mongoose.model('Video',videoSchema);