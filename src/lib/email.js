// We are using Brevo's REST API for sending emails.

// Define sender emails with fallbacks for local development
const FROM_AUTH = process.env.EMAIL_AUTH_FROM || 'auth@azhagii.me';
const FROM_ORDERS = process.env.EMAIL_ORDERS_FROM || 'orders@azhagii.me';
const FROM_HELLO = process.env.EMAIL_HELLO_FROM || 'hello@azhagii.me';

/**
 * Base utility to send an email using Brevo's API with error handling and logging.
 * @param {Object} options Email options
 * @returns {Promise<Object>} The response from Brevo
 */
async function sendEmail({ from, to, subject, html, text }) {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.warn('Warning: BREVO_API_KEY environment variable is missing.');
    return { success: false, error: 'BREVO_API_KEY is missing' };
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: { email: from, name: 'Azhagii' },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html,
        textContent: text,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`[Email Service] Failed to send email to ${to}:`, errorData);
      throw new Error(errorData.message || 'Failed to send email via Brevo');
    }

    const data = await response.json();
    console.log(`[Email Service] Successfully sent email to ${to} (Message ID: ${data.messageId})`);
    return { success: true, data };
  } catch (err) {
    console.error(`[Email Service] Exception sending email to ${to}:`, err);
    return { success: false, error: err.message };
  }
}

/**
 * Sends an OTP email for authentication or security verification.
 * @param {string} userEmail Recipient's email address
 * @param {string} otpCode The One-Time Password
 */
export async function sendOtpEmail(userEmail, otpCode) {
  const subject = `${otpCode} is your Azhagii security code`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2>Your Security Code</h2>
      <p>Please use the verification code below to sign in to your Azhagii account.</p>
      <div style="background-color: #f4f4f5; padding: 16px; border-radius: 8px; text-align: center; margin: 24px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px;">${otpCode}</span>
      </div>
      <p>If you didn't request this code, you can safely ignore this email.</p>
      <br />
      <p style="color: #666; font-size: 14px;">- The Azhagii Team</p>
    </div>
  `;

  return sendEmail({
    from: FROM_AUTH,
    to: userEmail,
    subject,
    html,
    text: `Your Azhagii security code is: ${otpCode}`,
  });
}

/**
 * Sends an order confirmation email.
 * @param {string} userEmail Recipient's email address
 * @param {Object} orderDetails Details of the order
 */
export async function sendOrderConfirmation(userEmail, orderDetails) {
  const { orderId, total, items = [] } = orderDetails;
  const subject = `Order Confirmation - #${orderId} - Azhagii`;
  
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${item.quantity} x $${item.price}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2>Thank you for your order!</h2>
      <p>We've received your order <strong>#${orderId}</strong> and are getting it ready for shipment.</p>
      
      <h3>Order Summary</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        ${itemsHtml}
        <tr>
          <td style="padding: 8px; font-weight: bold; text-align: right;">Total:</td>
          <td style="padding: 8px; font-weight: bold; text-align: right;">$${total}</td>
        </tr>
      </table>

      <p>We'll send you another email when your order ships.</p>
      <br />
      <p style="color: #666; font-size: 14px;">- The Azhagii Team</p>
    </div>
  `;

  return sendEmail({
    from: FROM_ORDERS,
    to: userEmail,
    subject,
    html,
    text: `Thank you for your order #${orderId}. Your total is $${total}.`,
  });
}

/**
 * Sends a welcome email to a new user.
 * @param {string} userEmail Recipient's email address
 * @param {string} userName Name of the user
 */
export async function sendWelcomeEmail(userEmail, userName) {
  const subject = `Welcome to Azhagii, ${userName}!`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2>Welcome, ${userName}!</h2>
      <p>We're thrilled to have you join Azhagii.</p>
      <p>Explore our latest collections and find exactly what you're looking for. If you have any questions, our support team is just an email away.</p>
      
      <div style="margin: 32px 0;">
        <a href="https://azhagii.me" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Start Shopping</a>
      </div>

      <p>Welcome to the family!</p>
      <br />
      <p style="color: #666; font-size: 14px;">- The Azhagii Team</p>
    </div>
  `;

  return sendEmail({
    from: FROM_HELLO,
    to: userEmail,
    subject,
    html,
    text: `Welcome to Azhagii, ${userName}! We're thrilled to have you.`,
  });
}
