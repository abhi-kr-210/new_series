// require("dotenv").config({path:'./.env'});
import dotenv from "dotenv"
import connectdb from "./db/db.js";
import {app} from "./app.js"
dotenv.config({path:'./.env'});



connectdb()
.then(()=>{
     app.listen(process.env.PORT,
        ()=>{ console.log("server is started successfully")
     })
})
.catch((err)=>{
    console.log("database connection failed",err)
})



