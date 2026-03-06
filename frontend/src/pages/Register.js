// Register.js - Complete with all features and unique class names
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMessage } from '../components/Message';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [validation, setValidation] = useState({
    emailValid: false,
    usernameValid: false,
    passwordValid: false,
    passwordsMatch: false
  });
  
  const [passwordStrength, setPasswordStrength] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({
    email: false,
    username: false,
    password: false,
    confirmPassword: false
  });
  
  const { register } = useAuth();
  const { showMessage } = useMessage();
  const navigate = useNavigate();

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateUsername = (username) => {
    return username.length >= 3 && username.length <= 20;
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Update validation
    if (name === 'email') {
      setValidation(prev => ({ ...prev, emailValid: validateEmail(value) }));
    }
    
    if (name === 'username') {
      setValidation(prev => ({ ...prev, usernameValid: validateUsername(value) }));
    }
    
    if (name === 'password') {
      const isValid = validatePassword(value);
      setValidation(prev => ({ ...prev, passwordValid: isValid }));
      setPasswordStrength(checkPasswordStrength(value));
      
      // Check if passwords match when password changes
      if (formData.confirmPassword) {
        setValidation(prev => ({ ...prev, passwordsMatch: value === formData.confirmPassword }));
      }
    }
    
    if (name === 'confirmPassword') {
      setValidation(prev => ({ ...prev, passwordsMatch: value === formData.password }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.username || !formData.password || !formData.confirmPassword) {
      showMessage('Please fill in all fields', 'warning');
      return false;
    }

    if (!validateEmail(formData.email)) {
      showMessage('Please enter a valid email address', 'warning');
      return false;
    }

    if (!validateUsername(formData.username)) {
      showMessage('Username must be 3-20 characters long', 'warning');
      return false;
    }

    if (!validatePassword(formData.password)) {
      showMessage('Password must be at least 6 characters long', 'warning');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      showMessage('Passwords do not match', 'warning');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (loading) return;
    
    if (!validateForm()) return;

    setLoading(true);

    const result = await register({
      email: formData.email,
      username: formData.username,
      password: formData.password
    });
    
if (result.success) {
  showMessage('Registration successful! Please check your email for verification code.', 'success');
  
  // Save email to localStorage for verify page
  localStorage.setItem('verificationEmail', formData.email);
  
  // Clear form
  setFormData({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  
  // Reset validation
  setValidation({
    emailValid: false,
    usernameValid: false,
    passwordValid: false,
    passwordsMatch: false
  });
  
  // Redirect to verify email page
  setTimeout(() => {
    navigate('/verify-email');
  }, 2000);
} else {
      showMessage(result.error || 'Registration failed. Please try again.', 'error');
    }
    
    setLoading(false);
  };

  // Password requirements checks
  const passwordChecks = {
    length: formData.password.length >= 6,
    uppercase: /[A-Z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[^A-Za-z0-9]/.test(formData.password)
  };

  return (
    <div className="gv-register-container">
      <div className="gv-register-card">
        <h2 className="gv-register-title">Create Account</h2>
        
        <p className="gv-register-subtitle">
          Join Star Games Hub and start playing!
        </p>

        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="gv-form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={() => handleBlur('email')}
              placeholder="star@gmail.com"
              disabled={loading}
              className={
                touched.email && formData.email 
                  ? (validation.emailValid ? 'gv-valid' : 'gv-error')
                  : ''
              }
            />
            {touched.email && formData.email && !validation.emailValid && (
              <div className="gv-validation-hint gv-invalid">
                <span className="gv-req-icon">⚠️</span>
                Please enter a valid email address
              </div>
            )}
          </div>

          {/* Username Field */}
          <div className="gv-form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              onBlur={() => handleBlur('username')}
              placeholder="Choose a username (3-20 characters)"
              disabled={loading}
              className={
                touched.username && formData.username
                  ? (validation.usernameValid ? 'gv-valid' : 'gv-error')
                  : ''
              }
            />
            {touched.username && formData.username && !validation.usernameValid && (
              <div className="gv-validation-hint gv-invalid">
                <span className="gv-req-icon">⚠️</span>
                Username must be 3-20 characters
              </div>
            )}
          </div>

          {/* Password Field */}
          <div className="gv-form-group">
            <label htmlFor="password">Password</label>
            <div className="gv-password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={() => handleBlur('password')}
                placeholder="Create a password (min. 6 characters)"
                disabled={loading}
                className={
                  touched.password && formData.password
                    ? (validation.passwordValid ? 'gv-valid' : 'gv-error')
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
            {formData.password && (
              <>
                <div className="gv-password-strength">
                  <div className={`gv-strength-bar ${passwordStrength === 'weak' ? 'gv-weak' : ''}`}></div>
                  <div className={`gv-strength-bar ${passwordStrength === 'medium' || passwordStrength === 'strong' ? `gv-${passwordStrength}` : ''}`}></div>
                  <div className={`gv-strength-bar ${passwordStrength === 'strong' ? 'gv-strong' : ''}`}></div>
                </div>
                
                {/* Password Requirements */}
                <div className="gv-password-requirements">
                  <p>Password should contain:</p>
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
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={() => handleBlur('confirmPassword')}
                placeholder="Confirm your password"
                disabled={loading}
                className={
                  touched.confirmPassword && formData.confirmPassword
                    ? (validation.passwordsMatch ? 'gv-valid' : 'gv-error')
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
            {touched.confirmPassword && formData.confirmPassword && !validation.passwordsMatch && (
              <div className="gv-validation-hint gv-invalid">
                <span className="gv-req-icon">⚠️</span>
                Passwords do not match
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className={`gv-register-btn ${loading ? 'gv-loading' : ''}`} 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="gv-spinner"></span>
                Creating Account...
              </>
            ) : (
              'Register'
            )}
          </button>
        </form>

        {/* Login Link */}
        <p className="gv-register-login">
          Already have an account? <Link to="/login">Login here</Link>
        </p>

        {/* Terms Section */}
        <div className="gv-register-terms">
          <hr className="gv-divider" />
          <p className="gv-terms-text">
            By registering, you agree to our <Link to="/terms">Terms of Service</Link> and{' '}
            <Link to="/privacy">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;