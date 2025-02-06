import mongoose from "mongoose";
import bcrypt  from "bcrypt";
import jwt from "jsonwebtoken";
const userSchema=new mongoose.Schema(
{
     username:{
        type:String,
        required:true,
        lowercase:true,
        trim:true,
        index:true
     },
     email:{
        type:String,
        required:true,
        unique:true
     },
     password:{
        type:String,
        required:[true,'password is required']
     },
     fullname:{
        type:String,
        required:true,
        trim:true,
     },
     avatar:{
        type:String,   //cloudinary url
        required:true
     },
     coverImage:{
        type:String    //cloudinary url
     },
     watchHistory:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Video'
        }
     ]      
},
{
    timestamps:true
 }

)


// userSchema.pre('save',async function(next){
//        if(!this.isModified('password'))return next();
//        this.password=await bcrypt.hash(this.password,10);
// })
userSchema.pre('save', async function (next) {
    const user=this;
    // Hash the password only if it is modified or new
    if(!user.isModified('password'))return next();
    try{
               //has the passsword  generation
               const salt = await bcrypt.genSalt(10);
               //hash the password
               const hashedPassword = await bcrypt.hash(user.password, salt);
               //override the plain password with the  hased password
               user.password=hashedPassword;
               next();
    }
    catch(err){
       return  next(err);
    }
});

userSchema.methods.isPasswordcorrect= async function(password){
        try{
           return await bcrypt.compare(password,this.password);
        }catch(err){
             throw err;
        }
}
userSchema.methods.generateAcessToken=function(){
        return  jwt.sign(
            {
                _id:this._id,
                username:this.username,
                email:this.email,
                fullname:this.fullname,
            },
            process.env.ACESS_TOKEN_SECRET,
            {
                expiresIn:process.env.ACESS_TOKEN_EXPIRY
            }
         )
}
userSchema.methods.generateRefreshToken= function(){
        return  jwt.sign(
            {
                _id:this._id,
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn:process.env.REFRESH_TOKEN_EXPIRY
            }
         )
}

export const User=mongoose.model('User',userSchema);

