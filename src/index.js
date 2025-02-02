// require("dotenv").config({path:'./.env'});
import dotenv from "dotenv"
import express from "express";
import connectdb from "./db/db.js";
dotenv.config({path:'./.env'});
const app=express();


connectdb();
app.listen(process.env.PORT,
    ()=>{console.log("server is started successfully")
})


