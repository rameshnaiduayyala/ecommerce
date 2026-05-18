/**
 * Sends an email using the secure Vercel Serverless Function Backend
 * 
 * @param {Object} options Email options
 * @param {string} options.to Recipient email
 * @param {string} options.subject Email subject
 * @param {React.ReactElement|string} options.html HTML content or React element
 * @returns {Promise<Object>} Response from API
 */
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, subject, html }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || errorData.error?.name || 'Failed to send email');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to send email via API:', error);
    throw error;
  }
};

/**
 * Common Ecommerce Email Templates (Functions)
 */
export const EmailTemplates = {
  sendOTP: async (to, otp) => {
    return sendEmail({
      to,
      subject: 'Your Login OTP - SweetVerse',
      html: `<h2>Your One Time Password is: <strong>${otp}</strong></h2><p>This code expires in 5 minutes.</p>`
    });
  },
  
  sendOrderConfirmation: async (to, orderId, amount, items = [], origin = '') => {
    const itemsTable = items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.discount_price || item.price}</td>
      </tr>
    `).join('');

    const invoiceLink = origin ? `${origin}/print/invoice/${orderId}` : '#';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #eaeaea; border-radius: 8px; padding: 20px;">
        <h2 style="color: #d97706; text-transform: uppercase;">Official Invoice & Receipt</h2>
        <p>Thank you for your order! Your order <strong>#${orderId.split('-')[0].toUpperCase()}</strong> has been successfully confirmed.</p>
        
        <h3 style="margin-top: 30px; border-bottom: 2px solid #f0f0f0; padding-bottom: 5px;">Order Summary</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
          <thead>
            <tr style="background-color: #f9f9f9;">
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
              <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsTable}
            <tr>
              <td colspan="2" style="padding: 15px 10px; text-align: right; font-weight: bold;">Grand Total:</td>
              <td style="padding: 15px 10px; text-align: right; font-weight: bold; color: #d97706; font-size: 16px;">₹${amount}</td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top: 30px; text-align: center;">
          <a href="${invoiceLink}" style="background-color: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Download / Print Full PDF Invoice</a>
        </div>
      </div>
    `;

    return sendEmail({
      to,
      subject: `Invoice & Order Confirmation #${orderId.split('-')[0].toUpperCase()} - SweetVerse`,
      html
    });
  },

  sendAdminNewOrderAlert: async (adminEmail, orderId, amount) => {
    return sendEmail({
      to: adminEmail,
      subject: `🚨 New Order Alert! #${orderId} - SweetVerse`,
      html: `<h2>New Order Received!</h2><p>A new order <strong>#${orderId}</strong> for <strong>₹${amount}</strong> has been placed.</p><p>Please check your Admin Dashboard for fulfillment details.</p>`
    });
  },

  sendOrderStatusUpdate: async (to, orderId, status, adminNote = '') => {
    return sendEmail({
      to,
      subject: `Your order #${orderId} is now ${status.toUpperCase()} - SweetVerse`,
      html: `
        <h2>Order Update</h2>
        <p>Your order <strong>#${orderId}</strong> status has been updated to: <strong>${status.toUpperCase()}</strong>.</p>
        ${adminNote ? `<p><strong>Note from our team:</strong> ${adminNote}</p>` : ''}
        <p>Thank you for shopping with SweetVerse!</p>
      `
    });
  },

  sendWelcomeEmail: async (to, name) => {
    return sendEmail({
      to,
      subject: 'Welcome to SweetVerse!',
      html: `<h2>Welcome, ${name}!</h2><p>We're thrilled to have you here. Explore our futuristic sweets collection now.</p>`
    });
  },
  
  sendPasswordReset: async (to, resetLink) => {
    return sendEmail({
      to,
      subject: 'Password Reset Request - SweetVerse',
      html: `<h2>Reset your password</h2><p>Click <a href="${resetLink}">here</a> to reset your password. If you didn't request this, you can ignore this email.</p>`
    });
  }
};
