import { Resend } from 'resend';
import fs from 'fs';

// Read the API key directly from the .env file
const envFile = fs.readFileSync('.env', 'utf-8');
const match = envFile.match(/VITE_RESEND_API_KEY=(.*)/);
const apiKey = match ? match[1].trim() : null;

if (!apiKey) {
    console.error("No API key found in .env");
    process.exit(1);
}

const resend = new Resend(apiKey);

async function sendTestEmail() {
    console.log("Attempting to send email via Node.js (backend) environment...");
    try {
        const { data, error } = await resend.emails.send({
            // NOTE: 'onboarding@resend.dev' is a special testing email Resend gives you 
            // before you verify your own custom domain (e.g. support@sweetverse.com)
            from: 'SweetVerse Test <onboarding@resend.dev>', 
            to: ['techrammy@gmail.com'], // In testing, Resend only lets you send to your own registered email address
            subject: 'Success! Your Resend setup works! 🎉',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #8b5cf6;">It Works!</h2>
                    <p>Hello!</p>
                    <p>If you are reading this, it means your Resend API Key is perfectly valid and your setup is correct.</p>
                    <p>The reason it failed in your browser is that Resend blocks browsers from sending emails (CORS error) to protect your API key from hackers.</p>
                    <p>Once you are ready, you will move the email sending code to a secure backend like <strong>Supabase Edge Functions</strong>.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #888;">Sent from your SweetVerse Project 🚀</p>
                </div>
            `
        });

        if (error) {
            console.error("Resend API Error:", error);
        } else {
            console.log("✅ Success! Email sent successfully. Check your inbox (or spam folder) for techrammy@gmail.com!");
            console.log("Email Data:", data);
        }
    } catch (e) {
        console.error("Failed to send:", e);
    }
}

sendTestEmail();
