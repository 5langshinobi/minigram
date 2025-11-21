import React, { useState } from 'react';
import axios from 'axios';

export default function PostForm({ onPost }) {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return alert('Vui lòng chọn ảnh');

    setUploading(true);
    const formData = new FormData();
    formData.append('image', image);
    formData.append('caption', caption);

    try {
      const res = await axios.post('http://localhost:5000/api/posts', formData, {
        headers: { 
          'Authorization': token,
          'Content-Type': 'multipart/form-data'
        }
      });
      onPost(res.data);
      setCaption('');
      setImage(null);
      alert('Đăng bài thành công!');
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{
      background: 'white',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      marginBottom: '20px'
    }}>
      <textarea
        placeholder="Viết gì đó cho bài đăng của bạn..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid #ddd',
          marginBottom: '10px',
          minHeight: '80px',
          fontSize: '16px'
        }}
      />
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input 
          type="file" 
          accept="image/*" 
          onChange={(e) => setImage(e.target.files[0])}
          style={{ flex: 1 }}
        />
        <button 
          type="submit" 
          disabled={uploading}
         style={{
    marginTop: '10px',
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #e91e63, #00bcd4)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 6px 15px rgba(0,188,212,0.4)'
  }}
  onMouseEnter={e => e.target.style.transform = 'translateY(-3px)'}
  onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
>
  Đăng bài
</button>
      </div>
    </form>
  );
}