import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import connectDB from './src/config/dbConfig.js';
import dotenv from 'dotenv';
import Auth from './src/routes/Auth.js';
import Book from './src/routes/api/Book.js';
import Post from './src/routes/api/Post.js';
import passport from 'passport';
import configurePassport from './src/config/passportConfig.js';
import http from 'http';
import https from 'https';
import fs from 'fs';

dotenv.config();

const app = express();

// Apply CORS middleware with proper configuration ONCE

app.use(
  cors({
<<<<<<< HEAD
    origin: ['http://127.0.0.1:5173',
            'http://localhost:5173'
         ],
=======
    origin: ['http://127.0.0.1:5173', 'https://bookapis.zapto.org'],
>>>>>>> 0573a919dabad0988ab3910a388e63c51ae8064d
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Security headers middleware
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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const port = process.env.PORT || 3000;
const httpsPort = process.env.HTTPS_PORT || 443;

// Passport middleware
app.use(passport.initialize());

configurePassport();

// Routes
app.use('/api/auth', Auth);
app.use('/api/book', Book);
app.use('/api/post', Post);

//Global error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// HTTP server (optional - for redirecting to HTTPS)
http
  .createServer((req, res) => {
    res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
    res.end();
  })
  .listen(port, () => {
    console.log(`HTTP redirect server running on port ${port}`);
  });

// HTTPS server
try {
  const httpsOptions = {
    cert: fs.readFileSync(
      '/etc/letsencrypt/live/bookapis.zapto.org/fullchain.pem'
    ),
    key: fs.readFileSync(
      '/etc/letsencrypt/live/bookapis.zapto.org/privkey.pem'
    ),
    minVersion: 'TLSv1.2',
  };

  https.createServer(httpsOptions, app).listen(httpsPort, () => {
    connectDB();
    console.log(`HTTPS server running on port ${httpsPort}`);
    console.log(`https://bookapis.zapto.org`);
  });
} catch (error) {
  console.error('Failed to start HTTPS server:', error);

  // Fallback to HTTP-only if certificates can't be loaded
  // (useful for development environments)
  console.log('Starting in HTTP-only mode...');
  app.listen(port, () => {
    connectDB();
    console.log(`HTTP server running on port ${port}`);
    console.log(`http://localhost:${port}`);
  });
}
