/**
 * Email Service — Production-grade email delivery for OTP and notifications
 *
 * Supports:
 * - Nodemailer (SMTP — Gmail, SendGrid, AWS SES, etc.)
 * - Console log (development mode)
 *
 * Environment Variables:
 * - EMAIL_PROVIDER: "smtp" | "console" (default: "console")
 * - SMTP_HOST: SMTP server hostname (e.g., smtp.gmail.com)
 * - SMTP_PORT: SMTP port (default: 587)
 * - SMTP_SECURE: Use SSL (default: false for STARTTLS)
 * - SMTP_USER: SMTP username
 * - SMTP_PASS: SMTP password or app-specific password
 * - EMAIL_FROM: Sender email (default: noreply@campuscred.in)
 * - EMAIL_FROM_NAME: Sender name (default: CampusCred)
 */

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: string;
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Send OTP via email
 */
export async function sendOtpEmail(
  email: string,
  otp: string,
  purpose: string = 'verification'
): Promise<EmailResult> {
  const expiryMinutes = 10;
  const purposeLabel = {
    'registration': 'Account Creation',
    'verification': 'Email Verification',
    'login': 'Login Verification',
    'forgot-password': 'Password Reset',
    '2fa': 'Two-Factor Authentication',
  }[purpose] || 'Verification';

  const html = generateOtpEmailHtml(otp, purposeLabel, expiryMinutes);
  const text = `Your CampusCred ${purposeLabel} code is ${otp}. It expires in ${expiryMinutes} minutes. Do not share this code with anyone.`;

  return sendEmail({
    to: email,
    subject: `CampusCred — ${purposeLabel} Code: ${otp.slice(0, 2)}****`,
    html,
    text,
  });
}

/**
 * Send a generic email
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const provider = process.env.EMAIL_PROVIDER || 'console';

  switch (provider) {
    case 'smtp':
      return sendViaSmtp(options);
    case 'console':
    default:
      return sendViaConsole(options);
  }
}

/**
 * SMTP — Nodemailer transport (works with Gmail, SendGrid, AWS SES, etc.)
 */
async function sendViaSmtp(options: EmailOptions): Promise<EmailResult> {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const secure = process.env.SMTP_SECURE === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.error('[EMAIL] SMTP credentials not configured, falling back to console');
    return sendViaConsole(options);
  }

  try {
    // Dynamic import to avoid bundling nodemailer in client
    const nodemailer = await import('nodemailer');

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });

    const fromEmail = process.env.EMAIL_FROM || 'noreply@campuscred.in';
    const fromName = process.env.EMAIL_FROM_NAME || 'CampusCred';

    const result = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    console.log(`[EMAIL-SMTP] Sent to ${maskEmail(options.to)}, id: ${result.messageId}`);
    return {
      success: true,
      messageId: result.messageId,
      provider: 'smtp',
    };
  } catch (error: any) {
    console.error('[EMAIL] SMTP exception:', error.message);
    return {
      success: false,
      error: error.message,
      provider: 'smtp',
    };
  }
}

/**
 * Console — Development mode, logs email to console
 */
async function sendViaConsole(options: EmailOptions): Promise<EmailResult> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📧 [EMAIL-DEV] To: ${maskEmail(options.to)}`);
  console.log(`   Subject: ${options.subject}`);
  console.log(`   Body: ${options.text}`);
  console.log(`${'='.repeat(60)}\n`);

  return {
    success: true,
    messageId: `dev-${Date.now()}`,
    provider: 'console',
  };
}

/**
 * Generate professional OTP email HTML
 */
function generateOtpEmailHtml(
  otp: string,
  purpose: string,
  expiryMinutes: number
): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CampusCred Verification Code</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f0f2f5; }
    .container { max-width: 480px; margin: 0 auto; padding: 20px; }
    .card { background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #0A0F2C 0%, #1a1f4e 100%); padding: 32px 24px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: 0.5px; }
    .header p { color: rgba(255,255,255,0.7); font-size: 13px; margin-top: 4px; }
    .body { padding: 32px 24px; text-align: center; }
    .purpose-badge { display: inline-block; background: #EEF2FF; color: #3B82F6; font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 20px; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px; }
    .otp-title { font-size: 15px; color: #4B5563; margin-bottom: 20px; }
    .otp-box { display: inline-flex; gap: 8px; margin-bottom: 20px; }
    .otp-digit { width: 44px; height: 52px; background: #F8FAFC; border: 2px solid #E2E8F0; border-radius: 12px; font-size: 22px; font-weight: 700; color: #0A0F2C; line-height: 52px; text-align: center; }
    .expiry { font-size: 13px; color: #9CA3AF; margin-bottom: 24px; }
    .expiry strong { color: #EF4444; }
    .divider { height: 1px; background: #F1F5F9; margin: 0 24px; }
    .footer { padding: 20px 24px; text-align: center; }
    .footer p { font-size: 12px; color: #9CA3AF; line-height: 1.6; }
    .footer a { color: #3B82F6; text-decoration: none; }
    .brand { color: #D4AF37; font-weight: 700; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <h1>CampusCred</h1>
        <p>Earn Real Work. Gain Real Cred.</p>
      </div>
      <div class="body">
        <div class="purpose-badge">${purpose}</div>
        <p class="otp-title">Your verification code is:</p>
        <div class="otp-box">
          ${otp.split('').map((digit: string) => `<div class="otp-digit">${digit}</div>`).join('')}
        </div>
        <p class="expiry">This code expires in <strong>${expiryMinutes} minutes</strong></p>
      </div>
      <div class="divider"></div>
      <div class="footer">
        <p>
          If you didn't request this code, you can safely ignore this email.<br/>
          Never share this code with anyone. <span class="brand">CampusCred</span> will never ask for it.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Mask email for logging: john.doe@gmail.com → j*******@gmail.com
 */
function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  const firstChar = local[0];
  const maskedPart = '*'.repeat(Math.max(local.length - 1, 3));
  return `${firstChar}${maskedPart}@${domain}`;
}
