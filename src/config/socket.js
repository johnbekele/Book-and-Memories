import { Server } from 'socket.io';

const configureSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.PROD_FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
    },
  });
  io.on('connection', (socket) => {
    console.log('A user connected');
  });

  // Socket.io connection
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a chat room
    socket.on('joinRoom', (chatId) => {
      socket.join(chatId);
      console.log(`User ${socket.id} joined chat ${chatId}`);
    });

    // Listen for new messages
    socket.on('sendMessage', (data) => {
      const { chatId, message } = data;
      // Emit message to all users in the room (except sender)
      socket.to(chatId).emit('receiveMessage', message);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

export default configureSocket;
