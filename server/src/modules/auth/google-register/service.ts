import { User } from '../../../database/auth/auth';
import CustomError from '../../../utils/CustomError';
import { generateAccessToken, generateRefreshToken } from '../../../utils/auth/token';
import { GoogleClient } from '../../../utils/auth/google';
import axios from 'axios';
import { handleError } from '../../../utils/handleError';
import { Request, Response } from 'express';
import { ACCESS_TOKEN_CONFIG, REFRESH_TOKEN_CONFIG } from '../../../utils/cookieConfig';

// Temporary storage for OAuth state (in production, use Redis)
const oauthStateStore = new Map<string, any>();

/**
 * Initiate Google OAuth registration with business data
 * POST /auth/google/register/initiate
 */
export const initiateGoogleRegisterService = async (req: Request, res: Response) => {
  try {
    const { role, ...businessData } = req.body;

    // Validate role
    if (!role || !['host', 'user'].includes(role)) {
      throw new CustomError('Invalid role specified. Must be "host" or "user"', 400);
    }

    // For hosts, validate business data
    if (role === 'host') {
      const { businessName, businessEmail, phoneNumber, companyType } = businessData;
      if (!businessName || !businessEmail || !phoneNumber || !companyType) {
        throw new CustomError('Missing required business information for host registration', 400);
      }
    }

    // Generate state with role prefix: {role}_reg_{timestamp}_{random}
    const state = `${role}_reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store data with role (expires in 10 minutes)
    oauthStateStore.set(state, {
      role,
      ...businessData,
      expiresAt: Date.now() + 10 * 60 * 1000
    });

    // Generate OAuth URL with state
    // Use the same redirect URI as login to avoid mismatch
    const url = GoogleClient.generateAuthUrl({
      access_type: 'offline',
      scope: 'profile email',
      state: state,
      // Don't override redirect_uri - use the one from GoogleClient initialization
    });

    return res.status(200).json({ url, state });
  } catch (error) {
    handleError(error, res);
  }
};

/**
 * Handle Google OAuth registration callback
 * GET /auth/google/register/callback?code=...&state=...
 */
export const googleRegisterCallbackService = async (req: Request, res: Response) => {
  const { code, state } = req.query;

  if (!code || typeof code !== 'string') {
    throw new CustomError("Google OAuth failed - no code provided", 400);
  }

  if (!state || typeof state !== 'string') {
    throw new CustomError("Invalid OAuth state", 400);
  }

  try {
    // Retrieve stored data from state
    const storedData = oauthStateStore.get(state);
    
    if (!storedData) {
      throw new CustomError("OAuth session expired. Please try again.", 400);
    }

    // Check if expired
    if (Date.now() > storedData.expiresAt) {
      oauthStateStore.delete(state);
      throw new CustomError("OAuth session expired. Please try again.", 400);
    }

    // Extract role and business data
    const { role, expiresAt, ...businessData } = storedData;

    // Exchange code for tokens
    const { tokens } = await GoogleClient.getToken(code);
    if (!tokens?.access_token) {
      throw new CustomError("Google token exchange failed", 500);
    }

    // Get user info from Google
    const response: any = await axios.get(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${tokens.access_token}`
    );
    const googleUser = response?.data;

    if (!googleUser.email) {
      throw new CustomError("Failed to get email from Google", 500);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email: googleUser.email },
        { googleId: googleUser.sub }
      ]
    });

    if (existingUser) {
      // Clean up state
      oauthStateStore.delete(state);
      throw new CustomError('User already exists with this email or Google account', 409);
    }

    // Create user with role-specific fields
    const userData: any = {
      // Personal Information from Google
      firstName: googleUser.given_name,
      lastName: googleUser.family_name,
      email: googleUser.email,
      photo: googleUser.picture,
      googleId: googleUser.sub,
      
      // Role and provider
      role: role, // 'host' or 'user'
      provider: 'google',
      emailVerified: googleUser.email_verified || false,
    };

    // Add host-specific fields if role is 'host'
    if (role === 'host') {
      userData.businessName = businessData.businessName;
      userData.businessEmail = businessData.businessEmail;
      userData.phoneNumber = businessData.phoneNumber;
      userData.website = businessData.website || undefined;
      userData.companyType = businessData.companyType;
      userData.plan = 'free';
      userData.onboardingCompleted = false;
    }

    const user = await User.create(userData);

    // Generate tokens
    const tokenPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      emailVerified: user.emailVerified,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Send verification email (even though Google email is verified, we want our own verification)
    try {
      const { sendVerificationEmail } = await import('../email/service');
      await sendVerificationEmail(user._id.toString(), user.email);
      console.log(`📧 Verification email queued for: ${user.email}`);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail registration if email fails
    }

    // Set cookies
    res.cookie('accessToken', accessToken, ACCESS_TOKEN_CONFIG);
    res.cookie('refreshToken', refreshToken, REFRESH_TOKEN_CONFIG);

    // Clean up state
    oauthStateStore.delete(state);

    // Role-based redirect
    const dashboardUrl = user.role === 'host' ? '/dashboard' : '/events';
    return res.redirect(`${process.env.CLIENT_URL}${dashboardUrl}?registered=true`);
  } catch (error) {
    handleError(error, res);
  }
};

// Cleanup expired states every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of oauthStateStore.entries()) {
    if (now > value.expiresAt) {
      oauthStateStore.delete(key);
    }
  }
}, 5 * 60 * 1000);
