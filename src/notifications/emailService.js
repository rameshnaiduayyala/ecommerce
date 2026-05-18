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
  
  buildAmazonStyleEmail: (details, isAdmin = false) => {
    const itemsTable = details.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 10px;">
          ${item.image_url ? `<img src="${item.image_url}" width="40" height="40" style="border-radius: 4px; object-fit: cover;" />` : ''}
          <span style="font-weight: bold; color: #111;">${item.name}</span>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${item.discount_price || item.price}</td>
      </tr>
    `).join('');

    const invoiceLink = details.origin ? `${details.origin}/print/invoice/${details.orderId}` : '#';
    const slipLink = details.origin ? `${details.origin}/print/packing-slip/${details.orderId}` : '#';

    return `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 680px; margin: 0 auto; color: #333; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <!-- Header -->
        <div style="background-color: #f1f5f9; padding: 20px; border-bottom: 1px solid #ddd;">
          <h1 style="color: #d97706; margin: 0; font-size: 24px; text-transform: uppercase; font-weight: 900;">Aha Konaseema</h1>
          <p style="margin: 5px 0 0 0; color: #555; font-size: 14px;">
            ${isAdmin ? '🚨 New Customer Order Received!' : 'Thank you for shopping with us!'}
          </p>
        </div>

        <div style="padding: 25px;">
          <h2 style="font-size: 18px; margin-top: 0; color: #111;">
            ${isAdmin ? `Order Details for ${details.customerName}` : `Hello ${details.customerName},`}
          </h2>
          <p style="font-size: 14px; line-height: 1.5; color: #444;">
            ${isAdmin ? 'A new order has been placed on the store. Please fulfill it as soon as possible.' : 'Your order has been successfully placed and is now being processed. Below are the details of your purchase.'}
          </p>

          <!-- Order Summary Cards -->
          <table style="width: 100%; margin: 25px 0; font-size: 14px; border-collapse: collapse;">
            <tr>
              <td style="width: 50%; vertical-align: top; padding-right: 15px;">
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #eee; height: 100%;">
                  <h3 style="margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; color: #888;">Delivery Address</h3>
                  <p style="margin: 0; font-weight: bold;">${details.customerName}</p>
                  <p style="margin: 5px 0 0 0; line-height: 1.4;">${details.shippingAddress}</p>
                  ${details.phone ? `<p style="margin: 5px 0 0 0;">📞 ${details.phone}</p>` : ''}
                </div>
              </td>
              <td style="width: 50%; vertical-align: top; padding-left: 15px;">
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #eee; height: 100%;">
                  <h3 style="margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; color: #888;">Order Info</h3>
                  <p style="margin: 0 0 5px 0;"><strong>Order ID:</strong> #${details.orderId.split('-')[0].toUpperCase()}</p>
                  <p style="margin: 0 0 5px 0;"><strong>Order Date:</strong> ${new Date(details.date).toLocaleDateString()}</p>
                  <p style="margin: 0 0 5px 0;"><strong>Payment:</strong> ${details.paymentMethod}</p>
                </div>
              </td>
            </tr>
          </table>

          <!-- Items Table -->
          <h3 style="margin-top: 30px; border-bottom: 2px solid #f0f0f0; padding-bottom: 8px; font-size: 16px; color: #111;">Order Summary</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
            <thead>
              <tr style="background-color: #f9f9f9;">
                <th style="padding: 10px 12px; text-align: left; border-bottom: 2px solid #ddd; color: #555;">Item</th>
                <th style="padding: 10px 12px; text-align: center; border-bottom: 2px solid #ddd; color: #555;">Qty</th>
                <th style="padding: 10px 12px; text-align: right; border-bottom: 2px solid #ddd; color: #555;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsTable}
              
              <!-- Cost Breakdown -->
              <tr>
                <td colspan="2" style="padding: 12px; text-align: right; color: #666;">Subtotal:</td>
                <td style="padding: 12px; text-align: right; color: #111;">₹${details.subtotal}</td>
              </tr>
              ${details.discount > 0 ? `
              <tr>
                <td colspan="2" style="padding: 12px; text-align: right; color: #666;">Discount:</td>
                <td style="padding: 12px; text-align: right; color: #16a34a;">-₹${details.discount}</td>
              </tr>` : ''}
              <tr>
                <td colspan="2" style="padding: 12px; text-align: right; color: #666;">Shipping:</td>
                <td style="padding: 12px; text-align: right; color: #111;">${details.shipping === 0 ? 'FREE' : `₹${details.shipping}`}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 15px 12px; text-align: right; font-weight: 900; font-size: 16px; border-top: 2px solid #ddd;">Grand Total:</td>
                <td style="padding: 15px 12px; text-align: right; font-weight: 900; color: #d97706; font-size: 18px; border-top: 2px solid #ddd;">₹${details.grandTotal}</td>
              </tr>
            </tbody>
          </table>

          <!-- Actions -->
          <div style="margin-top: 35px; text-align: center;">
            <a href="${invoiceLink}" style="background-color: #d97706; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 14px;">
              🧾 View & Print Full Invoice
            </a>
            ${isAdmin ? `
            <br/><br/>
            <a href="${slipLink}" style="color: #d97706; text-decoration: underline; font-size: 12px; font-weight: bold;">
              📦 Admin: Print Packing Slip
            </a>` : ''}
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #ddd; font-size: 12px; color: #888;">
          <p style="margin: 0;">This email was sent automatically. Please do not reply directly.</p>
          <p style="margin: 5px 0 0 0;">&copy; ${new Date().getFullYear()} Aha Konaseema. All rights reserved.</p>
        </div>
      </div>
    `;
  },

  sendOrderConfirmation: async (to, details) => {
    return sendEmail({
      to,
      subject: `Order Confirmation #${details.orderId.split('-')[0].toUpperCase()} - Aha Konaseema`,
      html: EmailTemplates.buildAmazonStyleEmail(details, false)
    });
  },

  sendAdminNewOrderAlert: async (adminEmail, details) => {
    return sendEmail({
      to: adminEmail,
      subject: `🚨 New Order #${details.orderId.split('-')[0].toUpperCase()} - ₹${details.grandTotal} - Aha Konaseema`,
      html: EmailTemplates.buildAmazonStyleEmail(details, true)
    });
  },

  sendOrderStatusUpdate: async (to, details, status, adminNote = '') => {
    const baseHtml = EmailTemplates.buildAmazonStyleEmail(details, false);
    
    // Inject the status banner right below the header
    const statusBanner = `
      <div style="background-color: ${status === 'delivered' ? '#dcfce7' : status === 'cancelled' ? '#fee2e2' : '#fef9c3'}; padding: 15px 25px; border-bottom: 1px solid #ddd;">
        <h3 style="margin: 0; color: ${status === 'delivered' ? '#166534' : status === 'cancelled' ? '#991b1b' : '#854d0e'};">Update: Your order is now ${status.toUpperCase()}</h3>
        ${adminNote ? `<p style="margin: 5px 0 0 0; font-size: 14px; color: #333;"><strong>Note from Team:</strong> ${adminNote}</p>` : ''}
      </div>
    `;

    const html = baseHtml.replace('<!-- Header -->', '<!-- Header -->' + statusBanner);

    return sendEmail({
      to,
      subject: `Order Update: #${details.orderId.split('-')[0].toUpperCase()} is now ${status.toUpperCase()} - Aha Konaseema`,
      html
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
