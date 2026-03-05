// Footer.jsx - Simple Version
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="gv-footer">
      <div className="gv-footer-container">
        
        {/* Main Footer Grid */}
        <div className="gv-footer-grid">
          
          {/* Brand */}
          <div className="gv-footer-brand">
            <div className="gv-logo">
              <span className="gv-logo-icon">🎮</span>
              <span className="gv-logo-text">Star Games Gub</span>
            </div>
            <p className="gv-brand-description">
              Your ultimate gaming destination. Play anywhere, anytime.
            </p>
          </div>

          {/* Quick Links */}
          <div className="gv-footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/games">Games</Link></li>
              <li><Link to="/games">Categories</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="gv-footer-links">
            <h4>Legal</h4>
            <ul>
              <li><Link to="#">Terms</Link></li>
              <li><Link to="#">Privacy</Link></li>
              <li><Link to="#">Cookies</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div className="gv-footer-links">
            <h4>Connect</h4>
            <div className="gv-social-links">
              <a href="#" aria-label="Discord">💬</a>
              <a href="#" aria-label="Facebook">📘</a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="gv-footer-bottom">
          <p>© {currentYear} Star Games Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;