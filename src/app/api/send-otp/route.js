import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import textlink from 'textlink-sms';

export async function POST(req) {
  try {
    const { mobileNumber } = await req.json();

    if (!mobileNumber) {
      return NextResponse.json({ error: 'Mobile number is required' }, { status: 400 });
    }

    const apiKey = process.env.TEXTLINK_API_KEY;
    const otpSecret = process.env.OTP_SECRET || 'atelier_secret_key_2026';

    if (!apiKey) {
      console.error('TextLink API key is not configured in environment variables.');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Generate a hash of the OTP to return to the client
    const hash = crypto.createHmac('sha256', otpSecret).update(mobileNumber + otp).digest('hex');

    // Format phone number to ensure it has '+' if missing
    const formattedNumber = mobileNumber.startsWith('+') ? mobileNumber : `+${mobileNumber.replace(/[^0-9]/g, '')}`;

    // Send SMS via TextLink
    textlink.useKey(apiKey);
    const result = await textlink.sendSMS(formattedNumber, `Your Atelier verification code is: ${otp}`);

    if (!result || result.ok === false) {
      console.error('TextLink API Error:', result);
      return NextResponse.json({ error: result?.message || 'Failed to send SMS message.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, hash });
  } catch (error) {
    console.error('Send OTP Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
