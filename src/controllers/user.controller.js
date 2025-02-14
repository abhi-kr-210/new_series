import { ApiError } from "../utils/ApiError.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"
dotenv.config({path:'./.env'});
const generateAccessandrefreshTokens=async (userId)=>{
       try{
        const user=await User.findById(userId);
    
          const accessToken=user.generateAccessToken();
          const refreshToken=user.generateRefreshToken();
          //save refresh token in db
          
          user.refreshToken=refreshToken;
          await user.save({validateBeforeSave:false});
          return {accessToken,refreshToken};
       }catch(err){
           throw new ApiError(500,"something went wrong while generatiing refresh and access token")
       }
}
const registerUser=asyncHandler(async(req,res)=>{
          //get all data from the user
          //check if all req data came from the client
          //check if data already exist
          //check for avatar
          //upload file on clodinary,avatar
          //create user object-create entry in db
          //remove password and refresh token from response
          //check for user creation
          //return the response
          const {username,email,password,fullname}=req.body;
          if([username,email,password,fullname].some((field)=>
            field?.trim()===""
          )){
            throw new ApiError(400,"all fields are required");
          }
           const existedUser=await User.findOne({
               $or:[{username},{email}]
           }) 
           if(existedUser){
            throw new ApiError(400,"user already exist");
        }
        const avatar = req.files?.avatar?.[0]?.path;//avatar is an array of avatars so [0]
        const coverimage = req.files?.coverimage?.[0]?.path;
        if(!avatar){
            throw new ApiError(400,"avatar field is required");
        }
        //import clodinary
        const avatarResponse=await uploadOnCloudinary(avatar);
        const coverimageResponse=await uploadOnCloudinary(coverimage);
        if(!avatarResponse){
            throw new ApiError(400,"avatar upload failed");
        }
        const createuser=await User.create({
               fullname,
               avatar:avatarResponse.url,
               coverimage:coverimageResponse?.url||"",
               email,
               password,
               username:username.toLowerCase()
        })
       const newcreateduser= await User.findById(createuser._id).select("-password -refreshToken");
       if(!newcreateduser){
        throw new ApiError(400,"user creation failed while creating the user");
       }
       return res.status(200).json(
               new ApiResponse(200,newcreateduser,"user registered successfully")
        )
             
      })
// const registerUser=async(req,res)=>{
//     try{
//        res.status(200).json({
//          message:"user registered successfully by me"
//      });
//     }catch(err){
//        return err;
//     }
// }
const loginuser=asyncHandler(async(req,res)=>{
         //take data from req body
         //username or email
         //find the user
         //check for the password
         //acess and refresh token 
         //send the cookie
         const {email,username,password}=req.body;
         if(!email && !username){
            throw new ApiError(400,"email or username is required");
         }
         const user=await User.findOne({
            $or:[{email},{username}]
         })
         if(!user){
            throw new ApiError(400,"user not found");
         }
         const isvalidpassword=await user.isPasswordcorrect(password);
         if(!isvalidpassword){
            throw new ApiError(400,"invalid password");
         }
        const {accessToken,refreshToken}=await generateAccessandrefreshTokens(user._id);
        const loggedInuser=await User.findById(user._id).select("-password -refreshToken");

        const options={
            httpOnly:true,
            secure:true
        }
        //send cookies
        res.status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            new ApiResponse(200,
                {
                    user:loggedInuser,
                    accessToken,
                    refreshToken
                }
                ,"user logged in successfully")
        )
})


const logoutuser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(req.user._id,
        
        {
            $set:{
                refreshToken:undefined
            }
        },{
            new:true
        }
      )
      const options={
        httpOnly:true,
        secure:true
    }
      //now clear the cookies
      res.status(200)
      .clearCookie("accessToken",options)
      .clearCookie("refreshToken",options)
      .json(
        new ApiResponse(200,"user logged out successfully")
      )
})


const getinfo=asyncHandler(async(req,res)=>{
    const users = await User.find().select("-password -refreshToken");
    if(!users){
        throw new ApiError(400,"user not found");
    }
    return res.json(
        new ApiResponse(200,users,"users fetched successfully")
    )
        
})

