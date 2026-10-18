import { handleGenerate } from './_lib/core.js';
import { toVercelHandler } from './_lib/vercel.js';

/** Assistant suggestions: lower temperature for more grounded next-step advice. */
export default toVercelHandler((req) => handleGenerate(req, 0.7));
