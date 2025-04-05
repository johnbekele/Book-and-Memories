import express from 'express';
import bodyParser from 'body-parser';
import Book from '../model/bookSchema.js';
import Post from '../model/postSchema.js';
import dotenv from 'dotenv';
import googleBooksService from '../services/googleBooksService.js';
import logger from '../../utils/logger.js';

const app = express();

app.use(bodyParser.json());

dotenv.config();

//Serach books from Google API
const searchGoogleBooks = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === '') {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const books = await googleBooksService.searchBooks(query);
    res.status(200).json(books);
  } catch (error) {
    logger.error('Google Books search error:', error);
    res.status(500).json({ message: 'Failed to search books' });
  }
};

//Get book details from Google API
const getGoogleBookDetails = async (req, res) => {
  try {
    const { googleId } = req.params;

    if (!googleId) {
      return res.status(400).json({ message: 'Book ID is required' });
    }

    const book = await googleBooksService.getBookById(googleId);
    res.status(200).json(book);
  } catch (error) {
    logger.error('Google Books details error:', error);
    res.status(500).json({ message: 'Failed to fetch book details' });
  }
};

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
    googleId,
    coverImage,
  } = req.body;

  const userid = req.user.id;
  logger.log(req.user);

  try {
    let bookData = {
      book_title: title,
      book_author: author,
      description: description,
      category: category,
      pages: pages,
    };

    // If googleId is provided, fetch additional data from Google Books API
    if (googleId) {
      try {
        const googleBookDetails = await googleBooksService.getBookById(
          googleId
        );

        // Use Google Books data if available, otherwise use provided data
        bookData = {
          book_title: title || googleBookDetails.title,
          book_author: author || googleBookDetails.author,
          description: description || googleBookDetails.description,
          category:
            category ||
            (googleBookDetails.categories?.length > 0
              ? googleBookDetails.categories[0]
              : ''),
          pages: pages || googleBookDetails.pageCount,
          cover_image: coverImage || googleBookDetails.coverImage,
          google_book_id: googleId,
        };
      } catch (googleError) {
        // If Google Books API fails, continue with provided data
        logger.error('Failed to fetch Google Books data:', googleError);
      }
    }

    // Find or create book
    let book = await Book.findOne({ book_title: bookData.book_title });

    if (!book) {
      book = await Book.create(bookData);
    } else {
      // Update book with new data if it exists
      // Only update fields that aren't already set
      if (!book.description && bookData.description) {
        book.description = bookData.description;
      }
      if (!book.cover_image && bookData.cover_image) {
        book.cover_image = bookData.cover_image;
      }
      if (!book.google_book_id && bookData.google_book_id) {
        book.google_book_id = bookData.google_book_id;
      }
      if (book.isModified()) {
        await book.save();
      }
    }

    // Create post
    const postData = {
      user: userid,
      book: book.id,
      memories: memories,
      start_date: startDate,
      end_date: endDate,
      rating: rating,
      comment: [], // Initialize as empty array
    };

    // If a comment was provided, add it as the first comment
    if (comment && typeof comment === 'string') {
      postData.comment.push({
        user: userid,
        text: comment,
        created_at: new Date(),
      });
    } else if (Array.isArray(comment)) {
      // If comment is already an array (for flexibility)
      postData.comment = comment;
    }

    const post = await Post.create(postData);

    res.status(201).json({ message: 'Book created successfully', book, post });
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

export default {
  createBook,
  searchBook,
  getBook,
  deleteBook,
  updateBook,
  searchGoogleBooks,
  getGoogleBookDetails,
};
