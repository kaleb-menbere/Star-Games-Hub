import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Get current location
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const hamburgerRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  // Helper function to check if link is active
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  // Close menu when window is resized to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && menuOpen) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [menuOpen]);

  // Close menu when route changes (mobile)
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  return (
    <nav className="gc-navbar">
      <div className="gc-nav-container">
        <Link to="/" className="gc-logo" onClick={() => setMenuOpen(false)}>
          <img 
            src="/logo-star.jpeg" 
            alt="Star Games Hub Logo" 
            className="gc-logo-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              // Show fallback emoji if image fails to load
              e.target.parentElement.classList.add('gc-logo-fallback');
            }}
          />
          <span className="gc-logo-text">Star Games Hub</span>
        </Link>

        {/* Hamburger Button */}
        <button
          ref={hamburgerRef}
          className={`gc-hamburger ${menuOpen ? 'active' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation Menu */}
        <div ref={menuRef} className={`gc-menu ${menuOpen ? 'open' : ''}`}>
          <Link 
            to="/" 
            className={`gc-link ${isActive('/') && location.pathname === '/' ? 'active' : ''}`} 
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>

          {user ? (
            <>
              <Link 
                to="/games" 
                className={`gc-link ${isActive('/games') ? 'active' : ''}`} 
                onClick={() => setMenuOpen(false)}
              >
                Games
              </Link>

              <Link 
                to="/profile" 
                className={`gc-link ${isActive('/profile') ? 'active' : ''}`} 
                onClick={() => setMenuOpen(false)}
              >
                Profile
              </Link>

              {/* Admin-Only Links */}
              {user.role === "admin" && (
                <>
                  <Link 
                    to="/admin" 
                    className={`gc-link gc-admin ${isActive('/admin') ? 'active' : ''}`} 
                    onClick={() => setMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                </>
              )}

              <span className="gc-user">
                👤 {user.username || user.email?.split('@')[0] || 'Player'}
              </span>
              
              <button onClick={handleLogout} className="gc-link gc-logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className={`gc-link ${isActive('/login') ? 'active' : ''}`} 
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className={`gc-link gc-register ${isActive('/register') ? 'active' : ''}`} 
                onClick={() => setMenuOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;