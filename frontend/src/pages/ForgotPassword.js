import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMessage } from '../components/Message';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { forgotPassword } = useAuth();
  const { showMessage } = useMessage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email) {
      showMessage('Please enter your email', 'warning');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showMessage('Please enter a valid email address', 'warning');
      setLoading(false);
      return;
    }

    const result = await forgotPassword(email);
    
    if (result.success) {
      // Redirect to login with success message in state
      navigate('/login', { 
        state: { 
          successMessage: `Password reset email sent to ${email}. Please check your inbox.`,
          email: email 
        } 
      });
    } else {
      showMessage(result.error || 'Failed to send reset email. Please try again.', 'error');
    }
    
    setLoading(false);
  };

  return (
    <div className="gv-forgot-container">
      <div className="gv-forgot-card">
        <h2 className="gv-forgot-title">Forgot Password</h2>
        
        <p className="gv-forgot-subtitle">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="gv-form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="star@gmail.com"
              disabled={loading}
              className={email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'gv-error' : ''}
            />
            {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
              <div className="gv-validation-hint gv-invalid">
                <span className="gv-req-icon">⚠️</span>
                Please enter a valid email address
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className={`gv-forgot-btn ${loading ? 'gv-loading' : ''}`} 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="gv-spinner"></span>
                Sending...
              </>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        <div className="gv-forgot-links">
          <Link to="/login" className="gv-back-link">
            ← Back to Login
          </Link>
          <Link to="/register" className="gv-register-link">
            Don't have an account? Register
          </Link>
        </div>

        <div className="gv-forgot-help">
          <hr className="gv-divider" />
          <p className="gv-help-text">
            <strong>Note:</strong> If the email is registered in our system, 
            you will receive a password reset link. Check your spam folder if you don't see it.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;