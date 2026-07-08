import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { to, subject, html } = await request.json();

    if (!process.env.BREVO_API_KEY) {
      console.warn("BREVO_API_KEY not found. Email simulation mode.");
      return NextResponse.json({ success: true, simulated: true });
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: 'Azhagii', email: 'madhu9940984501@gmail.com' },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to send email via Brevo');
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Email Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
