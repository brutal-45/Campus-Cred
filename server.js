/**
 * Custom server for Render deployment
 * Handles graceful startup and keeps the server responsive
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Track server state
let serverReady = false;
let healthCheckAttempts = 0;

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    
    // Handle health check requests immediately
    if (parsedUrl.pathname === '/api/health') {
      healthCheckAttempts++;
      
      // Return healthy response immediately for Render's health checks
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      });
      res.end(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        healthCheckAttempts: healthCheckAttempts,
        serverReady: serverReady,
      }));
      return;
    }
    
    // Handle wake-up endpoint
    if (parsedUrl.pathname === '/api/wake-up') {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      });
      res.end(JSON.stringify({
        status: 'awake',
        message: 'CampusCred is running!',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      }));
      return;
    }
    
    // Handle all other requests with Next.js
    handle(req, res, parsedUrl);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    serverReady = true;
    console.log(`> Ready on http://localhost:${port}`);
    console.log(`> Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`> Health check endpoint: /api/health`);
    console.log(`> Wake-up endpoint: /api/wake-up`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('> SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      console.log('> Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('> SIGINT received. Shutting down gracefully...');
    server.close(() => {
      console.log('> Server closed');
      process.exit(0);
    });
  });

}).catch((err) => {
  console.error('> Error starting server:', err);
  process.exit(1);
});
