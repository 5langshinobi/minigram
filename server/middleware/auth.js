// server/middleware/auth.js – PHIÊN BẢN HOÀN HẢO
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ msg: 'Không có token' });
  }

  let token = authHeader.trim();

  // HỖ TRỢ CẢ: Bearer xxx HOẶC xxx
  if (token.startsWith('Bearer ')) {
    token = token.slice(7).trim();
  }

  if (!token) {
    return res.status(401).json({ msg: 'Token không hợp lệ' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: decoded.userId };
    next();
  } catch (err) {
    console.error('Token error:', err.message);
    res.status(401).json({ msg: 'Token hết hạn hoặc không hợp lệ' });
  }
};