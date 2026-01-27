/**
 * Modern Minimal Email Verification Template
 * Clean, premium design matching the PDF aesthetic
 */

interface EmailVerificationPayload {
  email: string;
  verificationLink: string;
  name?: string;
}

export function emailVerificationTemplate(payload: EmailVerificationPayload): string {
  const { email, verificationLink, name } = payload;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; -webkit-font-smoothing: antialiased;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 48px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                Zenvy
              </h1>
              <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 300;">
                Event Management Platform
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 48px 40px;">
              ${name ? `
              <p style="margin: 0 0 24px; color: #1e293b; font-size: 18px; font-weight: 500;">
                Hi ${name},
              </p>
              ` : ''}
              
              <p style="margin: 0 0 16px; color: #475569; font-size: 16px; line-height: 1.6; font-weight: 300;">
                Welcome to Zenvy! We're excited to have you on board.
              </p>
              
              <p style="margin: 0 0 32px; color: #475569; font-size: 16px; line-height: 1.6; font-weight: 300;">
                To get started, please verify your email address by clicking the button below:
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 8px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);">
                    <a href="${verificationLink}" style="display: inline-block; padding: 16px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 500; border-radius: 8px;">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 32px 0 0; color: #94a3b8; font-size: 14px; line-height: 1.6; font-weight: 300;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 8px 0 0; color: #6366f1; font-size: 14px; word-break: break-all;">
                ${verificationLink}
              </p>

              <!-- Security Note -->
              <table role="presentation" style="margin: 32px 0 0; width: 100%; border-left: 4px solid #6366f1; background-color: #f1f5f9; border-radius: 8px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.6; font-weight: 400;">
                      <strong style="color: #1e293b;">🔒 Security Note:</strong> This link will expire in 24 hours. If you didn't create an account with Zenvy, please ignore this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px; color: #64748b; font-size: 14px; text-align: center; font-weight: 300;">
                Need help? Contact us at <a href="mailto:support@zenvy.com" style="color: #6366f1; text-decoration: none;">support@zenvy.com</a>
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px; text-align: center; font-weight: 300;">
                © ${new Date().getFullYear()} Zenvy Inc. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
