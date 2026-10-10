import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    this.initTransporter();
  }

  private initTransporter() {
    const host = this.configService.get<string>('mail.host') || process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(this.configService.get<number>('mail.port') || process.env.SMTP_PORT || 587);
    const secure = (this.configService.get<boolean>('mail.secure') ?? (process.env.SMTP_SECURE === 'true'));
    const user = this.configService.get<string>('mail.user') || process.env.NODEMAIL_USER || process.env.SMTP_USER || '';
    const rawPass = this.configService.get<string>('mail.pass') || process.env.NODEMAIL_PASS || process.env.SMTP_PASS || '';
    const pass = rawPass.replace(/\s+/g, '');

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
      });
      this.logger.log(`SMTP transporter configured for ${host}:${port} (${user})`);
    } else {
      this.logger.warn('SMTP credentials not configured. Outgoing emails will be logged to console.');
    }
  }

  async sendPasswordResetOtp(to: string, otp: string, userName?: string): Promise<boolean> {
    const user = this.configService.get<string>('mail.user') || process.env.NODEMAIL_USER || process.env.SMTP_USER || '';
    const from = this.configService.get<string>('mail.from') || process.env.SMTP_FROM || (user ? `CityDeals <${user}>` : 'CityDeals <no-reply@citydeals.com>');
    const name = userName ? userName.trim() : 'Valued User';

    const subject = `${otp} is your CityDeals password reset code`;

    const text = `Hello ${name},\n\n`
      + `We received a request to reset your password for your CityDeals account.\n\n`
      + `Your 6-digit verification code is: ${otp}\n\n`
      + `This code will expire in 10 minutes.\n`
      + `If you did not request a password reset, please ignore this email or contact support.\n\n`
      + `Best regards,\nThe CityDeals Team`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid #f1f5f9;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #f97316; letter-spacing: -0.5px;">CityDeals</h1>
              <p style="margin: 4px 0 0; font-size: 14px; color: #64748b;">Account Security & Recovery</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #0f172a;">Reset Your Password</h2>
              <p style="margin: 0 0 20px; font-size: 15px; line-height: 24px; color: #475569;">
                Hello <strong>${name}</strong>,<br>
                We received a request to reset your password. Use the verification code below to complete your password reset:
              </p>
              
              <!-- OTP Box -->
              <div style="background-color: #fff7ed; border: 2px dashed #fdba74; border-radius: 8px; padding: 20px; text-align: center; margin: 28px 0;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #ea580c; display: inline-block;">
                  ${otp}
                </span>
                <p style="margin: 8px 0 0; font-size: 12px; color: #9a3412; font-weight: 500;">
                  Valid for 10 minutes only
                </p>
              </div>

              <p style="margin: 0 0 16px; font-size: 14px; line-height: 22px; color: #64748b;">
                Enter this 6-digit code in the admin dashboard to set your new password.
              </p>

              <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #f1f5f9;">
                <p style="margin: 0; font-size: 13px; line-height: 20px; color: #94a3b8;">
                  <strong>Didn't request this?</strong> If you didn't ask to reset your password, you can safely ignore this email. Your account remains secure.
                </p>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                &copy; ${new Date().getFullYear()} CityDeals. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    if (!this.transporter) {
      this.logger.log(`[MOCK EMAIL] To: ${to} | Subject: "${subject}" | OTP: ${otp}`);
      return true;
    }

    try {
      const info = await this.transporter.sendMail({
        from,
        to,
        subject,
        text,
        html,
      });
      this.logger.log(`Password reset email sent to ${to} (MessageId: ${info.messageId})`);
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to send email to ${to}: ${error?.message || error}`);
      return false;
    }
  }

  async sendStaffWelcomeEmail(to: string, name: string, defaultPassword: string): Promise<boolean> {
    const user = this.configService.get<string>('mail.user') || process.env.NODEMAIL_USER || process.env.SMTP_USER || '';
    const from = this.configService.get<string>('mail.from') || process.env.SMTP_FROM || (user ? `CityDeals <${user}>` : 'CityDeals <no-reply@citydeals.com>');
    const subject = `Welcome to CityDeals, ${name}!`;

    const text = `Hello ${name},\n\n`
      + `An admin has created a staff account for you on CityDeals.\n\n`
      + `Here are your login details:\n`
      + `Email: ${to}\n`
      + `Password: ${defaultPassword}\n\n`
      + `Please login and change your password as soon as possible.\n\n`
      + `Best regards,\nThe CityDeals Team`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; }
    .box { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    h2 { color: #1a1a1a; margin-top: 0; }
    .creds { background: #f0f0f0; padding: 15px; border-radius: 6px; font-family: monospace; font-size: 16px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="box">
      <h2>Welcome to CityDeals!</h2>
      <p>Hello ${name},</p>
      <p>An admin has created a staff account for you. Below are your temporary login details:</p>
      <div class="creds">
        <strong>Email:</strong> ${to}<br/>
        <strong>Password:</strong> ${defaultPassword}
      </div>
      <p>Please log in to your account and change your password as soon as possible to ensure your account remains secure.</p>
      <p style="margin-top: 30px; font-size: 0.9em; color: #666;">
        Best regards,<br/>The CityDeals Team
      </p>
    </div>
  </div>
</body>
</html>
    `;

    if (!this.transporter) {
      this.logger.log(`[MOCK EMAIL] To: ${to} | Subject: "${subject}" | Default Password: ${defaultPassword}`);
      return true;
    }

    try {
      const info = await this.transporter.sendMail({
        from,
        to,
        subject,
        text,
        html,
      });
      this.logger.log(`Staff welcome email sent to ${to} (MessageId: ${info.messageId})`);
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to send email to ${to}: ${error?.message || error}`);
      return false;
    }
  }
}
