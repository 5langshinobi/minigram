// src/pages/Profile.js – PHIÊN BẢN HOÀN HẢO + XEM PROFILE NGƯỜI KHÁC
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // THÊM useParams
import axios from 'axios';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const token = localStorage.getItem('token');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { id } = useParams(); // LẤY ID TỪ URL

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        // LẤY USER HIỆN TẠI
        const meRes = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: token }
        });
        const currentUserId = meRes.data._id;

        // QUYẾT ĐỊNH XEM PROFILE AI
        const targetId = id || currentUserId;
        setIsOwnProfile(targetId === currentUserId);

        // LẤY THÔNG TIN USER
        const userRes = await axios.get(`http://localhost:5000/api/auth/user/${targetId}`, {
          headers: { Authorization: token }
        });
        setUser(userRes.data);

        // LẤY BÀI VIẾT
        const postsRes = await axios.get(`http://localhost:5000/api/posts/user/${targetId}`, {
          headers: { Authorization: token }
        });
        setPosts(postsRes.data);
      } catch (err) {
        console.error('Lỗi:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    fetchProfile();
  }, [token, id, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && isOwnProfile) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
      uploadAvatar(file);
    }
  };

  const uploadAvatar = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/upload-avatar', formData, {
        headers: {
          Authorization: token,
          'Content-Type': 'multipart/form-data'
        }
      });
      setUser(res.data);
      setPreview(null);
      alert('Cập nhật ảnh đại diện thành công!');
    } catch (err) {
      alert('Lỗi khi cập nhật ảnh');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!token) return null;
  if (!user) return <div style={{ textAlign: 'center', padding: '50px' }}>Đang tải...</div>;

  const avatarUrl = user.avatar 
    ? `http://localhost:5000${user.avatar}` 
    : 'https://via.placeholder.com/120';

  return (
    <div style={{
      maxWidth: '600px',
      margin: '40px auto',
      padding: '30px',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* AVATAR */}
      <div style={{ textAlign: 'center', marginBottom: '20px', position: 'relative' }}>
        <div
          style={{
            width: '120px',
            height: '120px',
            backgroundImage: `url(${preview || avatarUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '50%',
            margin: '0 auto 15px',
            border: '4px solid #fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            cursor: isOwnProfile ? 'pointer' : 'default',
            position: 'relative',
            overflow: 'hidden'
          }}
          onClick={() => isOwnProfile && fileInputRef.current.click()}
        >
          {uploading && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px'
            }}>
              Đang tải...
            </div>
          )}
        </div>

        {isOwnProfile && (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        )}

        {isOwnProfile && (
          <p style={{ fontSize: '14px', color: '#888', marginTop: '8px' }}>
            Nhấn vào ảnh để thay đổi
          </p>
        )}
      </div>

      {/* THÔNG TIN */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: '600' }}>
          {user.username}
        </h2>
        <p style={{ color: '#666', margin: '0', fontSize: '15px' }}>
          {user.email}
        </p>
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
        <div>
          <strong style={{ fontSize: '18px', display: 'block' }}>{posts.length}</strong>
          <span style={{ color: '#666', fontSize: '14px' }}>Bài viết</span>
        </div>
        <div>
          <strong style={{ fontSize: '18px', display: 'block' }}>0</strong>
          <span style={{ color: '#666', fontSize: '14px' }}>Người theo dõi</span>
        </div>
        <div>
          <strong style={{ fontSize: '18px', display: 'block' }}>0</strong>
          <span style={{ color: '#666', fontSize: '14px' }}>Đang theo dõi</span>
        </div>
      </div>

      {/* NÚT ĐĂNG XUẤT – CHỈ HIỆN KHI LÀ PROFILE CÁ NHÂN */}
      {isOwnProfile && (
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '14px',
            background: 'linear-gradient(135deg, #e91e63, #00bcd4)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px',
            transition: 'all 0.3s ease',
            boxShadow: '0 6px 15px rgba(0,188,212,0.3)'
          }}
          onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
        >
          Đăng xuất
        </button>
      )}
    </div>
  );
}