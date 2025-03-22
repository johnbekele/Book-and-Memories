import express from 'express';
import bodyParser from 'body-parser';
import Book from '../model/Books.js';
import dotenv from 'dotenv';

const app = express();

app.use(bodyParser.json());

dotenv.config();

const getBook = async (req, res) => {
  try {
    const result = await Book.findAll();
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

const searchBook = async (req, res) => {};

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
  } = req.body;
  const userid = req.user.id;
  try {
    const result = await Book.create({
      book_titel: title,
      book_author: author,
      start_date: startDate,
      end_date: endDate,
      book_category: category,
      book_comment: comment,
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

const deleteBook = (req, res) => {
  const { id } = req.params;
  const book = Book.findByPk(id);
  if (book) {
    book.destroy();
    res.status(200).json({ message: 'Book deleted successfully' });
  } else {
    res.status(404).json({ message: 'Book not found' });
  }
};

const updateBook = async (req, res) => {
  const { id } = req.params;
  const { title, author, category, pages } = req.body;
  const book = Book.findByPk(id);
  if (book) {
    book.title = title;
    book.author = author;
    book.category = category;
    book.pages = pages;
    book.save();
    res.status(200).json(book);
  } else {
    res.status(404).json({ message: 'Book not found' });
  }
};

export default { createBook, searchBook, getBook, deleteBook, updateBook };
