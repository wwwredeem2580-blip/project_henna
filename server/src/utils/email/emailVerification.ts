export const emailVerification = (userName: string, verificationUrl: string) => {

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - Project Pinecone</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8fafc;
            }
            .container {
                background: white;
                padding: 40px;
                border-radius: 16px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 32px;
            }
            .logo {
                font-size: 24px;
                font-weight: bold;
                color: #2563eb;
                margin-bottom: 8px;
            }
            .title {
                font-size: 28px;
                font-weight: bold;
                color: #1f2937;
                margin: 16px 0;
            }
            .subtitle {
                color: #6b7280;
                font-size: 16px;
            }
            .content {
                margin: 32px 0;
            }
            .button {
                display: inline-block;
                background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                color: white;
                text-decoration: none;
                padding: 16px 32px;
                border-radius: 8px;
                font-weight: 600;
                font-size: 16px;
                margin: 24px 0;
                box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.39);
                transition: all 0.2s ease;
            }
            .button:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
            }
            .footer {
                margin-top: 40px;
                padding-top: 24px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
                text-align: center;
            }
            .warning {
                background: #fef3c7;
                border: 1px solid #f59e0b;
                border-radius: 8px;
                padding: 16px;
                margin: 24px 0;
            }
            .code {
                background: #f3f4f6;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                padding: 16px;
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                font-size: 18px;
                font-weight: bold;
                text-align: center;
                color: #374151;
                margin: 16px 0;
                letter-spacing: 2px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">Zenvy</div>
                <h1 class="title">Verify Your Email</h1>
                <p class="subtitle">Hi ${userName}, please verify your email address to continue</p>
            </div>

            <div class="content">
                <p>Thank you for using Zenvy! To ensure the security of your account and enable all features, we need to verify your email address.</p>

                <p><strong>What happens after verification?</strong></p>
                <ul>
                    <li>Your account security is enhanced</li>
                    <li>You receive important notifications</li>
                    <li>Access to all platform features</li>
                </ul>

                <div style="text-align: center;">
                    <a href="${verificationUrl}" class="button">Verify My Email</a>
                </div>

                <div class="warning">
                    <strong>⚠️ Important:</strong> This verification link will expire in 24 hours. If you didn't request this verification, please ignore this email.
                </div>

                <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                <div class="code">${verificationUrl}</div>

                <p>If you have any questions, feel free to contact our support team.</p>
            </div>

            <div class="footer">
                <p>
                    This email was sent to you because you requested email verification for your Zenvy account.<br>
                    © 2024 Zenvy. All rights reserved.
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
};
