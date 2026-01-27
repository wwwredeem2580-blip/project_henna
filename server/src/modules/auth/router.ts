import { Router } from 'express';
import { registerService, registerHostService, registerUserService } from './register/service';
import { loginService } from './login/service';
import { getGoogleLoginUrlService, redirectGoogleLoginService } from './google/service';
import { initiateGoogleRegisterService, googleRegisterCallbackService } from './google-register/service';
import { logoutService } from './logout/service';
import { requireAuth } from '../../middlewares/auth';
import { refreshService } from './refresh/service';
import { verifyEmailService, sendVerificationEmailService, resendVerificationEmailService } from './email/service';
import { verifyService } from './verify/service';
import { sendOTPService, verifyOTPService, resendOTPService } from './phone-otp/service';

const router = Router();

// Registration routes (role-based)
router.post('/register/host', registerHostService);
router.post('/register/user', registerUserService);
router.post('/register', registerService); // Backward compatibility - defaults to host

router.post('/login', loginService);

// Google OAuth Login
router.get('/google/login', getGoogleLoginUrlService);
router.get('/google/callback', redirectGoogleLoginService);

// Google OAuth Registration (with business data and role)
router.post('/google/register/initiate', initiateGoogleRegisterService);
router.get('/google/register/callback', googleRegisterCallbackService);

router.post('/logout', requireAuth, logoutService);
router.post('/refresh', refreshService);

// Email Verification
router.post('/email/verify', verifyEmailService);
router.post('/email/send-verification', requireAuth, sendVerificationEmailService);
router.post('/email/resend-verification', requireAuth, resendVerificationEmailService);

// Login State Verify
router.post('/verify', requireAuth, verifyService);

// Phone Verification
router.post('/phone/verify', requireAuth, verifyOTPService);
router.post('/phone/send', requireAuth, sendOTPService);
router.post('/phone/resend', requireAuth, resendOTPService);

export default router;