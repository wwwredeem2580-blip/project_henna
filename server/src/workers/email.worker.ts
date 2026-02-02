import { Worker } from 'bullmq';
import nodemailer from 'nodemailer';
import {
  emailVerificationTemplate,
} from '../utils/email/emailVerification';
import { orderConfirmationTemplate } from '../utils/email/orderConfirmation';
const SibApiV3Sdk = require('sib-api-v3-sdk');

// Redis
const redisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
};

// Brevo Setup
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
  // 1️⃣ Try Brevo first
  try {
    await brevoTransactional.sendTransacEmail({
      subject,
      htmlContent: html,
      sender: {
        name: 'Zenvy',
        email: 'no-reply@zenvy.com.bd',
      },
      to: [{ email: to }],
    });

    console.log(`📧 Email sent via Brevo → ${to}`);
    return;
  } catch (brevoError) {
    console.error('❌ Brevo failed, falling back to SMTP', brevoError);
  }

  // 2️⃣ SMTP fallback
  const info = await transporter.sendMail({
    from: '"Zenvy" <no-reply@zenvy.com.bd>',
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

        default:
          throw new Error(`Unknown email job type: ${job.name}`);
      }

      if (!to) {
        throw new Error('Recipient email missing');
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
