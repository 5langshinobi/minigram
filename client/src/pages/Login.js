// src/pages/Login.js – PHIÊN BẢN NÂNG CẤP NHỎ
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // THÊM LOADING
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email: email.trim(),
        password,
      });

      const token = res.data.token;
      localStorage.setItem('token', token);
      // KÍCH HOẠT SỰ KIỆN ĐỂ App.js CẬP NHẬT
    window.dispatchEvent(new Event('storage'));
      navigate('/feed', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.msg || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '400px',
      margin: '60px auto',
      padding: '30px',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 10px 30px rgba(233, 30, 99, 0.15)',
      textAlign: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <h2 style={{ 
        color: '#e91e63', 
        marginBottom: '20px',
        fontSize: '28px',
        fontWeight: 'bold'
      }}>
        MiniGram
      </h2>
      
      {error && (
        <p style={{ 
          color: '#d32f2f', 
          background: '#ffebee', 
          padding: '10px', 
          borderRadius: '8px', 
          marginBottom: '15px',
          fontSize: '14px'
        }}>
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          required
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
          required
          disabled={loading}
        />
        <button 
          type="submit" 
          style={{
            ...btnPrimary,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
          disabled={loading}
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
        </button>
      </form>

      <p style={{ marginTop: '20px', color: '#666', fontSize: '14px' }}>
        Chưa có tài khoản?{' '}
        <a href="/register" style={{ color: '#e91e63', fontWeight: 'bold', textDecoration: 'none' }}>
          Đăng ký
        </a>
      </p>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '14px',
  margin: '10px 0',
  border: '2px solid #f8bbd0',
  borderRadius: '12px',
  fontSize: '16px',
  outline: 'none',
  transition: 'border 0.3s',
  ':focus': { borderColor: '#e91e63' }
};

const btnPrimary = {
  width: '100%',
  padding: '14px',
  background: '#e91e63',
  color: 'white',
  border: 'none',
  borderRadius: '12px',
  fontSize: '18px',
  fontWeight: 'bold',
  cursor: 'pointer',
  marginTop: '10px',
  transition: 'all 0.3s'
};