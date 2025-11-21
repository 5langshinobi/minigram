// client/src/pages/AdminPosts.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPost, setEditingPost] = useState(null);
  const [editCaption, setEditCaption] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/posts/admin/all', {
          headers: { Authorization: token }
        });
        setPosts(res.data);
      } catch (err) {
        alert('Lỗi: ' + (err.response?.data?.error || 'Không có quyền'));
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchPosts();
  }, [token]);

  const handleDelete = async (id) => {
    if (window.confirm('Xóa bài này?')) {
      try {
        await axios.delete(`http://localhost:5000/api/posts/admin/${id}`, {
          headers: { Authorization: token }
        });
        setPosts(posts.filter(p => p._id !== id));
        alert('Xóa thành công!');
      } catch (err) {
        alert('Lỗi xóa: ' + (err.response?.data?.error || 'Server error'));
      }
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setEditCaption(post.caption);
  };

  const handleUpdate = async () => {
    try {
      const res = await axios.put(`http://localhost:5000/api/posts/admin/${editingPost._id}`, {
        caption: editCaption
      }, {
        headers: { Authorization: token }
      });
      setPosts(posts.map(p => p._id === editingPost._id ? res.data : p));
      setEditingPost(null);
      alert('Cập nhật thành công!');
    } catch (err) {
      alert('Lỗi cập nhật: ' + (err.response?.data?.error || 'Server error'));
    }
  };

  const filteredPosts = posts.filter(post => 
    post.caption.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (post.userId?.username || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Đang tải...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#e91e63', marginBottom: '20px' }}>
        QUẢN LÝ BÀI VIẾT (ADMIN)
      </h1>

      <input
        type="text"
        placeholder="Tìm theo caption hoặc username..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          width: '100%',
          padding: '12px',
          marginBottom: '20px',
          borderRadius: '8px',
          border: '1px solid #ddd',
          fontSize: '16px'
        }}
      />

      {filteredPosts.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#999' }}>Không có bài viết nào.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f0f0f0' }}>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>User</th>
              <th style={thStyle}>Caption</th>
              <th style={thStyle}>Likes</th>
              <th style={thStyle}>Comments</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredPosts.map(post => (
              <tr key={post._id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={tdStyle}>{post._id.substring(0, 8)}...</td>
                <td style={tdStyle}>
                  <strong>{post.userId?.username || 'Unknown'}</strong>
                </td>
                <td style={tdStyle}>
                  {editingPost?._id === post._id ? (
                    <input
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  ) : (
                    post.caption
                  )}
                </td>
                <td style={tdStyle}>{post.likes?.length || 0}</td>
                <td style={tdStyle}>{post.comments?.length || 0}</td>
                <td style={tdStyle}>
                  {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td style={tdStyle}>
                  {editingPost?._id === post._id ? (
                    <>
                      <button onClick={handleUpdate} style={btnSuccess}>Lưu</button>
                      <button onClick={() => setEditingPost(null)} style={btnWarning}>Hủy</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(post)} style={btnEdit}>Sửa</button>
                      <button onClick={() => handleDelete(post._id)} style={btnDelete}>Xóa</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// Style
const thStyle = { padding: '12px', border: '1px solid #ddd', textAlign: 'left', fontWeight: 'bold' };
const tdStyle = { padding: '12px', border: '1px solid #ddd' };
const btnEdit = { marginRight: '5px', background: '#2196f3', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' };
const btnDelete = { background: '#f44336', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' };
const btnSuccess = { marginRight: '5px', background: '#4caf50', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' };
const btnWarning = { background: '#ff9800', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' };