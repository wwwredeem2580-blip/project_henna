import { Request, Response } from 'express';
import { User, EmailVerification } from '../../../database/auth/auth'
import { handleError } from '../../../utils/handleError';
import CustomError from '../../../utils/CustomError';
import crypto from 'crypto';
import { addEmailJob } from '../../../workers/email.queue';

const TOKEN_EXPIRY_HOURS = 24;
const MAX_ATTEMPTS = 5;

export const sendVerificationEmailService = async (req: Request, res: Response) => {

  try {
    if(!req.user?.sub || !req.user?.email){
      throw new CustomError('User not found', 404);
    }
    return await sendVerificationEmail(req.user.sub, req.user.email);
  } catch (error: any) {
    handleError(error, res);
  }

};


export const verifyEmailService = async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    const verification = await EmailVerification.findOne({
      token,
      verified: false
    });

    if (!verification) {
      throw new CustomError('Invalid or expired verification token', 400);
    }

    // Check if expired
    if (verification.isExpired()) {
      throw new CustomError('Verification token has expired', 400);
    }

    // Check max attempts
    if (verification.attempts >= MAX_ATTEMPTS) {
      throw new CustomError('Maximum verification attempts exceeded. Please request a new verification email', 400);
    }

    // Get user to determine email type
    const user = await User.findById(verification.userId);
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    // Mark as verified
    verification.verified = true;
    verification.verifiedAt = new Date();
    await verification.save();

    // Update user verification status
    await User.findByIdAndUpdate(verification.userId, {
      emailVerified: true
    });

    return res.status(200).json({
      message: 'Email verified successfully'
    });

  } catch (error: any) {
    if (token) {
      await EmailVerification.updateOne(
        { token, verified: false },
        {
          $inc: { attempts: 1 },
          $set: { lastAttemptAt: new Date() }
        }
      );
    }
    handleError(error, res);
  }

};


export const resendVerificationEmailService = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.sub) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.sub;
    
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    if (user.emailVerified) {
      throw new CustomError('Email already verified', 400);
    }

    // Invalidate old tokens
    await EmailVerification.updateMany(
      { userId, verified: false },
      { expiresAt: new Date() } // Expire immediately
    );

    // Send new verification email
    return await sendVerificationEmail(userId, user.email);

  } catch (error: any) {
    handleError(error, res);
  }
}


export const sendVerificationEmail = async (userId: string, email: string, emailType: 'primary' | 'secondary' = 'primary'): Promise<{ success: boolean; message: string }> => {
    try {
      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      // Check if email is already verified based on type
      if (emailType === 'primary' && (user.primaryEmailVerified || user.emailVerified)) {
        throw new CustomError('Primary email already verified', 400);
      }
      if (emailType === 'secondary' && user.secondaryEmailVerified) {
        throw new CustomError('Secondary email already verified', 400);
      }

      // For primary email, check if user is host and primary email is required
      if (emailType === 'primary' && user.role === 'host' && !user.primaryEmailVerified) {
        // Allow sending verification for hosts
      }

      // Check for existing pending verification
      const existing = await EmailVerification.findOne({
        userId,
        verified: false,
        expiresAt: { $gt: new Date() }
      });

      if (existing) {
        // Check rate limiting (1 minute cooldown)
        const timeSinceLastSent = Date.now() - existing.createdAt.getTime();
        if (timeSinceLastSent < 60 * 1000) {
          throw new CustomError('Please wait before requesting another verification email', 429);
        }
      }

      // Generate token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

      // Save to database
      await EmailVerification.create({
        userId,
        email,
        token,
        expiresAt
      });

      // Send email via email worker
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

      const userName = `${user.firstName} ${user.lastName}`.trim() || 'Valued User';

      await addEmailJob('EMAIL_VERIFICATION', {
        userName,
        email,
        emailType,
        verificationUrl
      });

      console.log(`📧 Email verification queued for: ${email} (${emailType})`);

      return {
        success: true,
        message: 'Verification email sent successfully'
      };
    } catch (error: any) {
      if (error instanceof CustomError) throw error;
      console.error('Error sending verification email:', error);
      throw new CustomError('Failed to send verification email', 500);
    }
}