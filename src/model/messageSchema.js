// models/messageSchema.js

import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  sender: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  roomId: {
    type: String, // Optional: if you have multiple chat rooms
  },
});

const Message = mongoose.model('Message', messageSchema);

export default Message;
