import { z } from 'zod';
import zxcvbn from 'zxcvbn';

const MIN_FIRST_NAME_LENGTH = 2;
const MAX_FIRST_NAME_LENGTH = 50;
const MIN_LAST_NAME_LENGTH = 2;
const MAX_LAST_NAME_LENGTH = 50;
const MIN_BUSINESS_NAME_LENGTH = 2;
const MAX_BUSINESS_NAME_LENGTH = 100;

const strongPasswordSchema = z.string({message: 'Password is required'})
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .refine((password) => {
    const score = zxcvbn(password).score;
    return score >= 3;
  }, 'Password is too weak');

const confirmPasswordSchema = z.string({message: 'Confirm password is required'}).min(1, 'Confirm password is required');

// Phone number validation (E.164 format)
const phoneNumberSchema = z.string({message: 'Phone number is required'})
  .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number (e.g., +1234567890)');

export const loginSchema = z.object({
    email: z.string().email({message: 'Please enter a valid email address'}),
    password: z.string({message: 'Password is required'}).min(1, 'Password is required'),
});

// Step 1: Business Information
export const businessInfoSchema = z.object({
  businessName: z.string({message: 'Business name is required'})
    .trim()
    .min(MIN_BUSINESS_NAME_LENGTH, `Business name must be at least ${MIN_BUSINESS_NAME_LENGTH} characters long`)
    .max(MAX_BUSINESS_NAME_LENGTH, `Business name must be at most ${MAX_BUSINESS_NAME_LENGTH} characters long`),
  businessEmail: z.string().email({message: 'Please enter a valid business email address'}),
  phoneNumber: phoneNumberSchema,
});

// Step 2: Company Details
export const companyDetailsSchema = z.object({
  companyType: z.string({message: 'Please select or type your company type'}).min(1, 'Company type is required'),
  website: z.string().url({message: 'Please enter a valid website URL'}).optional().or(z.literal('')),
});

// Step 3: Personal Information
export const personalInfoSchema = z.object({
  firstName: z.string({message: 'First name is required'})
    .trim()
    .min(MIN_FIRST_NAME_LENGTH, `First name must be at least ${MIN_FIRST_NAME_LENGTH} characters long`)
    .max(MAX_FIRST_NAME_LENGTH, `First name must be at most ${MAX_FIRST_NAME_LENGTH} characters long`),
  lastName: z.string({message: 'Last name is required'})
    .trim()
    .min(MIN_LAST_NAME_LENGTH, `Last name must be at least ${MIN_LAST_NAME_LENGTH} characters long`)
    .max(MAX_LAST_NAME_LENGTH, `Last name must be at most ${MAX_LAST_NAME_LENGTH} characters long`),
  email: z.string().email({message: 'Please enter a valid email address'}),
  password: strongPasswordSchema,
  confirmPassword: confirmPasswordSchema,
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Full host registration schema (all steps combined)
export const hostRegisterSchema = businessInfoSchema
  .merge(companyDetailsSchema)
  .merge(personalInfoSchema);

// User registration schema (simple - just personal info)
export const userRegisterSchema = z.object({
  firstName: z.string({message: 'First name is required'})
    .trim()
    .min(MIN_FIRST_NAME_LENGTH, `First name must be at least ${MIN_FIRST_NAME_LENGTH} characters long`)
    .max(MAX_FIRST_NAME_LENGTH, `First name must be at most ${MAX_FIRST_NAME_LENGTH} characters long`),
  lastName: z.string({message: 'Last name is required'})
    .trim()
    .min(MIN_LAST_NAME_LENGTH, `Last name must be at least ${MIN_LAST_NAME_LENGTH} characters long`)
    .max(MAX_LAST_NAME_LENGTH, `Last name must be at most ${MAX_LAST_NAME_LENGTH} characters long`),
  email: z.string().email({message: 'Please enter a valid email address'}),
  password: strongPasswordSchema,
  confirmPassword: confirmPasswordSchema,
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Backward compatibility
export const registerSchema = hostRegisterSchema;