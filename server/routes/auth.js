// routes/auth.js – PHIÊN BẢN HOÀN HẢO
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: './uploads/avatars/',
  filename: (req, file, cb) => {
    cb(null, `avatar-${req.user.userId}-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

// routes/auth.js – Trong phần register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'Email đã được sử dụng' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // TỰ ĐỘNG LÀ ADMIN NẾU EMAIL LÀ...
    const role = email === 'admin@minigram.com' ? 'admin' : 'user';

    const newUser = new User({ username, email, password: hashedPassword, role });
    await newUser.save();
    res.status(201).json({ msg: 'Đăng ký thành công!' });
  } catch (err) {
    console.error('Lỗi đăng ký:', err);
    res.status(500).json({ msg: 'Lỗi server' });
  }
});
// ĐĂNG NHẬP
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ msg: 'Email hoặc mật khẩu sai' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role || 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ msg: 'Lỗi server' });
  }
});

// UPLOAD AVATAR
router.post('/upload-avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.avatar = `/uploads/avatars/${req.file.filename}`;
    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi server' });
  }
});

// LẤY THÔNG TIN USER
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Lỗi server' });
  }
});

// TÌM KIẾM USER
router.get('/search', auth, async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) return res.json([]);
  try {
    const users = await User.find({
      username: { $regex: q, $options: 'i' }
    }).select('username _id avatar').limit(10);
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: 'Lỗi server' });
  }
});

// LẤY INFO USER THEO ID
router.get('/user/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Lỗi server' });
  }
});

module.exports = router;