import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import connectDB from './src/config/dbConfig.js';
import dotenv from 'dotenv';
import Auth from './src/routes/Auth.js';
import Book from './src/routes/api/Book.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const port = process.env.PORT || 3000;

// Routes
app.use('/auth', Auth);
app.use('/api/book', Book);

app.listen(port, () => {
  connectDB();
  console.log(`http://localhost:${port}/`);
});
