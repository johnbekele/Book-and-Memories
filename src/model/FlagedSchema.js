import mongoose from 'mongoose';

const FlagedSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  postid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  comment: {
    type: String,
    required: true,
  },
});

const Flaged = mongoose.model('Flaged', FlagedSchema);

export default Flaged;
