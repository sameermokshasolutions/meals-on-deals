import { body, param } from 'express-validator';

export const validateCreateCoupen = [
    body('coupenTitle')
        .notEmpty().withMessage('Coupen title is required')
        .isString().withMessage('Coupen title must be a string'),
    body('discount')
        .notEmpty().withMessage('Discount is required')
        .isNumeric().withMessage('Discount must be a number')
        .isFloat({ min: 0, max: 100 }).withMessage('Discount must be between 0 and 100'),
    body('restaurantId')
        .notEmpty().withMessage('restaurant ID is required')
        .isMongoId().withMessage('Invalid restaurant ID format'),
];

export const validateUpdateCoupen = [
    param('coupenId')
        .notEmpty().withMessage('Coupen ID is required')
        .isMongoId().withMessage('Invalid coupen ID format'),
    body('coupenTitle')
        .optional()
        .isString().withMessage('Coupen title must be a string'),
    body('discount')
        .optional()
        .isNumeric().withMessage('Discount must be a number')
        .isFloat({ min: 0, max: 100 }).withMessage('Discount must be between 0 and 100'),
];

export const validateActivateDeactivateCoupen = [
    param('coupenId')
        .notEmpty().withMessage('Coupen ID is required')
        .isMongoId().withMessage('Invalid coupen ID format'),
];
