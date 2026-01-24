import { Worker } from 'bullmq';
import nodemailer from 'nodemailer';
import {
    emailVerification,
  } from '../utils/email/emailVerification';

const redisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
};

// Create a test account if no real credentials provided
let transporter: nodemailer.Transporter;

const initTransporter = async () => {
    if (process.env.SMTP_HOST) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    } else {
        // Use Ethereal for testing
        const testAccount = await nodemailer.createTestAccount();
        console.log('📧 Email Worker: Using Ethereal Test Account');
        console.log(`📧 User: ${testAccount.user}`);
        console.log(`📧 Pass: ${testAccount.pass}`);
        
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });
    }
};

export const initEmailWorker = () => {
  initTransporter();

  const worker = new Worker('email-queue', async (job) => {
    console.log(`Processing email job ${job.id} of type ${job.name}`);
    const type = job.name;
    const payload = job.data;

    try {
        let html = '';
        let subject = '';
        let to = '';
        let attachments: any[] = [];

        switch (type) {
            case 'EMAIL_VERIFICATION':
                to = payload.email;
                subject = `Verify Your Email - Zenvy`;
                html = emailVerification(payload.userName, payload.verificationUrl);
                break;
            default:
                console.warn(`Unknown email job type: ${type}`);
                return;
        }

        if (!to) {
            throw new Error('No recipient email provided');
        }

        const mailOptions: any = {
            from: '"Project Pinecone" <no-reply@pinecone.events>',
            to,
            subject,
            html,
        };

        if (attachments.length > 0) {
            mailOptions.attachments = attachments;
        }

        const info = await transporter.sendMail(mailOptions);

        console.log(`📧 Email sent: ${info.messageId}`);
        // Preview only available when using Ethereal code
        if (!process.env.SMTP_HOST) {
            console.log(`📧 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        }

    } catch (error) {
        console.error(`Failed to process email job ${job.id}:`, error);
        throw error;
    }
  }, {
    connection: redisOptions
  });

  worker.on('completed', job => {
    console.log(`Job ${job.id} has completed!`);
  });

  worker.on('failed', (job, err) => {
    console.log(`Job ${job?.id} has failed with ${err.message}`);
  });
  
  console.log('📧 Email Worker started');
};
