export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { userId, title, message, url } = req.body;

    const appId = process.env.ONESIGNAL_APP_ID || process.env.VITE_ONESIGNAL_APP_ID;
    const restKey = process.env.ONESIGNAL_REST_API_KEY;

    if (!appId) {
      return res.status(400).json({ error: 'Missing OneSignal App ID environment variable' });
    }

    if (!restKey) {
      // Return a clean mock success in local dev so push testing doesn't throw errors
      console.warn("OneSignal REST API key (ONESIGNAL_REST_API_KEY) is missing. Push notification simulated.");
      return res.status(200).json({ 
        success: true, 
        simulated: true, 
        message: 'OneSignal REST API key not configured yet. Trigger simulated.' 
      });
    }

    const payload = {
      app_id: appId,
      headings: { en: title },
      contents: { en: message },
      url: url || ''
    };

    if (userId === 'all') {
      // Send to all subscribed players
      payload.included_segments = ['Subscribed Users'];
    } else if (userId === 'admin') {
      // Send to admin segment or specific admin tag
      payload.included_segments = ['Admins'];
    } else {
      // Send to the specific logged-in user external ID
      payload.include_external_user_ids = [userId];
    }

    // Call OneSignal REST API
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Basic ${restKey}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('OneSignal Push Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to send push notification' });
  }
}
