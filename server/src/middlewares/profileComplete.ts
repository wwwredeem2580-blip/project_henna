import { Request, Response, NextFunction } from 'express';
import { PhoneVerification, PaymentDetails, User } from '../database/auth/auth';
import CustomError from '../utils/CustomError';

/**
 * Middleware to ensure host profile is complete before allowing certain actions
 * Checks:
 * 1. Phone number is verified
 * 2. Payment details are configured
 */
export const requireProfileComplete = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      throw new CustomError('Unauthorized', 401);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    // Check phone verification
    const phoneVerification = await PhoneVerification.findOne({
      userId,
      phoneNumber: user.phoneNumber,
      verified: true
    });

    if (!phoneVerification) {
      throw new CustomError(
        'Phone verification required. Please verify your phone number in your profile before creating events.',
        403
      );
    }

    // Check payment details
    const paymentDetails = await PaymentDetails.findOne({ userId });
    if (!paymentDetails) {
      throw new CustomError(
        'Payment details required. Please configure your payout method in your profile before creating events.',
        403
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
