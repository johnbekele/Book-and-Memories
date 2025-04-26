// routes/messageRoutes.js

import express from 'express';
import messageController from '../../controllers/messageController.js';
import verifyJWT from '../../middleware/verifyJWT.js';

const router = express.Router();

// Create a new message
router.post('/', verifyJWT, async (req, res) => {
  try {
    const msgData = {
      text: req.body.text,
      userId: req.user.id,
      username: req.user.username,
      roomId: req.body.roomId, // Optional
    };

    const message = await messageController.createMessage(msgData);
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create message' });
  }
});

// Get recent messages
router.get('/recent', verifyJWT, async (req, res) => {
  try {
    const messages = await messageController.getRecentMessages();
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Get messages by room
router.get('/room/:roomId', verifyJWT, async (req, res) => {
  try {
    const messages = await messageController.getMessagesByRoom(
      req.params.roomId
    );
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch room messages' });
  }
});

export default router;
