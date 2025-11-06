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

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  const color = socket.handshake.auth?.color || '#ffffff';  // Recibe el color desde el cliente
  if (!token) return next(new Error('Token requerido'));

  const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
  socket.user = payload;
  socket.user.color = color;  // Guardamos el color en la sesión del socket
  next();
});


// Paleta de colores predefinida
const colors = [
  '#1E90FF', '#32CD32', '#FF6347', '#FFD700',
  '#FF69B4', '#00CED1', '#ADFF2F', '#FF4500',
  '#8A2BE2', '#FF8C00', '#40E0D0', '#DC143C'
];

// Asignar color a cada usuario conectado
const userColors = {};

io.on('connection', (socket) => {
  const { username, color } = socket.user;
  console.log(`🎨 ${username} conectado con color ${color}`);

  io.emit('chat:system', `${username} se ha conectado`);

  socket.on('chat:message', (msg) => {
    io.emit('chat:message', {
      user: username,
      color,
      text: msg,
      ts: Date.now(),
    });
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



