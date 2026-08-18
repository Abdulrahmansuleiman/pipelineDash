// api/index.js
// Vercel serverless entry. The whole Express app (API + webhook receiver) runs
// as a single Function; vercel.json rewrites /api/* here. Static assets come
// from the vite build output (dist/), served by Vercel's static layer.
import { app } from '../server/app.js';

export default app;