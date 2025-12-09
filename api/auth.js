export default async function handler(req, res) {
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { password } = req.body;
    const correctPassword = process.env.APP_PASSWORD;

    console.log('Environment variable APP_PASSWORD exists:', !!correctPassword);
    console.log('Received password length:', password?.length || 0);
    console.log('Expected password length:', correctPassword?.length || 0);
    
    if (!correctPassword) {
      console.error('APP_PASSWORD environment variable is not set!');
      return res.status(500).json({ 
        error: 'Password not configured on server. Please set APP_PASSWORD environment variable in Vercel.' 
      });
    }

    // Trim whitespace from both passwords for comparison
    const trimmedPassword = password?.trim();
    const trimmedCorrectPassword = correctPassword?.trim();

    if (trimmedPassword === trimmedCorrectPassword) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(401).json({ error: 'Invalid password' });
    }
  } catch (error) {
    console.error('Auth Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
