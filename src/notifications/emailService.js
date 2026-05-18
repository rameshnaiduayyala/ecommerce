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
  
  sendOrderConfirmation: async (to, orderId, amount) => {
    return sendEmail({
      to,
      subject: `Order Confirmation #${orderId} - SweetVerse`,
      html: `<h2>Thank you for your order!</h2><p>Your order <strong>#${orderId}</strong> for <strong>$${amount}</strong> has been confirmed.</p>`
    });
  },

  sendShippingUpdate: async (to, orderId, trackingLink) => {
    return sendEmail({
      to,
      subject: `Your order #${orderId} has shipped! - SweetVerse`,
      html: `<h2>Great news!</h2><p>Your order has shipped. <a href="${trackingLink}">Track your package here</a>.</p>`
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
