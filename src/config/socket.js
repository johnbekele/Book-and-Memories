import { Server } from 'socket.io';
import messageController from '../controllers/messageController.js';

const configureSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
    },
  });
  io.on('connection', (socket) => {
    console.log('A user connected');

    // Send message history when a user connects
    messageController
      .getRecentMessages()
      .then((messages) => socket.emit('message history', messages))
      .catch((err) => console.error('Error sending message history:', err));

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });

    socket.on('chat message', async (msgData) => {
      try {
        const savedMessage = await messageController.createMessage(msgData);
        io.emit('chat message', savedMessage);
      } catch (error) {
        console.error('Error handling message:', error);
        socket.emit('error', 'Failed to save message');
      }
    });
  });

  return io;
};

export default configureSocket;
