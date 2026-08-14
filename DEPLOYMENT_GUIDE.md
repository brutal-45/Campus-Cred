# CampusCred Render Deployment Guide

## Overview

This guide explains how to deploy CampusCred on Render and prevent the "wake up" loop issue that occurs with free tier deployments.

## Problem: Render Free Tier Sleep Cycle

Render's free tier web services sleep after 15 minutes of inactivity. When a user tries to access the app:
1. Render shows a "waking up" screen
2. The service starts (cold boot)
3. User sees the page reload/redirect loop

## Solution Implemented

### 1. Health Check Endpoint (`/api/health`)
- Returns immediate response without heavy database operations
- Used by Render to determine if the service is healthy
- Located at: `src/app/api/health/route.ts`

### 2. Wake-up Endpoint (`/api/wake-up`)
- Lightweight endpoint that returns instantly
- Can be pinged every 5-10 minutes to prevent sleep
- Located at: `src/app/api/wake-up/route.ts`

### 3. Custom Server (`server.js`)
- Handles health checks before Next.js fully loads
- Reduces cold start time for health check requests
- Provides graceful shutdown handling

### 4. Updated Configuration
- `next.config.ts`: Added `output: 'standalone'` for optimized Docker builds
- `render.yaml`: Complete deployment configuration
- `package.json`: Added `start:render` script

## Deployment Steps

### Option A: Using render.yaml (Recommended)

1. **Push code to Git** (GitHub/GitLab)
   ```bash
   git add .
   git commit -m "Configure for Render deployment"
   git push origin main
   ```

2. **Connect to Render**
   - Go to https://render.com
   - Click "New +" → "Blueprint"
   - Connect your repository
   - Render will automatically detect `render.yaml`

3. **Configure Database**
   - Render will create a PostgreSQL database automatically
   - The connection string is injected via `DATABASE_URL` environment variable

4. **Deploy**
   - Render will run `npm run render-build`
   - Then start with `node server.js`

### Option B: Manual Setup

1. **Create New Web Service**
   - Go to https://render.com/dashboard
   - Click "New +" → "Web Service"
   - Connect your repository

2. **Configure Build Settings**
   - **Environment**: Node
   - **Build Command**: `npm run render-build`
   - **Start Command**: `node server.js`

3. **Add Environment Variables**
   ```
   NODE_ENV=production
   DATABASE_URL=<your-postgresql-connection-string>
   JWT_SECRET=<generate-random-secret>
   JWT_REFRESH_SECRET=<generate-random-secret>
   SMS_PROVIDER=console
   EMAIL_PROVIDER=console
   PORT=3000
   ```

4. **Create Database**
   - In Render dashboard, create new PostgreSQL database
   - Copy the connection string
   - Add as `DATABASE_URL` environment variable

## Preventing Sleep (Keep App Awake)

### Method 1: Render Cron Job (Recommended)

1. Create a new Cron Job in Render:
   - Name: `campuscred-keepalive`
   - Command: `curl -f https://YOUR_APP.onrender.com/api/wake-up || exit 1`
   - Frequency: Every 5 minutes

2. This ensures the app never sleeps

### Method 2: External Uptime Monitor

Use a free service to ping your wake-up endpoint:

**UptimeRobot** (https://uptimerobot.com):
1. Create free account
2. Add new monitor
3. Type: HTTP(s)
4. URL: `https://YOUR_APP.onrender.com/api/wake-up`
5. Interval: 5 minutes

**Cron-Job.org** (https://cron-job.org):
1. Create free account
2. Create cronjob
3. URL: `https://YOUR_APP.onrender.com/api/wake-up`
4. Schedule: */5 * * * *

## Testing Deployment

### 1. Check Health Endpoint
```bash
curl https://YOUR_APP.onrender.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-XX...",
  "uptime": 123.456,
  ...
}
```

### 2. Check Wake-up Endpoint
```bash
curl https://YOUR_APP.onrender.com/api/wake-up
```

Expected response:
```json
{
  "status": "awake",
  "message": "CampusCred is running!",
  "timestamp": "2025-01-XX...",
  "uptime": 123.456
}
```

### 3. Test Main Application
```bash
curl -I https://YOUR_APP.onrender.com
```

Should return `HTTP/2 200`

## Troubleshooting

### Issue: App keeps restarting

**Solution:**
1. Check logs in Render dashboard
2. Verify `DATABASE_URL` is correct
3. Ensure Prisma schema matches database
4. Run `npx prisma db push` manually if needed

### Issue: Health checks failing

**Solution:**
1. Check if database is accessible
2. Verify environment variables are set
3. Check Render logs for error messages

### Issue: Long cold start times

**Solution:**
1. Use the keepalive cron job (Method 1 above)
2. Consider upgrading to paid plan if performance is critical
3. Optimize build size with `output: 'standalone'`

## File Structure

```
campuscred/
├── render.yaml              # Render deployment config
├── server.js                # Custom server for Render
├── next.config.ts           # Next.js config with standalone output
├── package.json             # With start:render script
├── .renderignore            # Files to ignore during deployment
├── src/
│   └── app/
│       ├── api/
│       │   ├── health/      # Health check endpoint
│       │   │   └── route.ts
│       │   └── wake-up/     # Wake-up endpoint
│       │       └── route.ts
│       └── ...
└── ...
```

## Cost Optimization

- **Free Tier**: Good for development/testing
- **Paid Plans**: Starting at $7/month for better performance
- **Database**: Free tier includes 1GB storage

## Support

For issues or questions:
- Email: creatorsports81@gmail.com
- Phone: 9096341850

---

**Last Updated**: January 2025
**Version**: 1.0.0
