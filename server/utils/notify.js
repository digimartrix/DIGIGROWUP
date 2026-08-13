import Notification from '../models/Notification.js';

/**
 * Dispatch automated ecosystem notification:
 * 1. Inserts into user's in-app Notification database
 * 2. Syncs to Google Apps Script Webhook automatically
 */
export async function sendAutomatedNotification({ userId, userName = '', userEmail = '', message, type = 'system' }) {
  try {
    if (!userId || !message) return null;

    // 1. Create DB Notification
    const notif = await Notification.create({
      userId,
      message,
      type,
      read: false
    }).catch(err => {
      console.warn('[NOTIF_DB_ERROR]', err.message);
      return null;
    });

    // 2. Automatically sync to Google Apps Script
    const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwUD3QyiFho_cTag9RWgD5AS3VAj8eG3dCt5veAGtD0CsTe1LFsh7NyN8GCnmqYI4cYdw/exec';
    if (appsScriptUrl) {
      fetch(appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userName || 'DigiLearner',
          email: userEmail || 'user@digilearning.com',
          content: `[${type.toUpperCase()}] ${message}`,
          timestamp: new Date().toISOString()
        })
      }).catch(err => {
        console.warn('[APPS_SCRIPT_AUTO_SYNC_WARN]', err.message);
      });
    }

    return notif;
  } catch (err) {
    console.warn('[AUTOMATED_NOTIFY_ERROR]', err.message);
    return null;
  }
}
