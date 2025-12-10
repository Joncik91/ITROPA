# Deployment Guide

## Overview

ITROPA is deployed to Vercel using Serverless Functions to securely handle AI API requests. This guide covers deployment, configuration, and security setup.

---

## Architecture

### Secure Deployment Pattern

```
User Browser (No secrets)
     ↓
Vercel Edge Network (Fast CDN)
     ↓
React Frontend (static files in dist/)
     ↓
Vercel Serverless Functions (api/ directory)
     ↓
Google Gemini API (protected by API key)
```

### Why Vercel + Serverless Functions?

- **Security**: API keys never exposed to browser
- **Scalability**: Auto-scaling serverless functions
- **Performance**: Global CDN for frontend assets
- **Simplicity**: Zero infrastructure management
- **Free Tier**: Sufficient for small-medium projects

---

## Prerequisites

### Required

1. **Vercel Account**: https://vercel.com/signup (free)
2. **GitHub Account**: For code integration (optional but recommended)
3. **Git**: Installed and configured
4. **Node.js & npm**: For local testing

### API Keys

1. **Google Gemini API Key**: https://aistudio.google.com/app/apikey
2. **Vercel Token** (for CLI): Generated in Vercel dashboard

---

## Step-by-Step Deployment

### Phase 1: Prepare Project Locally

#### 1.1 Install Vercel CLI

```bash
npm install -g vercel
```

Verify installation:
```bash
vercel --version
```

#### 1.2 Test Build Locally

Ensure the project builds without errors:

```bash
npm install       # If not done already
npm run build     # Build the React app
```

**Expected output**: `dist/` folder with production build

#### 1.3 Test API Functions Locally

```bash
vercel dev
```

This runs:
- Frontend on http://localhost:3000
- API functions on http://localhost:3000/api/*

Press `Ctrl+C` to stop.

### Phase 2: Deploy to Vercel

#### 2.1 Deploy from Command Line

```bash
vercel
```

**First time**: You'll be prompted to:
1. Verify email
2. Link to project directory
3. Import project (create new if needed)

**Output**:
```
Vercel CLI
> Success! Verified and connected to Vercel

Inspect the following deployment at:
https://industry-family-tree.vercel.app [in 2s]
```

#### 2.2 Alternative: Deploy from Git

1. Push code to GitHub:
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. Go to https://vercel.com
3. Click "New Project"
4. Import GitHub repository
5. Select the `industry-family-tree` repo
6. Click "Import"
7. Configure environment variables (see Phase 3)
8. Click "Deploy"

---

## Phase 3: Environment Configuration

### 3.1 Add API Key to Vercel

**In Vercel Dashboard**:

1. Go to your project settings
2. Navigate to "Settings" → "Environment Variables"
3. Add variable:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Your actual Gemini API key
   - **Environments**: Select all (Production, Preview, Development)
4. Click "Save"

### 3.2 Add Password Protection (Optional)

For production security, add password authentication:

1. In Environment Variables, add:
   - **Name**: `APP_PASSWORD`
   - **Value**: Your chosen password (strong recommended)
   - **Environments**: Production only
2. Click "Save"

### 3.3 Environment Variables Summary

| Variable | Value | Required | Environment |
|----------|-------|----------|-------------|
| `GEMINI_API_KEY` | Your API key | Yes | All |
| `APP_PASSWORD` | Strong password | No | Production |

---

## Phase 4: Redeploy with Environment Variables

After adding environment variables, redeploy:

```bash
vercel --prod
```

Or trigger redeploy from Vercel dashboard:
1. Go to "Deployments"
2. Click the latest deployment
3. Click "Redeploy"

---

## Phase 5: Verify Deployment

### 5.1 Test Frontend

1. Open https://your-project.vercel.app
2. App should load without errors
3. Check browser console for errors: `F12`

### 5.2 Test API Endpoint

```bash
curl -X POST https://your-project.vercel.app/api/gemini \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What are some industries related to entertainment?"
  }'
```

Expected response:
```json
{
  "text": "Here are some entertainment-related industries..."
}
```

### 5.3 Test with Frontend

1. Click "Add Prediction" or similar feature
2. Observe API call in Network tab (DevTools)
3. Check response appears correctly

---

## Configuration Files

### vercel.json

Located at project root: `vercel.json`

```json
{
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,POST,OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type" }
      ]
    }
  ]
}
```

**Explanation**:
- **maxDuration**: API functions timeout after 30 seconds
- **headers**: CORS configuration for browser requests

### TypeScript Configuration (api/)

File: `api/tsconfig.json`

```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "lib": ["ES2020"],
    "module": "commonjs",
    "target": "ES2020",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true
  },
  "include": ["*.ts"],
  "exclude": ["node_modules"]
}
```

---

## API Functions Details

### gemini.ts

Handles Gemini API requests with proper CORS and error handling.

**Endpoint**: `POST /api/gemini`

**Request Body**:
```json
{
  "prompt": "Your AI prompt here",
  "maxTokens": 8000,
  "temperature": 0.9
}
```

**Response**:
```json
{
  "text": "AI-generated response"
}
```

**Error Handling**:
- 400: Missing prompt
- 429: API quota exceeded
- 500: Internal server error

### ai-assistant.ts

Handles AI assistant operations, similar to gemini.ts with different temperature defaults.

**Endpoint**: `POST /api/ai-assistant`

**Temperature**: 0.7 (more deterministic than gemini.ts)

---

