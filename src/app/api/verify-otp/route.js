import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req) {
  try {
    const { mobileNumber, otp, hash } = await req.json();

    if (!mobileNumber || !otp || !hash) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const otpSecret = process.env.OTP_SECRET || 'atelier_secret_key_2026';

    // Recompute the hash with the provided OTP
    const computedHash = crypto.createHmac('sha256', otpSecret).update(mobileNumber + otp).digest('hex');

    if (computedHash === hash) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
