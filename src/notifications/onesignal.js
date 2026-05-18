import OneSignal from 'react-onesignal';

let isInitialized = false;

/**
 * Initialize OneSignal Push Notifications
 * Call this inside your App.jsx or main layout component
 */
export const initOneSignal = async () => {
  if (isInitialized) return;

  try {
    const appId = import.meta.env.VITE_ONESIGNAL_APP_ID;
    
    if (!appId) {
      console.warn('OneSignal App ID is missing. Please add VITE_ONESIGNAL_APP_ID to your .env file');
      return;
    }

    await OneSignal.init({
      appId: appId,
      safari_web_id: import.meta.env.VITE_ONESIGNAL_SAFARI_ID,
      notifyButton: {
        enable: true, // Shows a floating bell button for users to subscribe/unsubscribe
        colors: {
          'circle.background': 'rgb(139, 92, 246)', // Match with futuristic theme (e.g., violet-500)
          'circle.foreground': 'white',
        }
      },
      allowLocalhostAsSecureOrigin: true, // Useful for local testing
    });

    isInitialized = true;
    console.log('OneSignal Initialized');
  } catch (error) {
    if (error.message && error.message.includes('already initialized')) {
      isInitialized = true;
      return;
    }
    console.error('Error initializing OneSignal:', error);
  }
};

export default OneSignal;