## Security Best Practices

### 1. API Key Protection

- Never commit `.env` files to Git
- Store keys as Vercel environment variables only
- Rotate keys periodically
- Monitor usage in Google AI Studio

### 2. Password Protection

Enable in production for additional security:

```bash
# Set APP_PASSWORD in Vercel environment
vercel env add APP_PASSWORD
# Enter your password when prompted
```

The frontend will prompt for password before allowing access.

### 3. CORS Configuration

CORS headers in `vercel.json` allow:
- Origin: `*` (any domain can call API)
- Methods: `GET`, `POST`, `OPTIONS`
- Headers: `Content-Type`

**Note**: For stricter security, limit origin to specific domains:
```json
"value": "https://yourdomain.com"
```

### 4. Serverless Function Limits

- **Max Duration**: 30 seconds (timeout)
- **Memory**: 512 MB default
- **Environment**: Node.js 18+

### 5. Monitoring

In Vercel Dashboard:
- View logs: "Deployments" → "Runtime Logs"
- Monitor errors: "Monitoring" → "Events"
- Track API usage

---

## Troubleshooting

### Build Fails

```
error: Cannot find module 'react'
```

**Solution**:
1. Check `package.json` has all dependencies
2. Run locally: `npm install && npm run build`
3. Push changes to Git
4. Trigger redeploy in Vercel

### API Returns 500 Error

**Troubleshooting steps**:
1. Check Vercel logs: Dashboard → Deployments → Runtime Logs
2. Verify `GEMINI_API_KEY` is set in environment variables
3. Test endpoint locally: `vercel dev`
4. Check Gemini API status and quota

### API Returns 429 (Quota Exceeded)

**Solution**:
- Upgrade Gemini API plan
- Wait for quota reset (usually hourly)
- Contact Google support for higher limits

### CORS Errors

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution**:
- Verify `vercel.json` CORS headers are correct
- Redeploy: `vercel --prod`
- Clear browser cache: `Ctrl+Shift+Delete`

### Frontend 404 Error

**Solution**:
1. Verify deployment succeeded: Check Vercel dashboard
2. Clear browser cache
3. Check index.html exists in dist/
4. Rebuild: `npm run build`

### Password Protection Not Working

**Solution**:
1. Verify `APP_PASSWORD` environment variable is set (Production only)
2. Redeploy: `vercel --prod`
3. Clear browser localStorage
4. Test in incognito/private window

---

## Production Checklist

Before going live with production URL:

- [ ] API key configured in Vercel
- [ ] Build passes locally: `npm run build`
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] Frontend loads without errors
- [ ] API endpoints respond correctly
- [ ] CORS headers configured
- [ ] Password protection enabled (if needed)
- [ ] Environment variables set for Production
- [ ] Domain custom domain configured (if applicable)
- [ ] SSL certificate active (automatic with Vercel)

---

## Custom Domain Setup

### Add Custom Domain to Vercel

1. Buy domain from registrar (GoDaddy, Namecheap, etc.)
2. In Vercel Dashboard:
   - Go to "Settings" → "Domains"
   - Click "Add"
   - Enter your domain
   - Follow DNS setup instructions
3. Update DNS records at registrar (usually within 1 hour)
4. Vercel auto-provisions SSL certificate

---

## Monitoring & Maintenance

### View Logs

```bash
vercel logs              # View deployment logs
vercel logs --tail       # Stream live logs
```

### Monitor Errors

In Vercel Dashboard:
1. "Monitoring" tab shows error rates
2. Click errors to see stack traces
3. Set up email alerts for failures

### Analytics

Vercel provides:
- Request count
- Response times
- Error rates
- Build times

View in Dashboard under "Analytics"

---

## Rollback Deployment

If new deployment breaks:

1. Go to Vercel Dashboard
2. "Deployments" tab
3. Click previous working deployment
4. Click "Promote to Production"

This instantly reverts to previous version.

---

## Environment-Specific Behavior

### Development (Local)

```bash
npm run dev
# No authentication needed
# No API key exposure
# Using .env file for API key
```

### Preview (Branch Deployments)

```bash
# Created automatically from pull requests
# Uses same environment variables as Production
# Full feature parity with Production
```

### Production

```bash
# Main branch deployments
# Password protection enabled (if APP_PASSWORD set)
# Full security measures active
```

---

## Cost Considerations

### Free Tier (Sufficient for most projects)

- 100 GB bandwidth/month
- 6000 serverless function hours/month
- Auto-scaling included
- SSL certificate included

### Paid Plan (If needed)

- Pro: $20/month
- Enterprise: Custom pricing
- See https://vercel.com/pricing

---

## Advanced Topics

### Performance Optimization

Enable caching headers in `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/assets/**",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

### Custom Error Pages

Create `public/404.html` and `public/500.html` for custom error pages.

### Environment-Specific Code

```tsx
if (import.meta.env.PROD) {
  // Production-only code
} else {
  // Development code
}
```

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Community**: https://vercel.com/discord
- **Google Gemini API**: https://ai.google.dev
- **GitHub Integration**: https://vercel.com/docs/git

---

## Next Steps

1. Complete all deployment steps above
2. Test production deployment thoroughly
3. Set up monitoring and alerts
4. Document your deployment configuration
5. Plan maintenance and update strategy

For frontend development, see [development-guide-frontend.md](./development-guide-frontend.md)

For understanding the codebase, see [source-tree-analysis.md](./source-tree-analysis.md)
