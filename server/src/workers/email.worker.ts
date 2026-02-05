import { Worker } from 'bullmq';
import nodemailer from 'nodemailer';
import {
  emailVerificationTemplate,
} from '../utils/email/emailVerification';
import { orderConfirmationTemplate } from '../utils/email/orderConfirmation';
import { getAdminNotificationTemplate } from '../utils/email/adminNotifications';
import { Resend } from 'resend';
const SibApiV3Sdk = require('sib-api-v3-sdk');

// Redis
const redisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
};

// Resend Setup (Primary)
const resend = new Resend(process.env.RESEND_API_KEY);

// Brevo Setup (Secondary)
const brevoClient = SibApiV3Sdk.ApiClient.instance;
brevoClient.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;
const brevoTransactional = new SibApiV3Sdk.TransactionalEmailsApi();

// SMTP (Fallback)
let transporter: nodemailer.Transporter;

const initTransporter = async () => {
  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    const testAccount = await nodemailer.createTestAccount();
    console.log('📧 Using Ethereal SMTP fallback');

    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
};

// Email Sender
const sendTransactionalEmail = async ({
  to,
  subject,
  html,
  attachments = [],
}: {
  to: string;
  subject: string;
  html: string;
  attachments?: any[];
}) => {
  // 1️⃣ Try Resend first with retry logic
  try {
    await resend.emails.send({
      from: 'Zenvy <support@zenvy.com.bd>',
      to: [to],
      subject,
      html,
      attachments,
    });

    console.log(`📧 Email sent via Resend → ${to}`);
    return;
  } catch (resendError: any) {
    const errorType = classifyError(resendError);
    
    if (errorType === 'HARD_FAIL') {
      console.error('❌ Resend hard fail, falling back to Brevo', resendError);
    } else {
      console.error('⚠️ Resend soft fail, retrying Resend', resendError);
      // Retry Resend once for soft fails
      try {
        await resend.emails.send({
          from: 'Zenvy <support@zenvy.com.bd>',
          to: [to],
          subject,
          html,
          attachments,
        });
        console.log(`📧 Email sent via Resend (retry) → ${to}`);
        return;
      } catch (retryError) {
        console.error('❌ Resend retry failed, falling back to Brevo', retryError);
      }
    }
  }

  // 2️⃣ Try Brevo second with retry logic
  try {
    await brevoTransactional.sendTransacEmail({
      subject,
      htmlContent: html,
      sender: {
        name: 'Zenvy',
        email: 'support@zenvy.com.bd',
      },
      to: [{ email: to }],
    });

    console.log(`📧 Email sent via Brevo → ${to}`);
    return;
  } catch (brevoError: any) {
    const errorType = classifyError(brevoError);
    
    if (errorType === 'HARD_FAIL') {
      console.error('❌ Brevo hard fail, falling back to SMTP', brevoError);
    } else {
      console.error('⚠️ Brevo soft fail, retrying Brevo', brevoError);
      // Retry Brevo once for soft fails
      try {
        await brevoTransactional.sendTransacEmail({
          subject,
          htmlContent: html,
          sender: {
            name: 'Zenvy',
            email: 'support@zenvy.com.bd',
          },
          to: [{ email: to }],
        });
        console.log(`📧 Email sent via Brevo (retry) → ${to}`);
        return;
      } catch (retryError) {
        console.error('❌ Brevo retry failed, falling back to SMTP', retryError);
      }
    }
  }

  // 3️⃣ SMTP fallback
  const info = await transporter.sendMail({
    from: '"Zenvy" <support@zenvy.com.bd>',
    to,
    subject,
    html,
    attachments,
  });

  console.log(`📧 Email sent via SMTP → ${info.messageId}`);

  if (!process.env.SMTP_HOST) {
    console.log(`📧 Preview: ${nodemailer.getTestMessageUrl(info)}`);
  }
};

