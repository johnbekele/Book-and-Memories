import mongoose from 'mongoose';

// Define the schema
const bookSchema = new mongoose.Schema(
  {
    book_title: {
      type: String,
      maxlength: 50,
      required: false,
    },
    book_author: {
      type: String,
      maxlength: 100,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    category: {
      type: String,
      required: false,
    },
    pages: {
      type: Number,
      required: false,
    },
    cover_image: {
      type: String,
    },
    google_book_id: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'books',
    timestamps: true,
  }
);

// Create the model
const Book = mongoose.model('Book', bookSchema);

export default Book;
