import express from "express"
import cors from "cors";
import cookieParser from "cookie-parser"
const app=express();

app.use(cors({
    origin:process.env.CROSS_ORIGIN,
    credentials:true
}))
app.use(express.json({limit:"20kb"}));
app.use(express.urlencoded({extended:true,limit:"20kb"}));
app.use(express.static("public"));
app.use(cookieParser());


//routes import
import userRoutes from "./routes/user.routes.js";
app.use("/api/v1/user",userRoutes);

export {app};