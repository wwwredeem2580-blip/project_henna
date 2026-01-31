import { Request, Response } from 'express';
import { handleError } from '../../../utils/handleError';
import CustomError from '../../../utils/CustomError';
import { PhoneVerification, User } from '../../../database/auth/auth';
import { validatePhoneNumber } from '../../../utils/auth/validatePhoneNumber';
import { sendSMS } from '../../../utils/auth/smsEngine';

const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_DAILY_OTP_REQUESTS = 10;
const PHONE_CHANGE_COOLDOWN_DAYS = 30;


export const sendOTPService = async (req: Request, res: Response) => {
  try {

    const userId = req.user?.sub;
    const phoneNumber = req.body.phoneNumber;

    const user = await User.findById(userId);
    if (!user || !userId || !phoneNumber) {
      throw new CustomError('User not found', 404);
    }

    const phoneVerification = await PhoneVerification.findOne({
      userId,
      verified: true,
    }).sort({ createdAt: -1 });

    if (phoneVerification && phoneVerification.phoneNumber === phoneNumber) {
      throw new CustomError('Phone number already verified', 400);
    }

    // Phone Number Change Policy: Prevent frequent changes
    if (phoneVerification && phoneVerification.phoneNumber !== phoneNumber) {

      if (phoneVerification.verifiedAt) {
        const daysSinceVerification = Math.floor(
          (Date.now() - phoneVerification.verifiedAt.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceVerification < PHONE_CHANGE_COOLDOWN_DAYS) {
          const daysRemaining = PHONE_CHANGE_COOLDOWN_DAYS - daysSinceVerification;
          throw new CustomError(
            `Phone number can only be changed once every ${PHONE_CHANGE_COOLDOWN_DAYS} days. Please wait ${daysRemaining} more days or contact support for assistance.`,
            429
          );
        }
      }

      // Mark old phone as unverified when changing
      user.phoneVerified = false;
      await user.save();
    }

    // Check if phone number is already verified by another user
    const existingUser = await PhoneVerification.findOne({
      phoneNumber,
      verified: true,
      userId: { $ne: userId } // Exclude current user
    });

    if (existingUser) {
      throw new CustomError(
        'This phone number is already verified by another account. Please use a different number or contact support if you believe this is an error.',
        400
      );
    }

    // Validate phone number format
    if (!validatePhoneNumber(phoneNumber)) {
      throw new CustomError(
        'Invalid phone number format. Please use Bangladesh format: +880 1X XXXX XXXX',
        400
      );
    }

    // Check daily limit
    await checkDailyLimit(userId);

    // Check for existing pending verification
    const existing = await PhoneVerification.findOne({
      userId,
      phoneNumber,
      verified: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    if (existing) {
      // Check rate limiting
      if (!existing.canResend(RESEND_COOLDOWN_SECONDS)) {
        const waitTime = Math.ceil((RESEND_COOLDOWN_SECONDS * 1000 - (Date.now() - existing.lastSentAt.getTime())) / 1000);
        throw new CustomError(
          `Please wait ${waitTime} seconds before requesting another OTP`,
          429
        );
      }
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Save to database
    await PhoneVerification.create({
      userId,
      phoneNumber,
      otp,
      expiresAt,
      maxAttempts: MAX_ATTEMPTS
    });

    // Send SMS
    const message = `(Zenvy) আপনার জেনভি যাচাইকরণ কোডটি হল: ${otp}`;
    await sendSMS(phoneNumber, message);

    res.json({
      success: true,
      message: `OTP sent successfully to ${phoneNumber}`
    });

  } catch (error) {
    return handleError(error, res);
  }
};

export const verifyOTPService = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.sub;

    if(!userId){
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { otp } = req.body;

    if (!otp || typeof otp !== 'string') {
      return res.status(400).json({ message: 'OTP code is required' });
    }

    // Verify OTP
    // Find the most recent pending verification for this user with matching OTP
    const verification = await PhoneVerification.findOne({
      userId,
      otp,
      verified: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    if (!verification) {
      // Increment attempts for any pending verification
      await PhoneVerification.updateOne(
        { userId, verified: false, expiresAt: { $gt: new Date() } },
        { 
          $inc: { attempts: 1 },
          $set: { lastAttemptAt: new Date() }
        }
      );
      throw new CustomError('Invalid OTP code', 400);
    }

    // Check if expired
    if (verification.isExpired()) {
      throw new CustomError('OTP has expired. Please request a new one', 400);
    }

    // Check max attempts
    if (verification.isMaxAttemptsReached()) {
      throw new CustomError('Maximum verification attempts exceeded. Please request a new OTP', 400);
    }

    // Mark as verified
    verification.verified = true;
    verification.verifiedAt = new Date();
    await verification.save();

    res.json({
      success: true,
      message: 'Phone number verified successfully',
      phoneNumber: verification.phoneNumber
    });

  } catch (error) {
    return handleError(error, res);
  }
};

export const resendOTPService = async (req: Request, res: Response) => {
  try {

    const userId = req.user?.sub;
    const phoneNumber = req.body.phoneNumber;

    if(!userId || !phoneNumber){
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Resend OTP
    await PhoneVerification.updateMany(
      { userId, phoneNumber, verified: false },
      { expiresAt: new Date() } // Expire immediately
    );

    return sendOTPService(req, res);

  } catch (error) {
    return handleError(error, res);
  }
};

const checkDailyLimit = async (userId: string): Promise<void> => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const todayCount = await PhoneVerification.countDocuments({
    userId,
    createdAt: { $gte: startOfDay }
  });

  if (todayCount >= MAX_DAILY_OTP_REQUESTS) {
    throw new CustomError(
      `Daily OTP limit exceeded. Please try again tomorrow or contact support.`,
      429
    );
  }
}

