import express from "express";
import { loginValidation, registerValidation } from "./validator/userValidators";
import { validateRequest } from "../../middlewares/validateRequest";
import { registerUser } from "./userController/registerController";
import { deleteUser, loginUser, restaurentUser } from "./userController/loginController";
import { authenticateToken } from "../../middlewares/authMiddleware";
import { redeemCoupen, getUserConsumptionData, getRestaurent } from "./userController/userConsumptionController";


const userRouter = express.Router();

// Route for user registration with validation middleware
userRouter.post("/register", ...registerValidation, validateRequest, registerUser);

// Route for user login with validation middleware
userRouter.post("/login", ...loginValidation, validateRequest, loginUser);
userRouter.post("/login/restaurent", ...loginValidation, validateRequest, restaurentUser);

userRouter.delete("/", deleteUser);

//  user Consumtion routes 
// connect user to restaurent after scan 
userRouter.get("/getrestaurant", validateRequest, authenticateToken, getRestaurent);
userRouter.get("/getrestaurant/:couponId", validateRequest, authenticateToken, getUserConsumptionData);
userRouter.get("/redeemCoupon/:couponId/:userId", validateRequest, authenticateToken, redeemCoupen);
export default userRouter;
