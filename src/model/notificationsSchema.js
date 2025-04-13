import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['user', 'moderator', 'system'],
    required: true,
  },
  category: {
    type: String,
    enum: ['comment', 'flag', 'ban', 'update', 'reply', 'like', 'other'],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },

  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },

  relatedResource: {
    type: {
      type: String, // "comment", "post", "report", etc.
      required: false,
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
  },

  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  seenAt: { type: Date, default: null },
});

export default mongoose.models.Notification ||
  mongoose.model('Notification', notificationSchema);
