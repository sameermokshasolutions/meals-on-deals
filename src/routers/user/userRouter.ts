import express from "express";
import { loginValidation, otpValidation, registerValidation } from "./validator/userValidators";
import { validateRequest } from "../../middlewares/validateRequest";
import { addLogo, generateOtp, registerUser } from "./userController/registerController";
import { deleteUser, loginUser, logoutUser, restaurentUser } from "./userController/loginController";
import { authenticateToken } from "../../middlewares/authMiddleware";
import { redeemCoupen, getUserConsumptionData, getRestaurent } from "./userController/userConsumptionController";


const userRouter = express.Router();

// OTP Verification
userRouter.post('/generate-otp', ...registerValidation, validateRequest, generateOtp);

// Route for user registration with validation middleware
userRouter.post("/register", ...otpValidation, validateRequest, registerUser);
userRouter.post("/updateLogo", validateRequest, authenticateToken, addLogo);
// Route for user login with validation middleware
userRouter.post("/login", ...loginValidation, validateRequest, loginUser);
userRouter.post("/logout", validateRequest, logoutUser);
userRouter.post("/login/restaurent", ...loginValidation, validateRequest, restaurentUser);
userRouter.delete("/", deleteUser);
//  user Consumtion routes 
// connect user to restaurent after scan 
userRouter.get("/getrestaurant", validateRequest, authenticateToken, getRestaurent);
userRouter.get("/getrestaurant/:barcodeId", validateRequest, authenticateToken, getUserConsumptionData);
userRouter.get("/redeemCoupon/:couponId/:userId", validateRequest, authenticateToken, redeemCoupen);

export default userRouter;
