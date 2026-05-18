import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'

// Parse .env manually to hydrate local Node environment variables
const envPath = path.resolve(process.cwd(), '.env');
const envVars = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      // Remove enclosing quotes if present
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      envVars[key] = value.trim();
    }
  });
}

// Local mock/dev server API gateway for cPanel email testing
const localApiPlugin = () => ({
  name: 'local-api-middleware',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === '/api/send-email' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', async () => {
          try {
            const { to, subject, html } = JSON.parse(body);
            
            const host = envVars.SMTP_HOST || process.env.SMTP_HOST;
            const port = envVars.SMTP_PORT || process.env.SMTP_PORT || '465';
            const user = envVars.SMTP_USER || process.env.SMTP_USER;
            const pass = envVars.SMTP_PASS || process.env.SMTP_PASS;

            if (!host || !user || !pass) {
              throw new Error("Missing SMTP environment variables in local .env configuration");
            }

            const transporter = nodemailer.createTransport({
              host: host,
              port: parseInt(port),
              secure: port === '465',
              auth: { user, pass },
            });

            const info = await transporter.sendMail({
              from: `"Aha Konaseema" <${user}>`,
              to,
              subject,
              html,
            });

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, messageId: info.messageId }));
          } catch (error) {
            console.error('Local API Mailer Error:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error.message || 'Local send error' }));
          }
        });
      } else if (req.url === '/api/send-push' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', async () => {
          try {
            const { userId, title, message, url } = JSON.parse(body);

            const appId = envVars.ONESIGNAL_APP_ID || envVars.VITE_ONESIGNAL_APP_ID || process.env.ONESIGNAL_APP_ID || process.env.VITE_ONESIGNAL_APP_ID;
            const restKey = envVars.ONESIGNAL_REST_API_KEY || process.env.ONESIGNAL_REST_API_KEY;

            if (!appId) {
              throw new Error("Missing OneSignal App ID in environment configuration");
            }

            if (!restKey) {
              console.warn("Local API Push: ONESIGNAL_REST_API_KEY missing. Simulating successful push notification...");
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ 
                success: true, 
                simulated: true, 
                message: 'OneSignal REST API key not configured locally. Trigger simulated.' 
              }));
              return;
            }

            const payload = {
              app_id: appId,
              headings: { en: title },
              contents: { en: message },
              url: url || ''
            };

            if (userId === 'all') {
              payload.included_segments = ['Subscribed Users'];
            } else if (userId === 'admin') {
              payload.included_segments = ['Admins'];
            } else {
              payload.include_external_user_ids = [userId];
            }

            const isRichKey = restKey.startsWith('os_v2_app_');
            const authHeader = isRichKey ? `Key ${restKey}` : `Basic ${restKey}`;

            console.log("Local API Push Debug Info:");
            console.log("- appId:", appId);
            console.log("- restKey starts with os_v2_app_:", isRichKey);
            console.log("- restKey length:", restKey.length);
            console.log("- authHeader prefix:", authHeader.slice(0, 15) + "...");

            const response = await fetch('https://api.onesignal.com/api/v1/notifications', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': authHeader
              },
              body: JSON.stringify(payload)
            });

            const data = await response.json();
            console.log("- OneSignal API Response:", data);
            res.statusCode = response.status;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          } catch (error) {
            console.error('Local API Push Error:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error.message || 'Local push error' }));
          }
        });
      } else {
        next();
      }
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), localApiPlugin()],
})
