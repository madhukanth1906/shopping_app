import { NextResponse } from 'next/server';
import crypto from 'node:crypto';

export async function POST(request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash it with a secret and expiry time (5 minutes)
    const expires = Date.now() + 5 * 60 * 1000;
    const data = `${email}.${otp}.${expires}`;
    const hash = crypto.createHmac('sha256', process.env.OTP_SECRET || 'fallback_secret')
                       .update(data)
                       .digest('hex');
    
    const hashWithExpires = `${hash}.${expires}`;

    // Send email via Brevo
    if (!process.env.BREVO_API_KEY) {
      console.warn("BREVO_API_KEY not found. Simulated OTP sent: " + otp);
      return NextResponse.json({ success: true, hash: hashWithExpires });
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: 'Azhagii', email: 'hello@azhagii.me' },
        to: [{ email: email }],
        subject: 'Your Checkout OTP from Azhagii',
        htmlContent: `<h2>Checkout Verification Code</h2>
                      <p>Your OTP code is <strong>${otp}</strong>.</p>
                      <p>It expires in 5 minutes.</p>`
      })
    });

    const brevoData = await response.json();
    if (!response.ok) {
      throw new Error(brevoData.message || 'Failed to send email via Brevo');
    }

    return NextResponse.json({ success: true, hash: hashWithExpires });
  } catch (error) {
    console.error("OTP Send Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