// Error Classification Helper
const classifyError = (error: any): 'HARD_FAIL' | 'SOFT_FAIL' => {
  // Extract error code/status from different providers
  const statusCode = error.status || error.statusCode || error.code || error.response?.status;
  const message = error.message || error.response?.message || error.toString();
  
  // Hard Fail conditions - permanent errors that won't resolve with retry
  const hardFailConditions = [
    // Resend specific errors
    error.name === 'ValidationError', // 400 - Invalid recipient, missing fields
    error.name === 'UnauthorizedError', // 401 - Invalid API key
    error.name === 'ForbiddenError', // 403 - Account blocked, insufficient credits
    
    // HTTP status codes
    statusCode === 400, // Bad Request
    statusCode === 401, // Unauthorized
    statusCode === 403, // Forbidden
    statusCode === 422, // Unprocessable Entity
    statusCode === 450, // Mailbox unavailable (blocked)
    statusCode === 550, // Mailbox rejected (blocked)
    
    // Message-based detection
    message.includes('invalid recipient'),
    message.includes('invalid email'),
    message.includes('blocked'),
    message.includes('forbidden'),
    message.includes('unauthorized'),
    message.includes('insufficient'),
    message.includes('quota exceeded'),
    message.includes('account disabled'),
    message.includes('email address not found'),
    message.includes('mailbox unavailable'),
  ];

  // Soft Fail conditions - temporary errors that may resolve with retry
  const softFailConditions = [
    // HTTP status codes
    statusCode === 429, // Rate limit
    statusCode === 500, // Internal Server Error
    statusCode === 502, // Bad Gateway
    statusCode === 503, // Service Unavailable
    statusCode === 504, // Gateway Timeout
    
    // Timeout errors
    error.name === 'TimeoutError',
    message.includes('timeout'),
    message.includes('ETIMEDOUT'),
    message.includes('ENOTFOUND'),
    
    // Rate limiting
    message.includes('rate limit'),
    message.includes('too many requests'),
    message.includes('429'),
    
    // Temporary server issues
    message.includes('temporary'),
    message.includes('service unavailable'),
    message.includes('server error'),
  ];

  // If it matches hard fail conditions, it's a hard fail
  if (hardFailConditions.some(condition => condition)) {
    return 'HARD_FAIL';
  }
  
  // If it matches soft fail conditions, it's a soft fail
  if (softFailConditions.some(condition => condition)) {
    return 'SOFT_FAIL';
  }
  
  // Default to hard fail for unknown errors to be safe
  return 'HARD_FAIL';
};

// Worker
export const initEmailWorker = async () => {
  await initTransporter();

  const worker = new Worker(
    'email-queue',
    async (job) => {
      console.log(`Processing email job ${job.id} (${job.name})`);

      let to = '';
      let subject = '';
      let html = '';

      switch (job.name) {
        case 'EMAIL_VERIFICATION':
          to = job.data.email;
          subject = 'Verify Your Email - Zenvy';
          html = emailVerificationTemplate(job.data);
          break;

        case 'ORDER_CONFIRMATION':
          to = job.data.buyerEmail;
          subject = `Order Confirmed - ${job.data.eventTitle}`;
          html = orderConfirmationTemplate(job.data);
          break;
        
        case 'email-notification':
            const { type, payload } = job.data;
            
            // Determine recipient based on payload structure
            to = payload.email || 
                 payload.hostEmail || 
                 payload.host?.email || 
                 payload.user?.email || 
                 payload.buyerEmail;

            // Generate HTML using generic admin template
            html = getAdminNotificationTemplate(type, payload);
            
            // Extract title from generated HTML for subject (simple regex) or use default
            const titleMatch = html.match(/<title>(.*?)<\/title>/);
            subject = titleMatch ? `${titleMatch[1]} - Zenvy` : 'Notification - Zenvy';
            break;

        default:
          throw new Error(`Unknown email job type: ${job.name}`);
      }

      if (!to) {
        throw new Error(`Recipient email missing for job ${job.name}`);
      }

      await sendTransactionalEmail({ to, subject, html });
    },
    { connection: redisOptions }
  );

  worker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} failed`, err.message);
  });

  console.log('📧 Email Worker started');
};
