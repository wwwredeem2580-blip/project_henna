/**
 * Suspicious Login Template
 * Sent when a login occurs from a new IP or device.
 */

interface SuspiciousLoginPayload {
  name: string;
  time: string;
  ip: string;
  device: string;
}

export function suspiciousLoginTemplate(payload: SuspiciousLoginPayload): string {
  const { name, time, ip, device } = payload;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Login Detected</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; -webkit-font-smoothing: antialiased;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          
          <!-- Header (Warning Color) -->
          <tr>
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 48px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                Zenvy
              </h1>
              <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 300;">
                Security Alert
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 48px 40px;">
              <p style="margin: 0 0 24px; color: #1e293b; font-size: 18px; font-weight: 500;">
                Hi ${name},
              </p>
              
              <p style="margin: 0 0 16px; color: #475569; font-size: 16px; line-height: 1.6; font-weight: 300;">
                We noticed a new login to your Zenvy account. If this was you, you can safely ignore this email.
              </p>

              <!-- Login Details Card -->
              <table role="presentation" style="width: 100%; background-color: #fffbeb; border-radius: 12px; margin-bottom: 32px; border: 1px solid #fcd34d;">
                <tr>
                  <td style="padding: 24px;">
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
                          <p style="margin: 0; color: #92400e; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Time</p>
                          <p style="margin: 4px 0 0; color: #1e293b; font-size: 15px; font-weight: 500;">${time}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                           <p style="margin: 0; color: #92400e; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Device/Browser</p>
                           <p style="margin: 4px 0 0; color: #1e293b; font-size: 15px; font-weight: 500;">${device}</p>
                        </td>
                      </tr>
                       <tr>
                        <td style="padding-top: 12px;">
                           <p style="margin: 0; color: #92400e; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">IP Address</p>
                           <p style="margin: 4px 0 0; color: #1e293b; font-size: 15px; font-weight: 500;">${ip}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 32px; color: #475569; font-size: 16px; line-height: 1.6; font-weight: 300;">
                If this wasn't you, please reset your password immediately to secure your account.
              </p>

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
