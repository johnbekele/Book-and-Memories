import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import connectDB from './src/config/dbConfig.js';
import dotenv from 'dotenv';
import Auth from './src/routes/Auth.js';
import Book from './src/routes/api/Book.js';
import Post from './src/routes/api/Post.js';
import Flaged from './src/routes/api/FlagedComment.js';
import Notification from './src/routes/api/Notification.js';
import passport from 'passport';
import configurePassport from './src/config/passportConfig.js';
import logger from './utils/logger.js';

dotenv.config();

const isDevelopment = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;

const app = express();

// Connect to database
connectDB();

// CORS setup
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

// Security headers (optional in Render/Railway, since they also add headers)
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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(passport.initialize());
configurePassport();

// Routes
app.use('/api/auth', Auth);
app.use('/api/books', Book);
app.use('/api/posts', Post);
app.use('/api/posts/flagged', Flaged);
app.use('/api/notifications', Notification);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start server (simple HTTP, HTTPS handled by platform)
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