const changeCurrentPassword=asyncHandler(async(req,res)=>{
      const{currentpassword,newpassword,confirmpassword}=req.body;
      if(newpassword!==confirmpassword){
        throw new ApiError(400,"new password and confirm password do not match");
      }
     const user= await User.findById(req.user._id);
      if(!user){
        throw new ApiError(400,"user not found");
      }
      const iscorrectpassword=await user.isPasswordcorrect(currentpassword);
    
      if(!iscorrectpassword){   
        throw new ApiError(400,"invalid current password");
      }
      user.password=newpassword;
     await user.save({validateBeforeSave:false});
      return res.status(200)
      .json(
          new ApiResponse(200,{},"password changed successfully")
      )

})
const getCurrentUser=asyncHandler(async(req,res)=>{
    return res.json(
        new ApiResponse(200,req.user,"user fetched successfully")
    )
})

const updateAccountDetails=asyncHandler(async(req,res)=>{
    const {fullname,email}=req.body;
    if(!fullname &&!email){
        throw new ApiError(400,"fullname or email is required");
    }
        // Construct the update object dynamically
        const updateFields = {};
        if (fullname) updateFields.fullname = fullname;
        if (email) updateFields.email = email;
    const user=await User.findByIdAndUpdate(
         req.user?._id,
         {  
             $set:updateFields
         }
         ,{
            new:true
         }
    ).select("-password -refreshToken");
    if(!user){  
        throw new ApiError(400,"user not found");
    }
    return res.status(200).json(
          new ApiResponse(200,user,"user updated successfully")
    )

})

const updateAvatar=asyncHandler(async(req,res)=>{
          const avatarlocalpath=req.file?.path;
          if(!avatarlocalpath){
             throw ApiError(4000,"Avatar file is missing")
          }
        // Fetch user from database
        const user = await User.findById(req.user?._id);
        if (!user) {
            throw new ApiError(400, "User not found");
        }

        // Extract public ID from existing Cloudinary URL
        if (user.avatar) {
            const publicId = user.avatar.split("/").pop().split(".")[0]; // Extract ID from URL
            await cloudinary.uploader.destroy(publicId); // Delete from Cloudinary
        }

          const avatar=await uploadOnCloudinary(avatarlocalpath);
          if(!avatar.url){
             throw new ApiError(400,"Error while uploading file on clodinary")
          }
        const newuser=  await User.findByIdAndUpdate(
              req.user?._id,
              {
                $set:{avatar:avatar.url}
              },{
                new:true
              }
          ).select("-password -refreshToken");
    
          if(!newuser){
             throw new ApiError(400,"user not found")
          }
          return res.status(200).json(
              new ApiResponse(200,newuser,"avatar updated successfully")
          )
})

const updateCoverimage=asyncHandler(async(req,res)=>{
    const coverimagelocalpath=req.file?.path;
    if(!coverimagelocalpath){
       throw ApiError(4000,"Avatar file is missing")
    }

        // Fetch user from database
        const user = await User.findById(req.user?._id);
        if (!user) {
            throw new ApiError(400, "User not found");
        }

        // Extract public ID from existing Cloudinary URL
        if (user.coverImage) {
            const publicId = user.avatar.split("/").pop().split(".")[0]; // Extract ID from URL
            await cloudinary.uploader.destroy(publicId); // Delete from Cloudinary
        }

    const coverimage=await uploadOnCloudinary(coverimagelocalpath);
    if(!avatar.url){
       throw new ApiError(400,"Error while uploading file on clodinary")
    }
  const newuser=  await User.findByIdAndUpdate(
        req.user?._id,
        {
          $set:{coverImage:coverimage.url}
        },{
          new:true
        }
    ).select("-password -refreshToken");

    if(!newuser){
       throw new ApiError(400,"user not found")
    }
    return res.status(200).json(
        new ApiResponse(200,newuser,"coverimage updated successfully")
    )
})

const refreshAccessToken=asyncHandler(async(req,res)=>{
       const incomingrefreshtoken=req.cookies?.refreshToken||req.body.refreshToken;
        if(!incomingrefreshtoken){
            throw new ApiError(401,"unothorized request");
        }
       const decodedToken=jwt.verify(incomingrefreshtoken,process.env.REFRESH_TOKEN_SECRET);
       const user=await User.findById(decodedToken?._id).select("-password -refreshToken");
       if(!user){
        throw new ApiError(401,"invalid refresh Token")
       }
       const {accessToken,refreshToken}=await generateAccessandrefreshTokens(user._id);

        
       const options={
        httpOnly:true,
        secure:true
    }
    //send cookies
    res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
                {
                    user:user,
                    accessToken,
                    refreshToken,
                },
            "access token updated  successfully"
        )
    )

})
export {registerUser,getinfo,loginuser,logoutuser,refreshAccessToken,
    getCurrentUser,changeCurrentPassword,updateAccountDetails
};

