import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function UserProfile() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy info user
        const userRes = await axios.get(`http://localhost:5000/api/auth/user/${userId}`, {
          headers: { Authorization: token }
        });
        setUser(userRes.data);

        // Lấy bài đăng
        const postRes = await axios.get(`http://localhost:5000/api/posts/user/${userId}`, {
          headers: { Authorization: token }
        });
        setPosts(postRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token && userId) fetchData();
  }, [userId, token]);

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Đang tải...</div>;
  if (!user) return <div style={{ textAlign: 'center', padding: '50px' }}>Không tìm thấy người dùng</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{
          width: '100px',
          height: '100px',
          background: '#ddd',
          borderRadius: '50%',
          margin: '0 auto 15px',
          backgroundImage: 'ur[](https://via.placeholder.com/100)',
          backgroundSize: 'cover'
        }}></div>
        <h2 style={{ margin: '0 0 8px', fontSize: '24px' }}>{user.username}</h2>
        <p style={{ color: '#666', margin: 0 }}>{user.email}</p>
      </div>

      {/* THỐNG KÊ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        textAlign: 'center',
        margin: '25px 0',
        padding: '15px 0',
        background: '#f8f9fa',
        borderRadius: '12px'
      }}>
        <div><strong>{posts.length}</strong><br /><small>Bài viết</small></div>
        <div><strong>0</strong><br /><small>Theo dõi</small></div>
        <div><strong>0</strong><br /><small>Được theo dõi</small></div>
      </div>

      {/* BÀI ĐĂNG */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '4px'
      }}>
        {posts.map(post => (
          <div key={post._id} style={{
            aspectRatio: '1',
            background: `ur[](http://localhost:5000${post.image}) center/cover`,
            borderRadius: '8px'
          }}></div>
        ))}
        {posts.length === 0 && (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#999', marginTop: '20px' }}>
            Chưa có bài viết nào
          </p>
        )}
      </div>

      <Link to="/feed" style={{
        display: 'block',
        textAlign: 'center',
        marginTop: '30px',
        color: '#00bcd4',
        textDecoration: 'none',
        fontWeight: '600'
      }}>
        Quay lại Feed
      </Link>
    </div>
  );
}