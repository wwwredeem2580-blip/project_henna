import { z } from 'zod';
import zxcvbn from 'zxcvbn';

const MIN_FIRST_NAME_LENGTH = 2;
const MAX_FIRST_NAME_LENGTH = 50;
const MIN_LAST_NAME_LENGTH = 2;
const MAX_LAST_NAME_LENGTH = 50;

const strongPasswordSchema = z.string({error: () => ({message: 'Password is required'})})
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .refine((password) => {
    const score = zxcvbn(password).score;
    return score >= 3;
  }, 'Password is too weak');

const confirmPasswordSchema = z.string({error: () => ({message: 'Confirm password is required'})}).min(1, 'Confirm password is required')

export const loginSchema = z.object({
    email: z.email({error: () => ({message: 'Please enter a valid email address'})}),
    password: z.string({error: () => ({message: 'Password is required'})}).min(1, 'Password is required'),
});

export const registerSchema = z.object({
  firstName: z.string({error: () => ({message: 'First name is required'})})
    .trim()
    .min(MIN_FIRST_NAME_LENGTH, `First name must be at least ${MIN_FIRST_NAME_LENGTH} characters long`)
    .max(MAX_FIRST_NAME_LENGTH, `First name must be at most ${MAX_FIRST_NAME_LENGTH} characters long`),
  lastName: z.string({error: () => ({message: 'Last name is required'})})
    .trim()
    .min(MIN_LAST_NAME_LENGTH, `Last name must be at least ${MIN_LAST_NAME_LENGTH} characters long`)
    .max(MAX_LAST_NAME_LENGTH, `Last name must be at most ${MAX_LAST_NAME_LENGTH} characters long`),
  email: z.email({error: () => ({message: 'Please enter a valid email address'})}),
  password: strongPasswordSchema,
  confirmPassword: confirmPasswordSchema,
});