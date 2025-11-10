const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  image: String,
  caption: String,
  hashtags: [String],
  likes: [mongoose.Schema.Types.ObjectId],
  comments: [{ userId: mongoose.Schema.Types.ObjectId, text: String }]
});

module.exports = mongoose.model('Post', postSchema);