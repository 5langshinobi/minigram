// src/components/Navbar.js – PHIÊN BẢN HOÀN HẢO
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);
  const token = localStorage.getItem('token');
  const [user, setUser] = useState(null);

  const searchCache = useRef(new Map());
  const debounceTimeout = useRef(null);

  useEffect(() => {
    setIsLoggedIn(!!token);
  }, [location, token]);

  // src/components/Navbar.js – THÊM useEffect + fetchUser
useEffect(() => {
  const fetchUser = async () => {
    if (token) {
      try {
        const res = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: token }
        });
        setUser(res.data); // CẬP NHẬT user.role
      } catch (err) {
        console.error('Lỗi lấy user:', err);
      }
    } else {
      setUser(null);
    }
  };
  fetchUser();
}, [token]); // CHẠY KHI token THAY ĐỔI

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      setLoading(false);
      return;
    }

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    setLoading(true);
    debounceTimeout.current = setTimeout(async () => {
      if (searchCache.current.has(searchQuery)) {
        setSearchResults(searchCache.current.get(searchQuery));
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`http://localhost:5000/api/auth/search?q=${encodeURIComponent(searchQuery)}`, {
          headers: { Authorization: token }
        });
        searchCache.current.set(searchQuery, res.data);
        setSearchResults(res.data);
      } catch (err) {
        console.error('Search error:', err);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [searchQuery, token]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUser(null);
    navigate('/');
  };

  const goToProfile = (userId) => {
    setSearchQuery('');
    setShowResults(false);
    navigate(`/profile/${userId}`);
  };

  return (
    <nav style={{
      background: 'linear-gradient(135deg, #e91e63, #00bcd4)',
      padding: '16px 20px',
      boxShadow: '0 6px 20px rgba(0,188,212,0.2)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h1 style={{
            color: 'white',
            fontSize: '26px',
            fontWeight: 'bold',
            margin: 0
          }}>
            MiniGram
          </h1>
        </Link>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {isLoggedIn && (
            <div ref={searchRef} style={{ position: 'relative', zIndex: 9999 }}>
              <input
                type="text"
                placeholder="Tìm kiếm người dùng..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                style={{
                  padding: '10px 16px 10px 40px',
                  borderRadius: '12px',
                  border: 'none',
                  width: '240px',
                  fontSize: '15px',
                  outline: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  background: 'white url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2716%27 height=%2716%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23666%27 strokeWidth=%272%27 strokeLinecap=%27round%27 strokeLinejoin=%27round%27%3E%3Ccircle cx=%2711%27 cy=%2711%27 r=%278%27/%3E%3Cline x1=%2721%27 y1=%2721%27 x2=%2716.65%27 y2=%2716.65%27/%3E%3C/svg%3E") no-repeat 14px center',
                  backgroundSize: '16px'
                }}
              />

              {showResults && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'white',
                  borderRadius: '12px',
                  marginTop: '8px',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.2)',
                  maxHeight: '320px',
                  overflowY: 'auto',
                  zIndex: 10000,
                  border: '1px solid #eee'
                }}>
                  {loading && (
                    <div style={{ padding: '16px', textAlign: 'center', color: '#666' }}>
                      Đang tìm...
                    </div>
                  )}

                  {!loading && searchResults.length > 0 && searchResults.map(user => (
                    <div
                      key={user._id}
                      onClick={() => goToProfile(user._id)}
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        borderBottom: '1px solid #f0f0f0'
                      }}
                      onMouseEnter={e => e.target.style.background = '#f8f9fa'}
                      onMouseLeave={e => e.target.style.background = 'white'}
                    >
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundImage: user.avatar 
                          ? `ur[](http://localhost:5000${user.avatar})` 
                          : 'ur[](https://via.placeholder.com/40)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}></div>
                      <div>
                        <div style={{ fontWeight: '600' }}>{user.username}</div>
                        <div style={{ fontSize: '13px', color: '#888' }}>Người dùng</div>
                      </div>
                    </div>
                  ))}

                  {!loading && searchQuery.length >= 2 && searchResults.length === 0 && (
                    <div style={{ padding: '16px', textAlign: 'center', color: '#999' }}>
                      Không tìm thấy người dùng
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {isLoggedIn ? (
            <>
              <Link to="/feed" style={navLinkStyle}
                onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.2)'; e.target.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.transform = 'translateY(0)'; }}>
                Feed
              </Link>

              <Link to="/profile" style={navLinkStyle}
                onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.2)'; e.target.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.transform = 'translateY(0)'; }}>
                Profile
              </Link>

              {user?.role === 'admin' && (
                <Link 
                  to="/admin/posts"
                  style={{
                    ...navLinkStyle,
                    background: 'rgba(255,255,255,0.25)',
                    fontWeight: 'bold'
                  }}
                  onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.35)'; }}
                  onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.25)'; }}
                >
                  Admin Posts
                </Link>
              )}

              <button 
                onClick={handleLogout}
                style={logoutBtnStyle}
                onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.25)'; e.target.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.15)'; e.target.style.transform = 'translateY(0)'; }}
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={navLinkStyle}
                onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.2)'; e.target.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.transform = 'translateY(0)'; }}>
                Đăng nhập
              </Link>

              <Link to="/register" style={navLinkStyle}
                onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.2)'; e.target.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.transform = 'translateY(0)'; }}>
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

const navLinkStyle = {
  color: 'white',
  textDecoration: 'none',
  fontWeight: '600',
  fontSize: '16px',
  padding: '10px 18px',
  borderRadius: '12px',
  transition: 'all 0.3s ease'
};

const logoutBtnStyle = {
  ...navLinkStyle,
  background: 'rgba(255,255,255,0.15)',
  border: 'none',
  cursor: 'pointer',
  fontWeight: 'bold'
};