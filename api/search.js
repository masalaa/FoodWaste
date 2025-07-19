export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are allowed'
    });
  }

  try {
    // Parse request body
    let body;
    try {
      body = req.body;
      if (typeof body === 'string') {
        body = JSON.parse(body);
      }
    } catch (parseError) {
      return res.status(400).json({
        error: 'Invalid JSON',
        message: 'Request body must be valid JSON'
      });
    }

    const { query, nutrients, detailed } = body || {};

    // Validate required fields
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ 
        error: 'Missing required field: query',
        message: 'Query parameter is required and must be a string'
      });
    }

    const appId = process.env.NUTRITIONIX_APP_ID;
    const appKey = process.env.NUTRITIONIX_APP_KEY;

    if (!appId || !appKey) {
      console.error('Nutritionix credentials not configured');
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'Nutritionix credentials not set'
      });
    }

    // Determine which Nutritionix endpoint to use
    let url, requestBody;
    
    if (nutrients) {
      // Use nutrients endpoint
      url = 'https://trackapi.nutritionix.com/v2/natural/nutrients';
      requestBody = { query };
    } else {
      // Use instant search endpoint
      url = 'https://trackapi.nutritionix.com/v2/search/instant';
      requestBody = { 
        query, 
        detailed: detailed ? true : false 
      };
    }

    // Make request to Nutritionix API
    const apiResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'x-app-id': appId,
        'x-app-key': appKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('Nutritionix API error:', apiResponse.status, errorText);
      return res.status(apiResponse.status).json({
        error: 'Nutritionix API error',
        message: `API returned status ${apiResponse.status}`,
        details: errorText
      });
    }

    const data = await apiResponse.json();
    
    // Ensure we're returning a valid JSON response
    if (data && typeof data === 'object') {
      return res.status(200).json(data);
    } else {
      return res.status(500).json({
        error: 'Invalid response from Nutritionix',
        message: 'Received invalid data format from API'
      });
    }

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process request',
      details: error.message
    });
  }
} 