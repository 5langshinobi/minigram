const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Post = require('../models/Post');
const multer = require('multer');
const path = require('path');

// Cấu hình upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Tạo bài đăng
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { caption, hashtags } = req.body;
    const post = new Post({
      userId: req.user.userId,
      image: `/uploads/${req.file.filename}`,
      caption,
      hashtags: hashtags ? hashtags.split(',') : []
    });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lấy feed
router.get('/feed', auth, async (req, res) => {
  try {
    const posts = await Post.find().populate('userId', 'username profilePic').sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Like
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Bài đăng không tồn tại' });

    const userIndex = post.likes.indexOf(req.user.userId);
    if (userIndex === -1) {
      post.likes.push(req.user.userId);
    } else {
      post.likes.splice(userIndex, 1);
    }
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bình luận
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Bài đăng không tồn tại' });

    post.comments.push({
      userId: req.user.userId,
      text
    });
    await post.save();
    const populatedPost = await Post.findById(req.params.id).populate('comments.userId', 'username');
    res.json(populatedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lấy bài của 1 user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId })
      .populate('userId', 'username')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === CHỈ GIỮ 1 BỘ ADMIN ROUTES ===

// LẤY TẤT CẢ BÀI VIẾT CHO ADMIN
router.get('/admin/all', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

  try {
    const posts = await Post.find()
      .populate('userId', 'username') // ĐÃ CÓ
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// XÓA BÀI CHO ADMIN
router.delete('/admin/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SỬA BÀI ĐĂNG (ADMIN)
router.put('/admin/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

  try {
    const { caption } = req.body;
    const post = await Post.findByIdAndUpdate(req.params.id, { caption }, { new: true });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;