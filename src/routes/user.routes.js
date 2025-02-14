import {Router } from "express";
import { registerUser,getinfo, loginuser, logoutuser, refreshAccessToken ,getCurrentUser,
    changeCurrentPassword,updateAccountDetails
} from "../controllers/user.controller.js";
const router=Router();
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
router.route("/register").post(
    upload.fields([
        {  name:"avatar",
           maxCount:1
       },
       {
        name:"coverimage",
        maxCount:1
       }
    ]),
    registerUser);
router.route("/getinfo").get(getinfo);
//secure route
router.route("/login").post(loginuser);
router.route("/logout").post(verifyJwt,logoutuser)
router.route("/refreshtoken").post(refreshAccessToken);
router.route("/profile").get(verifyJwt,getCurrentUser);
router.route("/updatepassword").post(verifyJwt,changeCurrentPassword);
router.route("/upadateaccountdetail").post(verifyJwt,updateAccountDetails)
export default router;