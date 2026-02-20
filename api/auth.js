export default async function handler(req, res) {
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  // GET: return whether a password is required (opt-in based on APP_PASSWORD being set)
  if (req.method === 'GET') {
    return res.status(200).json({ required: !!process.env.APP_PASSWORD });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { password } = req.body;
    const correctPassword = process.env.APP_PASSWORD;

    // If no password is configured, access is open to everyone
    if (!correctPassword) {
      return res.status(200).json({ success: true });
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
