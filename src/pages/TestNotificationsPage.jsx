import React, { useState } from 'react';
import { pushService } from '../notifications/pushService';
import { EmailTemplates } from '../notifications/emailService';

const TestNotificationsPage = () => {
  const [emailStatus, setEmailStatus] = useState('');
  const [email, setEmail] = useState('');

  const handlePushTest = async () => {
    try {
      await pushService.requestPermission();
      alert('Requested push permission! Check if a prompt appeared or if you are already subscribed.');
    } catch (error) {
      console.error(error);
      alert('Error requesting push permission: ' + error.message);
    }
  };

  const handleEmailTest = async () => {
    if (!email) {
      alert('Please enter an email address to test.');
      return;
    }
    
    setEmailStatus('Sending...');
    try {
      // Trying to send a test welcome email
      const response = await EmailTemplates.sendWelcomeEmail(email, 'Test User');
      setEmailStatus('Success! Response: ' + JSON.stringify(response));
    } catch (error) {
      console.error(error);
      setEmailStatus('Failed (check console). Note: Resend often blocks client-side API calls due to CORS. If you see a CORS error, this confirms the keys are set but you must call it from a backend (like Supabase Edge Functions). Error: ' + error.message);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Test Notifications</h1>
      
      {/* Push Notifications Section */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-purple-400">1. Test OneSignal Push</h2>
        <p className="mb-4 text-gray-300">
          This will prompt the browser for push permissions. You should also see a floating bell icon in the bottom right if OneSignal initialized correctly.
        </p>
        <button 
          onClick={handlePushTest}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded shadow transition"
        >
          Prompt Push Permission
        </button>
      </div>

      {/* Email Section */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-blue-400">2. Test Resend Email</h2>
        <p className="mb-4 text-gray-300">
          Sends a test Welcome email to the address below.
        </p>
        <div className="flex space-x-4 mb-4">
          <input 
            type="email" 
            placeholder="your-email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-gray-900 border border-gray-600 rounded px-3 py-2 flex-grow text-white"
          />
          <button 
            onClick={handleEmailTest}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition"
          >
            Send Email
          </button>
        </div>
        {emailStatus && (
          <div className="mt-4 p-3 bg-gray-900 rounded border border-gray-700 text-sm text-gray-300">
            {emailStatus}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestNotificationsPage;
