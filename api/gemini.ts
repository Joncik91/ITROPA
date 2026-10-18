import { handleGenerate } from './_lib/core.js';
import { toVercelHandler } from './_lib/vercel.js';

/** Main content generation (predictions, analyses). */
export default toVercelHandler((req) => handleGenerate(req, 0.9));
