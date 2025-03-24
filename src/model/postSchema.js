import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
  memories: [
    {
      type: String,
      created_at: { type: Date, default: Date.now },
    },
  ],
  start_date: {
    type: Date,
    required: false,
  },
  end_date: {
    type: Date,
    required: false,
  },
  rating: {
    type: Number,
  },
  comment: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      text: String,
      created_at: { type: Date, default: Date.now },
    },
  ],
});

const Post = mongoose.model('Post', postSchema);

export default Post;
