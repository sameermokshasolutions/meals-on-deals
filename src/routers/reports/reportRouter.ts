import express from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { summary } from "./reportController/reportController";
import { authenticateToken } from "../../middlewares/authMiddleware";
const reportRouter = express.Router();

// Route for user registration with validation middleware


reportRouter.get("/", validateRequest, authenticateToken, summary);

// Route for user login with validation middleware

export default reportRouter;
