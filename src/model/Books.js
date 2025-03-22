import mongoose from 'mongoose';

// Define the schema
const bookSchema = new mongoose.Schema({
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
  start_date: {
    type: Date, // Mongoose uses Date type for dates
    required: false,
  },
  end_date: {
    type: Date,
    required: false,
  },
  book_comment: {
    type: String,
    required: false,
  },
  book_memories: {
    type: String,
    required: false,
  },
  book_rating: {
    type: Number,
    required: false,
  },
  book_id: {
    type: Number,
    required: false,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId, // Assuming 'users' is a collection, use ObjectId
    ref: 'User', // The name of the referenced model
    required: true,
  },
}, {
  collection: 'fav_list', // Collection name
  timestamps: false, // Set to true if you want createdAt and updatedAt fields
});

// Create the model
const Book = mongoose.model('Book', bookSchema);

export default Book;