import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMessage } from '../components/Message';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');

  const { login, resendVerification } = useAuth();
  const { showMessage } = useMessage();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for success message from forgot password redirect
  useEffect(() => {
    if (location.state?.successMessage) {
      // Show message immediately
      setTimeout(() => {
        showMessage(location.state.successMessage, 'success');
      }, 100);
      
      if (location.state.email) {
        setFormData(prev => ({ ...prev, email: location.state.email }));
      }
      // Clear the state so message doesn't show on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location, showMessage]);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    if (token && user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/games');
      }
    }
  }, [navigate]);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!formData.email || !formData.password) {
      showMessage('Please fill in all fields.', 'warning');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showMessage('Please enter a valid email address.', 'warning');
      setLoading(false);
      return;
    }

    // Attempt login
    const result = await login(formData);
    // console.log('Login result:', result); // Debug log

    if (result.success) {
      showMessage('Login successful! Redirecting...', 'success');
      setTimeout(() => {
        if (result.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/games');
        }
      }, 1500);
    } else {
      // Handle different error scenarios
      if (result.needsVerification) {
        setUnverifiedEmail(formData.email);
        localStorage.setItem('verificationEmail', formData.email);
        showMessage('Please verify your email before logging in. Check your inbox for the verification link.', 'warning');
      } else if (result.error?.toLowerCase().includes('invalid credentials') || 
                 result.error?.toLowerCase().includes('invalid email or password')) {
        showMessage('Invalid email or password. Please try again.', 'error');
      } else if (result.error?.toLowerCase().includes('locked')) {
        showMessage('Account is locked. Too many failed attempts. Please try again later or reset your password.', 'error');
      } else {
        showMessage(result.error || 'Login failed. Please try again.', 'error');
      }
      
      // Clear password field on error
      setFormData(prev => ({ ...prev, password: '' }));
    }

    setLoading(false);
  };

  const handleResend = async () => {
    const email = localStorage.getItem('verificationEmail') || unverifiedEmail;
    if (!email) {
      showMessage('No email address found. Please try logging in again.', 'warning');
      return;
    }

    setResendTimer(60);
    
    try {
      const res = await resendVerification(email);
      if (res && res.success) {
        showMessage(`Verification email sent to ${email}. Please check your inbox.`, 'success');
      } else {
        showMessage(`If ${email} is registered, a verification email will be sent. Please check your inbox.`, 'info');
      }
    } catch (err) {
      // console.error('Resend error:', err);
      showMessage(`If ${email} is registered, a verification email will be sent. Please check your inbox.`, 'info');
      setResendTimer(0);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">Login to Star Games Hub</h2>

        <form onSubmit={handleSubmit}>
          <div className="login-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="star@gmail.com"
              disabled={loading}
            />
          </div>

          <div className="login-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          <div className="login-forgot">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>

          <button 
            type="submit" 
            className="login-btn" 
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="login-register">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;