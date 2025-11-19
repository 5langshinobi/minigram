// server.js – PHIÊN BẢN HOÀN HẢO
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// === DEBUG: KIỂM TRA ENV ===
console.log('MONGO_URI:', process.env.MONGO_URI ? 'OK' : 'MISSING!');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'OK' : 'MISSING!');

// === MIDDLEWARE ===
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// === SERVING STATIC FILES ===
app.use('/uploads', express.static('uploads'));

// === ROUTES ===
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));

// === KẾT NỐI MONGODB ===
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// === PORT ===
const PORT = process.env.PORT || 5000;

// === KHỞI ĐỘNG SERVER ===
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Frontend: http://localhost:3000`);
  console.log(`Admin panel: http://localhost:3000/admin/posts`);
});