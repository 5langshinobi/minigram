import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PostForm from '../components/PostForm';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserId(payload.userId);
      } catch (err) {
        console.error('Token lỗi:', err);
      }
    }
  }, [token]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/posts/feed', {
          headers: { Authorization: token }
        });
        setPosts(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    if (token) fetchPosts();
  }, [token]);

  const handleLike = async (postId) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/posts/${postId}/like`,
        {},
        { headers: { Authorization: token } }
      );
      setPosts(posts.map(p => (p._id === postId ? res.data : p)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (e, postId) => {
    e.preventDefault();
    const text = commentInputs[postId];
    if (!text?.trim()) return;
    try {
      const res = await axios.post(
        `http://localhost:5000/api/posts/${postId}/comment`,
        { text },
        { headers: { Authorization: token } }
      );
      setPosts(posts.map(p => (p._id === postId ? res.data : p)));
      setCommentInputs({ ...commentInputs, [postId]: '' });
    } catch (err) {
      console.error(err);
    }
  };

  if (!token)
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        Vui lòng <a href="/login">đăng nhập</a>
      </div>
    );

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '0 20px' }}>
      <PostForm onPost={(newPost) => setPosts([newPost, ...posts])} />
      <h2 style={{ textAlign: 'center', color: '#e91e63' }}>Feed</h2>

      {loading ? (
        <p>Đang tải...</p>
      ) : posts.length === 0 ? (
        <p>Chưa có bài đăng nào.</p>
      ) : (
        posts.map(post => (
          <div
  key={post._id}
  style={{
    background: 'white',
    borderRadius: '16px',
    marginBottom: '20px',
    boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    border: '2px solid transparent',
    backgroundClip: 'padding-box',
    position: 'relative',
    transition: 'all 0.4s ease'
  }}
  onMouseEnter={e => {
    e.currentTarget.style.transform = 'translateY(-8px)';
    e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,188,212,0.3)';
    e.currentTarget.style.borderImage = 'linear-gradient(135deg, #e91e63, #00bcd4) 1';
  }}
  onMouseLeave={e => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
    e.currentTarget.style.borderImage = 'none';
  }}
>
            <div style={{ padding: '12px', display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  background: '#ddd',
                  borderRadius: '50%',
                  marginRight: '10px'
                }}
              ></div>
              <strong>{post.userId?.username || 'Người dùng'}</strong>
            </div>

            <img
              src={`http://localhost:5000${post.image}`}
              alt="post"
              style={{ width: '100%', display: 'block' }}
            />

            <div style={{ padding: '12px' }}>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
                <button
                  onClick={() => handleLike(post._id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer'
                  }}
                >
                  {post.likes.includes(userId) ? 'Heart' : 'Heart Outline'} {post.likes.length}
                </button>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer'
                  }}
                >
                  Comment {post.comments.length}
                </button>
              </div>

              <p>
                <strong>{post.userId?.username}</strong> {post.caption}
              </p>

              {post.comments.map((c, i) => (
                <p key={i} style={{ margin: '5px 0', fontSize: '14px' }}>
                  <strong>{c.userId?.username}</strong> {c.text}
                </p>
              ))}

              <form
                onSubmit={(e) => handleComment(e, post._id)}
                style={{ display: 'flex', marginTop: '10px' }}
              >
                <input
                  placeholder="Thêm bình luận..."
                  value={commentInputs[post._id] || ''}
                  onChange={(e) =>
                    setCommentInputs({ ...commentInputs, [post._id]: e.target.value })
                  }
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid #ddd'
                  }}
                />
<button
  type="submit"
  style={{
    marginLeft: '5px',
    padding: '8px 14px',
    background: 'linear-gradient(135deg, #e91e63, #00bcd4)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 10px rgba(0,188,212,0.3)'
  }}
  onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
  onMouseLeave={e => e.target.style.transform = 'scale(1)'}
>
  Gửi
</button>
              </form>
            </div>
          </div>
        ))
      )}
    </div>
  );
}