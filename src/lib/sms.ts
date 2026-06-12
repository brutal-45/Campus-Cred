/**
 * SMS Service — Production-grade SMS delivery via MSG91 (India-focused)
 *
 * Supports:
 * - MSG91 (primary, India-optimized DLT compliance)
 * - Twilio (international fallback)
 * - Console log (development mode)
 *
 * Environment Variables:
 * - SMS_PROVIDER: "msg91" | "twilio" | "console" (default: "console")
 * - MSG91_AUTH_KEY: MSG91 authentication key
 * - MSG91_TEMPLATE_ID: MSG91 DLT template ID
 * - MSG91_SENDER_ID: MSG91 DLT sender ID (6-char)
 * - TWILIO_ACCOUNT_SID: Twilio Account SID
 * - TWILIO_AUTH_TOKEN: Twilio Auth Token
 * - TWILIO_PHONE_NUMBER: Twilio phone number (+1...)
 */

import { hashPassword } from './auth';

interface SmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: string;
}

/**
 * Send OTP via SMS to an Indian phone number
 */
export async function sendOtpSms(
  phone: string,
  otp: string,
  purpose: string = 'verification'
): Promise<SmsResult> {
  const provider = process.env.SMS_PROVIDER || 'console';

  // Format phone for international dialing
  const internationalPhone = phone.startsWith('+') ? phone : `+91${phone}`;

  switch (provider) {
    case 'msg91':
      return sendViaMsg91(internationalPhone, otp, purpose);
    case 'twilio':
      return sendViaTwilio(internationalPhone, otp, purpose);
    case 'console':
    default:
      return sendViaConsole(internationalPhone, otp, purpose);
  }
}

/**
 * MSG91 — India's most popular SMS gateway
 * Supports DLT templates, transactional & OTP routes
 */
async function sendViaMsg91(
  phone: string,
  otp: string,
  purpose: string
): Promise<SmsResult> {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;
  const senderId = process.env.MSG91_SENDER_ID || 'CMPRED';

  if (!authKey) {
    console.error('[SMS] MSG91_AUTH_KEY not configured, falling back to console');
    return sendViaConsole(phone, otp, purpose);
  }

  try {
    // MSG91 Send OTP API (v5)
    const response = await fetch('https://api.msg91.com/api/v5/otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authkey': authKey,
      },
      body: JSON.stringify({
        template_id: templateId,
        sender: senderId,
        mobile: phone.replace('+', ''),
        var1: otp,
        var2: purpose === 'registration' ? 'account creation' : 'verification',
        OTP: otp,
      }),
    });

    const data = await response.json();

    if (data.type === 'success' || data.message === 'success') {
      console.log(`[SMS-MSG91] OTP sent to ${maskPhone(phone)}, msgId: ${data.message_id || 'N/A'}`);
      return {
        success: true,
        messageId: data.message_id,
        provider: 'msg91',
      };
    }

    // Fallback to MSG91 Flow API for DLT-compliant templates
    if (templateId) {
      return sendViaMsg91Flow(phone, otp, purpose);
    }

    console.error('[SMS] MSG91 error:', data);
    return {
      success: false,
      error: data.message || 'MSG91 delivery failed',
      provider: 'msg91',
    };
  } catch (error: any) {
    console.error('[SMS] MSG91 exception:', error.message);
    return {
      success: false,
      error: error.message,
      provider: 'msg91',
    };
  }
}

/**
 * MSG91 Flow API — for DLT-compliant template-based SMS
 */
async function sendViaMsg91Flow(
  phone: string,
  otp: string,
  purpose: string
): Promise<SmsResult> {
  const authKey = process.env.MSG91_AUTH_KEY!;
  const templateId = process.env.MSG91_TEMPLATE_ID!;

  try {
    const response = await fetch(`https://api.msg91.com/api/v5/flow/${templateId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authkey': authKey,
      },
      body: JSON.stringify({
        recipients: [{ mobile: phone.replace('+', '') }],
        var1: otp,
        var2: '5 minutes',
      }),
    });

    const data = await response.json();

    if (data.type === 'success') {
      return {
        success: true,
        messageId: data.message_id,
        provider: 'msg91-flow',
      };
    }

    return {
      success: false,
      error: data.message || 'Flow delivery failed',
      provider: 'msg91-flow',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      provider: 'msg91-flow',
    };
  }
}

/**
 * Twilio — International SMS gateway (fallback)
 */
async function sendViaTwilio(
  phone: string,
  otp: string,
  purpose: string
): Promise<SmsResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.error('[SMS] Twilio credentials not configured, falling back to console');
    return sendViaConsole(phone, otp, purpose);
  }

  try {
    const body = `Your CampusCred verification code is ${otp}. Valid for 5 minutes. Do not share this code with anyone. -CampusCred`;

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization:
            'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        },
        body: new URLSearchParams({
          From: fromNumber,
          To: phone,
          Body: body,
        }),
      }
    );

    const data = await response.json();

    if (response.ok && data.sid) {
      console.log(`[SMS-Twilio] OTP sent to ${maskPhone(phone)}, sid: ${data.sid}`);
      return {
        success: true,
        messageId: data.sid,
        provider: 'twilio',
      };
    }

    console.error('[SMS] Twilio error:', data);
    return {
      success: false,
      error: data.message || 'Twilio delivery failed',
      provider: 'twilio',
    };
  } catch (error: any) {
    console.error('[SMS] Twilio exception:', error.message);
    return {
      success: false,
      error: error.message,
      provider: 'twilio',
    };
  }
}

/**
 * Console — Development mode, logs OTP to console
 */
async function sendViaConsole(
  phone: string,
  otp: string,
  purpose: string
): Promise<SmsResult> {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`📱 [SMS-DEV] OTP for ${maskPhone(phone)}`);
  console.log(`   Code: ${otp}`);
  console.log(`   Purpose: ${purpose}`);
  console.log(`   Valid: 5 minutes`);
  console.log(`${'='.repeat(50)}\n`);

  return {
    success: true,
    messageId: `dev-${Date.now()}`,
    provider: 'console',
  };
}

/**
 * Mask phone number for logging: +919876543210 → +91 98*** ***10
 */
function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const local = digits.replace(/^91/, '');
  if (local.length !== 10) return phone;
  return `+91 ${local.slice(0, 2)}*** ***${local.slice(8)}`;
}

/**
 * Validate Indian phone number (10 digits, starts with 6-9)
 */
export function isValidIndianPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '').replace(/^91/, '');
  return digits.length === 10 && /^[6-9]\d{9}$/.test(digits);
}

/**
 * Clean phone number to 10 digits
 */
export function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, '').replace(/^91/, '').slice(0, 10);
}
