import express from "express";
// import { candidateInfoValidation, employerInfoValidation, loginValidation, registerValidation } from "./validator/userValidators";
import { validateRequest } from "../../middlewares/validateRequest";


import { authenticateToken } from "../../middlewares/authMiddleware";
import { restaurantValidator } from "./validator/createRestaurentValidate";
import { deleteRestaurant, listRestaurants, registerRestaurant, restaurantCoupons, restaurantInfo, restaurantUsers, updateRestaurant } from "./restaurantController/RestaurentController";



const restaurantRouter = express.Router();
// Route for user registration with validation middleware
restaurantRouter.get("/users", validateRequest, authenticateToken, restaurantUsers);
// restaurantRouter.get("/getRestaurentU", validateRequest, authenticateToken, restaurantUsers);
restaurantRouter.get("/coupons", validateRequest, authenticateToken, restaurantCoupons);
restaurantRouter.post("/createrestaurant", ...restaurantValidator, validateRequest, authenticateToken, registerRestaurant);
restaurantRouter.put("/:id", ...restaurantValidator, validateRequest, authenticateToken, updateRestaurant);
restaurantRouter.get("/info/:id", validateRequest, authenticateToken, restaurantInfo);
restaurantRouter.delete("/:id", validateRequest, authenticateToken, deleteRestaurant);
restaurantRouter.get("/listrestaurants", validateRequest, authenticateToken, listRestaurants);

export default restaurantRouter;
