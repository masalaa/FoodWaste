export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Allow both GET and POST for testing
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only GET and POST requests are allowed'
    });
  }

  try {
    return res.status(200).json({
      message: 'Test endpoint working',
      method: req.method,
      timestamp: new Date().toISOString(),
      environment: {
        hasAppId: !!process.env.NUTRITIONIX_APP_ID,
        hasAppKey: !!process.env.NUTRITIONIX_APP_KEY
      }
    });
  } catch (error) {
    console.error('Test error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Test endpoint failed',
      details: error.message
    });
  }
} 