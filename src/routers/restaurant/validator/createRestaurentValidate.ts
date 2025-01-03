import { body, ValidationChain } from "express-validator";

// Login validations 
export const restaurantValidator: ValidationChain[] = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email format')
        .normalizeEmail(),

    body('address')
        .trim()
        .notEmpty()
        .withMessage('Address is required'),
    body('restaurantName')
        .trim()
        .notEmpty()
        .withMessage('restaurant name is required')
];