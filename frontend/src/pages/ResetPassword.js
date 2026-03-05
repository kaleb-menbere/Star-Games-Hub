import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMessage } from '../components/Message';
import './ResetPassword.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false
  });
  
  const { resetPassword } = useAuth();
  const { showMessage } = useMessage();

  // Password strength checker
  const checkPasswordStrength = (pwd) => {
    if (!pwd) return '';
    if (pwd.length < 6) return 'weak';
    if (pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) {
      return 'strong';
    }
    if (pwd.length >= 6 && (/[A-Z]/.test(pwd) || /[0-9]/.test(pwd))) {
      return 'medium';
    }
    return 'weak';
  };

  const passwordStrength = checkPasswordStrength(password);

  // Password requirements checks
  const passwordChecks = {
    length: password.length >= 6,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!password || !confirmPassword) {
      showMessage('Please fill in all fields', 'warning');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      showMessage('Password must be at least 6 characters', 'warning');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      showMessage('Passwords do not match', 'warning');
      setLoading(false);
      return;
    }

    const result = await resetPassword(token, password);
    
    if (result.success) {
      showMessage(result.message || 'Password reset successful!', 'success');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      showMessage(result.error || 'Failed to reset password', 'error');
    }
    
    setLoading(false);
  };

  return (
    <div className="gv-reset-container">
      <div className="gv-reset-card">
        <h2 className="gv-reset-title">Reset Password</h2>
        
        <p className="gv-reset-subtitle">
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Password Field */}
          <div className="gv-form-group">
            <label htmlFor="password">New Password</label>
            <div className="gv-password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur('password')}
                placeholder="Enter new password"
                disabled={loading}
                className={
                  touched.password && password 
                    ? (password.length >= 6 ? 'gv-valid' : 'gv-error')
                    : ''
                }
              />
              <button
                type="button"
                className="gv-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <span className="gv-eye-icon">{showPassword ? '👁️' : '👁️‍🗨️'}</span>
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {password && (
              <>
                <div className="gv-password-strength">
                  <div className={`gv-strength-bar ${passwordStrength === 'weak' ? 'gv-weak' : ''}`}></div>
                  <div className={`gv-strength-bar ${passwordStrength === 'medium' || passwordStrength === 'strong' ? `gv-${passwordStrength}` : ''}`}></div>
                  <div className={`gv-strength-bar ${passwordStrength === 'strong' ? 'gv-strong' : ''}`}></div>
                </div>
                
                {/* Password Requirements */}
                <div className="gv-password-requirements">
                  <p>Password must contain:</p>
                  <ul className="gv-requirement-list">
                    <li className={passwordChecks.length ? 'gv-met' : ''}>
                      <span className="gv-req-icon">{passwordChecks.length ? '✅' : '○'}</span>
                      At least 6 characters
                    </li>
                    <li className={passwordChecks.uppercase ? 'gv-met' : ''}>
                      <span className="gv-req-icon">{passwordChecks.uppercase ? '✅' : '○'}</span>
                      One uppercase letter
                    </li>
                    <li className={passwordChecks.number ? 'gv-met' : ''}>
                      <span className="gv-req-icon">{passwordChecks.number ? '✅' : '○'}</span>
                      One number
                    </li>
                    <li className={passwordChecks.special ? 'gv-met' : ''}>
                      <span className="gv-req-icon">{passwordChecks.special ? '✅' : '○'}</span>
                      One special character
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="gv-form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="gv-password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                placeholder="Confirm new password"
                disabled={loading}
                className={
                  touched.confirmPassword && confirmPassword
                    ? (password === confirmPassword ? 'gv-valid' : 'gv-error')
                    : ''
                }
              />
              <button
                type="button"
                className="gv-password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex="-1"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                <span className="gv-eye-icon">{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</span>
              </button>
            </div>
            {touched.confirmPassword && confirmPassword && password !== confirmPassword && (
              <div className="gv-validation-hint gv-invalid">
                <span className="gv-req-icon">⚠️</span>
                Passwords do not match
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className={`gv-reset-btn ${loading ? 'gv-loading' : ''}`} 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="gv-spinner"></span>
                Resetting...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        <div className="gv-reset-links">
          <Link to="/login" className="gv-back-link">
            ← Back to Login
          </Link>
        </div>

        <div className="gv-reset-help">
          <hr className="gv-divider" />
          <p className="gv-help-text">
            <strong>Tip:</strong> Use a strong password with a mix of letters, numbers, and special characters for better security.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;