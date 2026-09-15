import http from 'http';
import app from './src/app.js';
import { initSocket } from './src/sockets/socket.js';

const PORT = process.env.PORT || 3000;

// Không dùng app.listen() trực tiếp nữa — cần tạo httpServer thủ công
// để Socket.io có thể gắn vào CHUNG 1 port với Express
const httpServer = http.createServer(app);

// Khởi tạo Socket.io, gắn vào httpServer
initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`✅ Server (Express + Socket.io) đang chạy tại http://localhost:${PORT}`);
});
