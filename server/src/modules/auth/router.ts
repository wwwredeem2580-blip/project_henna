import { Router } from 'express';
import { registerHostService, registerUserService } from './register/service';
import { loginService } from './login/service';
import { getGoogleLoginUrlService, redirectGoogleLoginService } from './google/service';
import { initiateGoogleRegisterService, googleRegisterCallbackService } from './google-register/service';
import { logoutService } from './logout/service';
import { requireAuth } from '../../middlewares/auth';
import { refreshService } from './refresh/service';
import { verifyEmailService, sendVerificationEmailService, resendVerificationEmailService } from './email-verification/service';
import { verifyService } from './verify/service';

const router = Router();

router.post('/register/host', registerHostService);
router.post('/register/user', registerUserService);
router.post('/login', loginService);

// Google OAuth Login
router.get('/google/login', getGoogleLoginUrlService);
router.get('/google/redirect', redirectGoogleLoginService);

// Google OAuth Registration (with business data)
router.post('/google/register/initiate', initiateGoogleRegisterService);
router.get('/google/register/callback', googleRegisterCallbackService);

router.post('/logout', requireAuth, logoutService);
router.post('/refresh', refreshService);
router.post('/verify-email', requireAuth, verifyEmailService);
router.post('/send-verification-email', requireAuth, sendVerificationEmailService);
router.post('/resend-verification-email', requireAuth, resendVerificationEmailService);
router.post('/verify', requireAuth, verifyService);

export default router;