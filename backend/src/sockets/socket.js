import { Server } from 'socket.io';

let io;

// Gọi 1 lần duy nhất khi khởi động server (trong server.js)
const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*', // dự án thật nên giới hạn đúng domain frontend, không để '*'
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Client báo cho server biết mình đang xem project nào
    // Frontend gọi: socket.emit('joinProject', projectId)
    socket.on('joinProject', (projectId) => {
      socket.join(`project-${projectId}`);
      console.log(`Socket ${socket.id} joined room project-${projectId}`);
    });

    // Client rời khỏi project (VD: chuyển sang xem project khác)
    socket.on('leaveProject', (projectId) => {
      socket.leave(`project-${projectId}`);
      console.log(`Socket ${socket.id} left room project-${projectId}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

// Các service khác import hàm này để bắn event, không cần import trực tiếp `io`
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io chưa được khởi tạo. Gọi initSocket(server) trước.');
  }
  return io;
};

export { getIO, initSocket };
