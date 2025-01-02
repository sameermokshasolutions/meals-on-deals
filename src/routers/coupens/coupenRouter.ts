import express from 'express';
import {
    createCoupon,
    getCoupons,
    updateCoupon,
    activateCoupon,
    deactivateCoupon,
    deleteCoupon
} from './coupenController/coupenController';
// import { validateCreateCoupon, validateUpdateCoupon, validateActivateDeactivateCoupon } from './validators/couponValidator';
import { authenticateToken } from '../../middlewares/authMiddleware';
import { validateRequest } from '../../middlewares/validateRequest';


const couponRouter = express.Router();

couponRouter.use(authenticateToken);

couponRouter.get('/', getCoupons);
couponRouter.post('/', validateRequest, createCoupon);
couponRouter.put('/:couponId', validateRequest, updateCoupon);
couponRouter.patch('/:couponId/activate', validateRequest, activateCoupon);
couponRouter.patch('/:couponId/deactivate', validateRequest, deactivateCoupon);
couponRouter.delete('/:couponId', deleteCoupon);

export default couponRouter;

