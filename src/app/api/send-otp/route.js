import { NextResponse } from 'next/server';
import crypto from 'node:crypto';

export async function POST(req) {
  try {
    const { mobileNumber } = await req.json();

    if (!mobileNumber) {
      return NextResponse.json({ error: 'Mobile number is required' }, { status: 400 });
    }

    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const otpSecret = process.env.OTP_SECRET || 'atelier_secret_key_2026';

    if (!phoneNumberId || !accessToken) {
      console.error('WhatsApp API credentials are not configured in environment variables.');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Generate a hash of the OTP to return to the client
    const hash = crypto.createHmac('sha256', otpSecret).update(mobileNumber + otp).digest('hex');

    // Make request to WhatsApp Cloud API
    const response = await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: mobileNumber.replace(/[^0-9]/g, ''), // Ensure it's just numbers
        type: 'template',
        template: {
          name: 'otp_verification', // Make sure this template exists and is approved!
          language: {
            code: 'en_US'
          },
          components: [
            {
              type: 'body',
              parameters: [
                {
                  type: 'text',
                  text: otp
                }
              ]
            },
            {
              type: 'button',
              sub_type: 'url',
              index: '0',
              parameters: [
                {
                  type: 'text',
                  text: otp
                }
              ]
            }
          ]
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('WhatsApp API Error:', data);
      
      // Fallback for development if template fails: just send a standard text message
      // Note: This only works if the user has messaged the test number within 24 hours.
      const fallbackResponse = await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: mobileNumber.replace(/[^0-9]/g, ''),
          type: 'text',
          text: {
            preview_url: false,
            body: `Your Atelier verification code is: ${otp}`
          }
        })
      });

      const fallbackData = await fallbackResponse.json();
      if (!fallbackResponse.ok) {
        console.error('WhatsApp Fallback Error:', fallbackData);
        return NextResponse.json({ error: 'Failed to send WhatsApp message. Ensure template exists or test number has been messaged.' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, hash });
  } catch (error) {
    console.error('Send OTP Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
