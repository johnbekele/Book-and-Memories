import { get } from 'mongoose';
import Message from '../model/messageSchema.js';

const createMessage = async (msgData) => {
  try {
    const message = new Message({
      content: msgData.text,
      sender: {
        _id: msgData.userId,
        username: msgData.username,
      },
      roomId: msgData.roomId, // Optional
    });

    await message.save();
    return message;
  } catch (error) {
    console.error('Error creating message:', error);
    throw error;
  }
};

// Get recent messages
const getRecentMessages = async (limit = 50) => {
  try {
    const messages = await Message.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return messages.reverse();
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

// Get messages by room
const getMessagesByRoom = async (roomId, limit = 50) => {
  try {
    const messages = await Message.find({ roomId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return messages.reverse();
  } catch (error) {
    console.error('Error fetching room messages:', error);
    throw error;
  }
};

export default { getMessagesByRoom, getRecentMessages, createMessage };
