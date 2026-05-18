import nodemailer from 'nodemailer';

// Create a transporter using your cPanel SMTP credentials
// In Vercel, you'll need to set these environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports (like 587)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export default async function handler(req, res) {
  // Set CORS headers for security and to allow the frontend to call this endpoint
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { to, subject, html } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'Missing required fields: to, subject, or html' });
    }

    // Verify SMTP connection configuration (optional but helpful for debugging)
    // await transporter.verify();

    const info = await transporter.sendMail({
      from: `"Aha Konaseema" <${process.env.SMTP_USER}>`, // Sender address
      to: to, // List of receivers
      subject: subject, // Subject line
      html: html, // HTML body content
    });

    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('SMTP error:', error);
    return res.status(500).json({ error: error.message || 'Failed to send email via SMTP' });
  }
}
