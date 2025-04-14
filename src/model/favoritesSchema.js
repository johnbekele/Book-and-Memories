import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  bookid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  postid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },

  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  seenAt: { type: Date, default: null },
});

export default mongoose.models.favorite ||
  mongoose.model('Favorite', favoriteSchema);
