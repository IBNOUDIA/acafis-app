require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const morgan    = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server }       = require('socket.io');

const connectDB = require('./config/db');
const routes    = require('./routes/index');

connectDB();

const app    = express();
const server = createServer(app);
const io     = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// ══ MIDDLEWARE ══
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: '*', credentials: false }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Rate limiting
const limiter     = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: 'Trop de requêtes, réessayez dans 15 minutes' });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10,  message: 'Trop de tentatives de connexion' });
app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);

// ══ ROUTES ══
app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({
    message: '🌿 API ACAFIS — Application de Gestion CA',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// ══ SOCKET.IO ══
io.on('connection', (socket) => {
  console.log(`🔌 Connecté : ${socket.id}`);
  socket.on('join_room', (room) => socket.join(room));
  socket.on('disconnect', () => console.log(`🔌 Déconnecté : ${socket.id}`));
});

app.set('io', io);

// ══ ERREURS ══
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} introuvable` });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erreur serveur interne',
  });
});

// ══ DÉMARRAGE ══
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 Serveur ACAFIS démarré`);
  console.log(`   Port : ${PORT}`);
  console.log(`   API  : http://localhost:${PORT}/api\n`);
});

module.exports = { app, io };