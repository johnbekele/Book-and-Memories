import express from 'express';
import bodyParser from 'body-parser';
import Book from '../model/bookSchema.js';
import Post from '../model/postSchema.js';
import dotenv from 'dotenv';

import logger from '../../utils/logger.js';

const app = express();

app.use(bodyParser.json());

dotenv.config();

// Get all books
const getBook = async (req, res) => {
  try {
    const result = await Book.find();
    if (result.length > 0) {
      res.status(200).json(result);
    } else {
      res.status(404).json({ message: 'No books found' });
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

//Search for a book by author or title
const searchBook = async (req, res) => {
  const { identifier } = req.body;
  try {
    const result = await Book.find({
      $or: [{ book_author: identifier }, { book_title: identifier }],
    });
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).json({ message: 'No books found' });
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

//Create a new book
const createBook = async (req, res) => {
  const {
    title,
    author,
    description,
    startDate,
    endDate,
    category,
    comment,
    rating,
    pages,
    memories,
  } = req.body;
  const userid = req.user.id;
  logger.log(req.user);
  try {
    const book = await Book.findOne({ book_title: title });
    if (!book) {
      book = await Book.create({
        book_title: title,
        book_author: author,
        description: description,
        category: category,
        pages: pages,
      });
    }
    const post = await Post.create({
      user: userid,
      book: book.id,
      memories: memories,
      start_date: startDate,
      end_date: endDate,
      rating: rating,
      comment: comment,
    });

    res.status(201).json({ message: 'Book create Succesfully ', book, post });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

//Comment on Book

//delete book using id
const deleteBook = async (req, res) => {
  // Added async
  const { id } = req.params;
  try {
    // Added try-catch block
    const book = await Book.findByPk(id); // Added await
    if (book) {
      await book.destroy(); // Added await
      res.status(200).json({ message: 'Book deleted successfully' });
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

//update book using id
const updateBook = async (req, res) => {
  const { id } = req.params;
  const { title, author, category, pages } = req.body;
  try {
    // Added try-catch block
    const book = await Book.findByPk(id); // Added await
    if (book) {
      await book.update({
        // Changed to proper update method
        book_titel: title,
        book_author: author,
        book_category: category,
        pages: pages,
      });
      res.status(200).json(book);
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export default { createBook, searchBook, getBook, deleteBook, updateBook };
