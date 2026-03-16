const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketio = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketio(server, { cors: { origin: '*' } });

// ===== SECURITY =====
app.use(helmet({ contentSecurityPolicy: false }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.'
});
app.use('/api/', limiter);

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===== DATABASE =====
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected!'))
  .catch((err) => console.log('❌ MongoDB Error:', err));

// ===== SOCKET.IO =====
io.on('connection', (socket) => {
  console.log('🔌 New connection:', socket.id);
  socket.on('join_order', (orderId) => {
    socket.join(orderId);
    console.log(`📦 Joined order room: ${orderId}`);
  });
  socket.on('update_location', (data) => {
    io.to(data.orderId).emit('location_update', data);
  });
  socket.on('update_order_status', (data) => {
    io.to(data.orderId).emit('order_status_update', data);
  });
  socket.on('disconnect', () => {
    console.log('🔌 Disconnected:', socket.id);
  });
});

app.set('io', io);

// ===== ROUTES =====
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/delivery', require('./routes/deliveryRoutes'));
app.use('/api/seller', require('./routes/sellerRoutes'));
app.use('/api/hiring', require('./routes/hiringRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

// ===== PAGE ROUTES =====
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/shop', (req, res) => res.sendFile(path.join(__dirname, 'public', 'shop.html')));
app.get('/product', (req, res) => res.sendFile(path.join(__dirname, 'public', 'product.html')));
app.get('/checkout', (req, res) => res.sendFile(path.join(__dirname, 'public', 'checkout.html')));
app.get('/tracking', (req, res) => res.sendFile(path.join(__dirname, 'public', 'tracking.html')));
app.get('/profile', (req, res) => res.sendFile(path.join(__dirname, 'public', 'profile.html')));
app.get('/location', (req, res) => res.sendFile(path.join(__dirname, 'public', 'location.html')));
app.get('/food', (req, res) => res.sendFile(path.join(__dirname, 'public', 'food.html')));
app.get('/hiring', (req, res) => res.sendFile(path.join(__dirname, 'public', 'hiring.html')));
app.get('/seller', (req, res) => res.sendFile(path.join(__dirname, 'public', 'seller.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/delivery', (req, res) => res.sendFile(path.join(__dirname, 'public', 'delivery.html')));

// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 BrewDash running on http://localhost:${PORT}`);
  console.log(`👑 Admin panel: http://localhost:${PORT}/admin`);
});

