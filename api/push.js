const webpush = require('web-push');
const vapid = require('./vapid');

webpush.setVapidDetails(
  'mailto:notificaciones@hotmart.app',
  vapid.publicKey,
  vapid.privateKey
);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { subscription, title, body, icon } = req.body;

  if (!subscription) {
    return res.status(400).json({ error: 'Subscription missing' });
  }

  const payload = JSON.stringify({
    title: title || '¡Venta realizada!',
    body: body || 'Has recibido una nueva comisión en Hotmart.',
    icon: icon || '/hotmart-icon.png',
    badge: '/hotmart-icon.png',
    data: { url: '/' }
  });

  try {
    await webpush.sendNotification(subscription, payload);
    return res.status(200).json({ success: true, message: 'Push sent to Apple APNs' });
  } catch (error) {
    console.error('Error sending push to Apple APNs:', error);
    return res.status(500).json({ error: error.message });
  }
};
