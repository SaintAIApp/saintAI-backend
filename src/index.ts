import app from './app';
import dotenv from 'dotenv';
import { mongoConnect } from './config/mongo.connect';
import { startCronJobs } from './cron';
import { createServer } from 'http'; // Hanya import createServer
import { Server } from 'socket.io';  // Import Server dari socket.io
import { chatSocket } from './controllers/chat'; // Chat socket handler

dotenv.config();

// Buat HTTP server dari Express app
const server = createServer(app);

// Integrasi Socket.IO dengan HTTP server
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
});

// Jalankan fungsi chatSocket untuk menangani event khusus
chatSocket(io);

// Connect to MongoDB
mongoConnect(process.env.MONGO_URI!);

// Port
const PORT = process.env.PORT || 5000;

// Start Cron Jobs
startCronJobs();

// Jalankan server menggunakan `server.listen`, bukan `app.listen`
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} | Environment: ${process.env.NODE_ENV}`);
});
