import express from 'express';
import bodyParser from 'body-parser';
import Book from '../model/Books.js';
import dotenv from 'dotenv';

const app = express();

app.use(bodyParser.json());

dotenv.config();

const getBook = async (req, res) => {
  try {
    const result = await Book.find();
    if (result.length > 0) {
      res.status(200).json(result);
    } else {
      res.status(404).json({ message: 'No books found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const searchBook = async (req, res) => {
  const { identifier } = req.body;
  try {
    const result = await Book.find({
      $or: [{ book_author: identifier }, { book_titel: identifier }],
    });
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).json({ message: 'No books found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createBook = async (req, res) => {
  const {
    title,
    author,
    startDate,
    endDate,
    category,
    comment,
    rating,
    pages,
    memories,
  } = req.body;
  const userid = req.user.id;
  console.log(req.user);
  try {
    const result = await Book.create({
      book_title: title,
      book_author: author,
      start_date: startDate,
      end_date: endDate,
      book_category: category,
      book_comment: comment,
      book_memories: memories,
      book_rating: rating,
      user_id: userid,
      pages: pages,
    });
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

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
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

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
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export default { createBook, searchBook, getBook, deleteBook, updateBook };
