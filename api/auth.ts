import { handleAuth } from './_lib/core.js';
import { toVercelHandler } from './_lib/vercel.js';

/**
 * GET    → { required, authenticated }
 * POST   → verify { password }, set HttpOnly session cookie
 * DELETE → clear session cookie
 */
export default toVercelHandler(handleAuth);
