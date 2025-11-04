import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';

import { config } from './config.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

// 🧭 Obtener __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: config.clientUrl, methods: ['GET', 'POST'] }
});

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Permitir inline scripts y cargar el script de Socket.IO desde la CDN
app.use(helmet.contentSecurityPolicy({
  directives: {
    scriptSrc: [
      "'self'", 
      "'unsafe-inline'", 
      'https://cdn.socket.io' // Permitir Socket.IO desde la CDN
    ],
    styleSrc: ["'self'", "'unsafe-inline'"], // Permitir estilos inline
    connectSrc: ["'self'", 'https://cdn.socket.io'] // Permitir conexión a la CDN para los source maps
  }
}));

// 📂 Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Servir index.html en la raíz
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/chat', chatRoutes);

// Socket.IO Auth por JWT (en handshake.query o handshake.auth)
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('Token requerido'));
    const payload = jwt.verify(token, config.jwtSecret);
    socket.user = payload; // { id, username, role }
    next();
  } catch (err) {
    next(new Error('Token inválido'));
  }
});

io.on('connection', (socket) => {
  const { username } = socket.user;
  console.log(`🔌 Usuario conectado: ${username}`);

  io.emit('chat:system', `${username} se ha conectado`);

  socket.on('chat:message', (msg) => {
    io.emit('chat:message', { user: username, text: msg, ts: Date.now() });
  });

  socket.on('disconnect', () => {
    io.emit('chat:system', `${username} se ha desconectado`);
  });
});

// Conexión a MongoDB
(async () => {
  try {
    console.log('Conectando a MongoDB ->', config.mongodbUri);
    await mongoose.connect(config.mongodbUri);
    console.log('✅ Conectado a MongoDB');
    server.listen(config.port, () => {
      console.log(`🚀 Servidor escuchando en http://localhost:${config.port}`);
    });
  } catch (err) {
    console.error('❌ Error conectando a MongoDB', err);
    process.exit(1);
  }
})();



