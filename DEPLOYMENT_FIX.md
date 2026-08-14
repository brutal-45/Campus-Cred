# CampusCred Deployment Fix Guide

## Problem Solved: Session Restoration Loop on Vercel & Render

The application was experiencing a "restoring session" infinite loop when deployed on Vercel and Render, especially during cold starts or when the server was sleeping (Render free tier).

## What Was Fixed

### 1. **AuthProvider.tsx** - Timeout Handling for Session Restoration
- Added AbortController with 4-second timeout for refresh-token API calls
- Graceful degradation: if session restore fails due to cold start, the app continues without auth instead of hanging
- Changed loader text from "Restoring session..." to "Loading..." for better UX
- Server errors (5xx) and timeouts no longer trigger logout - they just allow the app to continue
- The useTokenRefresh hook will retry authentication when user performs actions

### 2. **vercel.json** - New Configuration for Vercel
- Set maxDuration to 10 seconds for API routes (prevents timeout during token refresh)
- Added Cache-Control headers to prevent caching of API responses
- Configured region to iad1 for consistent performance

### 3. **next.config.ts** - Optimizations
- Added serverComponents experimental flag for better serverless compatibility
- Added removeConsole compiler option to reduce bundle size in production

### 4. **render.yaml** - Documentation
- Added optional autoDeploy comment for controlling deployment behavior

## How It Works Now

### On Page Load:
1. AuthProvider attempts to restore session via `/api/auth/refresh-token`
2. If the request takes longer than 4 seconds (cold start), it times out gracefully
3. Instead of showing an infinite loader, the app renders and allows user interaction
4. The useTokenRefresh hook continues to retry authentication in the background
5. When user clicks/taps anything, the token refresh will work (server is now awake)

### For Logged-In Users:
- If the access token is still valid, the app works immediately
- If the access token expired but refresh token is valid, it refreshes within 4 seconds
- If the server is waking up, the app shows "Loading..." for max 4 seconds then lets user interact

## Deployment Instructions

### For Vercel:
1. Push this code to your Git repository connected to Vercel
2. The vercel.json will be automatically applied
3. No additional configuration needed

### For Render:
1. Push this code to your Git repository connected to Render
2. The render.yaml will be automatically applied
3. Optional: Set up a cron job to ping `/api/wake-up` every 5 minutes to prevent sleep:
   ```
   curl https://your-app.onrender.com/api/wake-up
   ```

## Testing the Fix

1. **Deploy to Vercel/Render**
2. **Log in** to your application
3. **Wait for server to sleep** (Render free tier sleeps after 15 minutes of inactivity)
4. **Open the app in a new tab/incognito** - you should see "Loading..." for max 4 seconds, then the landing page appears
5. **Click on Login** - the authentication will work because the server is now awake
6. **Refresh the page while logged in** - session restores normally if server is awake

## Certificate Generation

Certificate generation continues to work as before:
- Complete a task and submit it
- Admin approves the submission
- Certificate is automatically generated with QR code
- Downloadable PDF certificate is created
- Tamper-proof hash is stored on blockchain

No changes were needed to certificate functionality.

## Additional Recommendations

### For Render Free Tier:
Set up a free uptime monitor to ping your app every 5 minutes:
- Use UptimeRobot (free): https://uptimerobot.com/
- Monitor type: HTTP(s)
- URL: `https://your-app.onrender.com/api/wake-up`
- Interval: 5 minutes

This prevents the server from sleeping and ensures instant response times.

### For Vercel:
No additional configuration needed. Vercel handles cold starts automatically.

## Files Modified

1. `/workspace/src/providers/AuthProvider.tsx` - Core fix for session restoration
2. `/workspace/vercel.json` - New file for Vercel configuration
3. `/workspace/next.config.ts` - Minor optimizations
4. `/workspace/render.yaml` - Added documentation comment

## Troubleshooting

If you still experience issues:

1. **Check browser console** for error messages
2. **Verify environment variables** are set correctly in Vercel/Render dashboard
3. **Check database connection** - ensure DATABASE_URL is correct
4. **Review server logs** in Vercel/Render dashboard for any errors

## Support

If issues persist, check:
- Vercel Function logs: https://vercel.com/docs/concepts/functions/serverless-functions/logging
- Render Logs: https://render.com/docs/logs
