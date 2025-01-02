import { body, ValidationChain } from 'express-validator';
// user register fields validations 
export const registerValidation: ValidationChain[] = [
    body('userName')
        .trim()
        .notEmpty()
        .withMessage('First name is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email format')
        .normalizeEmail(),
    body('password')
        .trim()
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long'),
    body('contactNumber')
        .optional()
        .matches(/^[0-9]{10,20}$/)
        .withMessage('Phone number must be between 10 and 20 digits'),
    body('role')
        .trim()
        .notEmpty()
        .withMessage('Role is required')
        .isIn(['user', 'admin', 'superuser', ''])
        .withMessage('Invalid role'),

    body('notificationPreference')
        .optional()
        .isIn(['Email', 'SMS', 'Push Notifications'])
        .withMessage('Invalid notification preference'),
];
// Login validations 
export const loginValidation: ValidationChain[] = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email format')
        .normalizeEmail(),

    body('password')
        .trim()
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long'),
];

export const candidateInfoValidation: ValidationChain[] = [
    body('profileUrl').optional().isURL().withMessage('Invalid profile URL'),
    body('resumeUrl').optional().isURL().withMessage('Invalid resume URL'),
    body('skills').optional().isArray().withMessage('Skills must be an array'),
    body('experience_years').optional().isInt({ min: 0 }).withMessage('Experience years must be a positive number'),
    body('certifications').optional().isArray().withMessage('Certifications must be an array'),
    body('job_preferences').optional().isArray().withMessage('Job preferences must be an array'),
    body('job_role_preferences').optional().isString().withMessage('Job role preference must be a string'),
    body('languages_spoken').optional().isArray().withMessage('Languages must be an array'),
    body('video_portfolio_url').optional().isURL().withMessage('Invalid video portfolio URL'),
    body('expected_salary').optional().isFloat({ min: 0 }).withMessage('Expected salary must be a positive number'),
    body('profile_status').optional().isIn(['complete', 'incomplete']).withMessage('Invalid profile status'),
    body('awards_and_honors').optional().isArray().withMessage('Awards must be an array'),
    body('candidateInfo_visibility').optional().isIn(['public', 'private']).withMessage('Invalid visibility setting'),
    body('preferred_job_location').optional().isArray().withMessage('Preferred locations must be an array'),
    body('relocation_preference').optional().isBoolean().withMessage('Relocation preference must be boolean'),
    body('premium_service_active').optional().isBoolean().withMessage('Premium service status must be boolean'),

    // Education validation
    body('education').optional().isArray().withMessage('Education must be an array'),
    body('education.*.name').optional().isString().withMessage('Education name must be a string'),
    body('education.*.university').optional().isString().withMessage('University name must be a string'),
    body('education.*.institute').optional().isString().withMessage('Institute name must be a string'),
    body('education.*.startYear').optional().isString().matches(/^\d{4}$/).withMessage('Start year must be a valid year'),
    body('education.*.passingYear').optional().isString().matches(/^\d{4}$/).withMessage('Passing year must be a valid year'),
    body('education.*.status').optional().isIn(['pass', 'fail', 'ongoing']).withMessage('Invalid education status'),
    body('education.*.cgpa').optional().isString().withMessage('CGPA must be a string'),
    body('education.*.percentage').optional().isString().withMessage('Percentage must be a string'),

    // Experience validation
    body('experience').optional().isArray().withMessage('Experience must be an array'),
    body('experience.*.company').optional().isString().withMessage('Company name must be a string'),
    body('experience.*.position').optional().isString().withMessage('Position must be a string'),
    body('experience.*.startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
    body('experience.*.endDate').optional().isISO8601().withMessage('End date must be a valid date'),
    body('experience.*.jobDescription').optional().isString().withMessage('Job description must be a string'),
    body('experience.*.employmentType').optional().isIn(['fulltime', 'parttime', 'contract', 'internship']).withMessage('Invalid employment type'),
    body('experience.*.currentlyWorking').optional().isBoolean().withMessage('Currently working must be boolean'),
    body('experience.*.jobLocation').optional().isString().withMessage('Job location must be a string')
];
export const employerInfoValidation: ValidationChain[] = [
    body('company_name').notEmpty().withMessage('Company name is required'),
    body('phone_number').optional().isLength({ max: 20 }).withMessage('Phone number can have a maximum of 20 characters'),
    body('company_type').optional().isIn(['Pharma', 'Hospital', 'Clinic', 'Healthcare Services']),
    body('employer_visibility').optional().isIn(['Visible', 'Hidden']),
    body('subscription_status').optional().isIn(['Active', 'Expired', 'Pending']),
    // Add additional validations as needed
];
// Profile validations 
export const profileValidation = [
    body('profilePicture').optional().isString(),
    body('resume').optional().isString(),
];