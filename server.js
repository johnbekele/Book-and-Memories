import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import connectDB from './src/config/dbConfig.js';
import dotenv from 'dotenv';
import Auth from './src/routes/Auth.js';
import Book from './src/routes/api/Book.js';
import Post from './src/routes/api/Post.js';
import Flaged from './src/routes/api/FlagedComment.js';
import passport from 'passport';
import configurePassport from './src/config/passportConfig.js';
import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import logger from './utils/logger.js';

// Load environment variables
dotenv.config();

// Environment configuration
const isDevelopment = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;
const httpsPort = process.env.HTTPS_PORT || 8443;
const certPath = process.env.CERT_PATH || './certs'; // Updated path to local directory

// Initialize Express app
const app = express();

// Apply CORS middleware with proper configuration
app.use(
  cors({
    origin: isDevelopment
      ? ['http://127.0.0.1:5173', 'http://localhost:5173']
      : [
          'https://bookapis.zapto.org',
          'http://localhost:5173',
          'http://127.0.0.1:5173',
          'https://book-and-memories.vercel.app',
        ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Security headers middleware (only applied in production)
if (!isDevelopment) {
  app.use((req, res, next) => {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    );
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });
}

// Standard middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Passport middleware
app.use(passport.initialize());
configurePassport();

// Routes
app.use('/api/auth', Auth);
app.use('/api/books', Book);
app.use('/api/posts', Post);
app.use('/api/posts/flagged', Flaged);

// Global error handlings
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: isDevelopment ? err.message : undefined,
  });
});

// HTTP server (for redirecting to HTTPS in production or standalone in development)
const httpServer = http
  .createServer(
    isDevelopment
      ? app
      : (req, res) => {
          res.writeHead(301, {
            Location: `https://${req.headers.host}${req.url}`,
          });
          res.end();
        }
  )
  .listen(port, () => {
    if (isDevelopment) {
      connectDB();
      console.log(`HTTP server running on port ${port}`);
      console.log(`http://localhost:${port}`);
    } else {
      console.log(`HTTP redirect server running on port ${port}`);
    }
  });

// HTTPS server (only in production)
let httpsServer;
if (!isDevelopment) {
  try {
    const httpsOptions = {
      cert: fs.readFileSync(`${certPath}/fullchain.pem`),
      key: fs.readFileSync(`${certPath}/privkey.pem`),
      minVersion: 'TLSv1.2',
    };

    httpsServer = https
      .createServer(httpsOptions, app)
      .listen(httpsPort, () => {
        connectDB();
        console.log(`HTTPS server running on port ${httpsPort}`);
        console.log(`https://bookapis.zapto.org`);
      });
  } catch (error) {
    console.error('Failed to start HTTPS server:', error);
    console.log('Starting in HTTP-only mode as fallback...');

    // Fallback to HTTP-only if certificates can't be loaded
    httpServer.close(() => {
      httpServer = http.createServer(app).listen(port, () => {
        connectDB();
        console.log(
          `HTTP server running on port ${port} (HTTPS fallback mode)`
        );
      });
    });
  }
}

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP & HTTPS servers');

  httpServer.close(() => {
    console.log('HTTP server closed');

    if (httpsServer) {
      httpsServer.close(() => {
        console.log('HTTPS server closed');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP & HTTPS servers');

  httpServer.close(() => {
    console.log('HTTP server closed');

    if (httpsServer) {
      httpsServer.close(() => {
        console.log('HTTPS server closed');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  });
});
