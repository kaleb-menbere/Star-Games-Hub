// Footer.jsx - Updated with logo image
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
              <img 
                src="/logo-star.jpeg" 
                alt="Star Games Hub Logo" 
                className="gv-logo-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  // Show fallback text if image fails to load
                  e.target.parentElement.classList.add('gv-logo-fallback');
                }}
              />
              <span className="gv-logo-text">Star Games Hub</span>
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
              <li><Link to="/profile">Profile</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="gv-footer-links">
            <h4>Support</h4>
            <ul>
              <li>
                <a href="tel:+251944878463" className="gv-phone-link">
                  <span className="gv-phone-icon">📞</span>
                  +251 944 878 463
                </a>
              </li>
              <li>
                <span className="gv-support-hours">24/7 Support Available</span>
              </li>
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