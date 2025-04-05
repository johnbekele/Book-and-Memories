import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import passport from 'passport';
import Auth from '../src/routes/Auth.js';
import Book from '../src/routes/api/Book.js';
import Post from '../src/routes/api/Post.js';
import configurePassport from '../src/config/passportConfig.js';

dotenv.config();

describe('Server', () => {
  let app;

  beforeAll(() => {
    app = express();

    app.use(
      cors({
        origin: ['http://127.0.0.1:5173', 'http://localhost:5173'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      })
    );
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(passport.initialize());
    configurePassport();

    app.use('/api/auth', Auth);
    app.use('/api/book', Book);
    app.use('/api/post', Post);
  });
});
