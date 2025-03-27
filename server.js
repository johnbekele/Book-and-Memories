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

dotenv.config();

const app = express();

// Apply CORS middleware with proper configuration ONCE
app.use(
  cors({
    origin: 'http://127.0.0.1:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const port = process.env.PORT || 3000;

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

app.listen(port, () => {
  connectDB();
  console.log(`http://localhost:${port}`);
});
