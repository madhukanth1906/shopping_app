import { NextResponse } from 'next/server';
import crypto from 'node:crypto';

export async function POST(request) {
  try {
    const { email, otp, hashWithExpires } = await request.json();
    
    if (!email || !otp || !hashWithExpires) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const [hash, expires] = hashWithExpires.split('.');
    
    if (Date.now() > parseInt(expires)) {
      return NextResponse.json({ error: "OTP expired" }, { status: 400 });
    }

    const data = `${email}.${otp}.${expires}`;
    const calculatedHash = crypto.createHmac('sha256', process.env.OTP_SECRET || 'fallback_secret')
                                 .update(data)
                                 .digest('hex');
    
    if (calculatedHash === hash) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }
  } catch (error) {
    console.error("OTP Verify Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
