import { hostRegisterSchema, userRegisterSchema } from '../../../schema/auth.schema';
import { User } from '../../../database/auth/auth';
import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken } from '../../../utils/auth/token';
import { Request, Response } from 'express';
import { handleError } from '../../../utils/handleError';
import CustomError from '../../../utils/CustomError';
import { ACCESS_TOKEN_CONFIG, REFRESH_TOKEN_CONFIG } from '../../../utils/cookieConfig';

/**
 * Register a new host (event organizer)
 * POST /auth/register/host
 */
export const registerHostService = async (req: Request, res: Response) => {
  try {
    if(!req.body || Object.keys(req.body).length === 0){
      throw new CustomError('Please provide all the required fields', 400);
    }
    
    const data = hostRegisterSchema.parse(req.body);

    if(data.password !== data.confirmPassword){
      throw new CustomError('Passwords do not match', 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: data.email.toLowerCase() });
    if(existingUser){
      throw new CustomError('User already exists', 409);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const user = await User.create({
      // Personal Information
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hashedPassword,
      
      // Business Information (host-specific)
      businessName: data.businessName,
      businessEmail: data.businessEmail,
      phoneNumber: data.phoneNumber,
      website: data.website || undefined,
      
      // Company Details
      companyType: data.companyType,
      
      // Account Setup
      role: 'host',
      provider: 'local',
      plan: 'free',
      onboardingCompleted: false,
    });

    const accessToken = generateAccessToken({ 
      sub: user._id.toString(), 
      email: user.email, 
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      emailVerified: user.emailVerified,
    });
    const refreshToken = generateRefreshToken({ 
      sub: user._id.toString(), 
      email: user.email, 
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      emailVerified: user.emailVerified,
    });
    
    user.refreshToken = refreshToken;
    await user.save();
    
    // Send verification email
    try {
      const { sendVerificationEmail } = await import('../email/service');
      await sendVerificationEmail(user._id.toString(), user.email);
      console.log(`📧 Verification email queued for: ${user.email}`);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }
    
    res.cookie('accessToken', accessToken, ACCESS_TOKEN_CONFIG);
    res.cookie('refreshToken', refreshToken, REFRESH_TOKEN_CONFIG);
    return res.status(201).json({ 
      message: 'Host registration successful. Please check your email to verify your account.' 
    });
  } catch (error) {
    handleError(error, res);
  }
};

/**
 * Register a new user (event attendee)
 * POST /auth/register/user
 */
export const registerUserService = async (req: Request, res: Response) => {
  try {
    if(!req.body || Object.keys(req.body).length === 0){
      throw new CustomError('Please provide all the required fields', 400);
    }
    
    const data = userRegisterSchema.parse(req.body);

    if(data.password !== data.confirmPassword){
      throw new CustomError('Passwords do not match', 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: data.email.toLowerCase() });
    if(existingUser){
      throw new CustomError('User already exists', 409);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const user = await User.create({
      // Personal Information
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hashedPassword,
      
      // Account Setup
      role: 'user',
      provider: 'local',
    });

    const accessToken = generateAccessToken({ 
      sub: user._id.toString(), 
      email: user.email, 
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      emailVerified: user.emailVerified,
    });
    const refreshToken = generateRefreshToken({ 
      sub: user._id.toString(), 
      email: user.email, 
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      emailVerified: user.emailVerified,
    });
    
    user.refreshToken = refreshToken;
    await user.save();
    
    // Send verification email
    try {
      const { sendVerificationEmail } = await import('../email/service');
      await sendVerificationEmail(user._id.toString(), user.email);
      console.log(`📧 Verification email queued for: ${user.email}`);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }
    
    res.cookie('accessToken', accessToken, ACCESS_TOKEN_CONFIG);
    res.cookie('refreshToken', refreshToken, REFRESH_TOKEN_CONFIG);
    return res.status(201).json({ 
      message: 'User registration successful. Please check your email to verify your account.' 
    });
  } catch (error) {
    handleError(error, res);
  }
};

// Backward compatibility - defaults to host registration
export const registerService = registerHostService;
