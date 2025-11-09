const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Post = require('../models/Post');

router.get('/', auth, async (req, res) => {
  const posts = await Post.find();
  res.json(posts);
});

router.post('/', auth, async (req, res) => {
  const post = new Post(req.body);
  await post.save();
  res.json(post);
});

// Like, comment, etc. thêm sau
module.exports = router;