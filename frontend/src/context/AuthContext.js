import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import api from '../services/api';
import { MessageContext } from '../components/Message';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get the message context
  const messageContext = useContext(MessageContext);
  const showMessage = messageContext?.showMessage || (() => {});
  
  // Ref to track last shown message to prevent duplicates
  const lastMessageRef = useRef({ text: '', time: 0 });

  // Wrapper to prevent duplicate messages
  const showMessageOnce = (text, type = 'info') => {
    const now = Date.now();
    // Don't show same message within 3 seconds
    if (lastMessageRef.current.text === text && now - lastMessageRef.current.time < 3000) {
      // console.log('Duplicate message prevented:', text);
      return;
    }
    lastMessageRef.current = { text, time: now };
    showMessage(text, type);
  };

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (e) {
        // console.error('Error parsing user data:', e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  const register = async (userData) => {
    try {
      setError(null);
      // console.log('Register attempt for:', userData.email);
      
      const response = await api.post('/auth/register', userData);
      // console.log('Register response:', response.data);
      
      if (response.data.success) {
        // Do not show a duplicate success message here — the Register page redirects to Login
        // which displays the success message via navigation state.
        return { 
          success: true, 
          message: response.data.message,
          data: response.data.data
        };
      } else {
        const errorMsg = response.data.message || 'Registration failed';
        showMessageOnce(errorMsg, 'error');
        return { 
          success: false, 
          error: errorMsg
        };
      }
    } catch (err) {
      // console.error('Registration error:', err.response || err);
      
      let errorMsg = 'Registration failed';
      
      if (err.response?.status === 400) {
        errorMsg = err.response.data?.message || 'Invalid registration data';
        
        if (errorMsg.toLowerCase().includes('email already registered')) {
          errorMsg = 'This email is already registered. Please login or use a different email.';
        } else if (errorMsg.toLowerCase().includes('username already taken')) {
          errorMsg = 'This username is already taken. Please choose a different username.';
        }
      } else if (err.response?.status === 409) {
        errorMsg = err.response.data?.message || 'Email or username already exists';
      } else if (err.response?.status === 500) {
        errorMsg = 'Server error. Please try again later.';
      }
      
      setError(errorMsg);
      showMessageOnce(errorMsg, 'error');
      
      return { 
        success: false, 
        error: errorMsg
      };
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      
      const response = await api.post('/auth/login', credentials);

      if (response.data.success) {
        const { token, user } = response.data.data;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(user);

        showMessageOnce('Login successful! Redirecting...', 'success');
        return { success: true, user };
      }

      const errorMsg = response.data.message || 'Login failed';
      showMessageOnce(errorMsg, 'error');
      return {
        success: false,
        error: errorMsg,
        needsVerification: response.data.needsVerification || false,
        email: response.data.email || null
      };

    } catch (err) {
      // console.error('Login error:', err.response || err);

      const errorData = err.response?.data || {};
      let errorMsg = errorData.message || 'Login failed';
      let needsVerification = errorData.needsVerification || false;

      if (err.response?.status === 423) {
        errorMsg = errorData.message || 'Account is locked. Please try later or reset your password.';
      } else if (err.response?.status === 400) {
        errorMsg = errorData.message || 'Please provide email and password';
      } else if (err.response?.status === 401 && !needsVerification) {
        errorMsg = errorData.message || 'Invalid email or password';
      }

      setError(errorMsg);
      showMessageOnce(errorMsg, needsVerification ? 'warning' : 'error');

      return { 
        success: false, 
        error: errorMsg,
        needsVerification,
        email: errorData.email || null
      };
    }
  };

  const logout = () => {
    // Clear httpOnly cookie token on backend (best effort)
    api.post('/auth/logout').catch(() => {});
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    showMessageOnce('You have been logged out successfully.', 'info');
  };

  const getProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      
      if (response.data.success) {
        setUser(response.data.data);
        localStorage.setItem('user', JSON.stringify(response.data.data));
        return { success: true, user: response.data.data };
      }
    } catch (err) {
      // console.error('Get profile error:', err);
      const errorMsg = err.response?.data?.message || 'Failed to load profile';
      showMessageOnce(errorMsg, 'error');
      
      if (err.response?.status === 401) {
        logout();
      }
      return { success: false, error: errorMsg };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      
      if (response.data.success) {
        const updatedUser = { ...user, profile: response.data.data.profile };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        showMessageOnce('Profile updated successfully!', 'success');
        return { success: true, profile: response.data.data.profile };
      }
    } catch (err) {
      // console.error('Update profile error:', err);
      const errorMsg = err.response?.data?.message || 'Failed to update profile';
      showMessageOnce(errorMsg, 'error');
      return { success: false, error: errorMsg };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      const response = await api.put('/auth/change-password', passwordData);
      
      if (response.data.success) {
        showMessageOnce('Password changed successfully!', 'success');
        return { success: true, message: response.data.message };
      }
    } catch (err) {
      // console.error('Change password error:', err);
      const errorMsg = err.response?.data?.message || 'Failed to change password';
      showMessageOnce(errorMsg, 'error');
      return { success: false, error: errorMsg };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      
      if (response.data.success) {
        return { success: true, message: response.data.message };
      }
    } catch (err) {
      // console.error('Forgot password error:', err);
      const errorMsg = err.response?.data?.message || 'Failed to send reset email';
      showMessageOnce(errorMsg, 'error');
      return { success: false, error: errorMsg };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      const response = await api.put(`/auth/reset-password/${token}`, { password });
      
      if (response.data.success) {
        showMessageOnce('Password reset successful! You can now login with your new password.', 'success');
        return { success: true, message: response.data.message };
      }
    } catch (err) {
      // console.error('Reset password error:', err);
      const errorMsg = err.response?.data?.message || 'Failed to reset password';
      showMessageOnce(errorMsg, 'error');
      return { success: false, error: errorMsg };
    }
  };

  const resendVerification = async (email) => {
    try {
      const response = await api.post('/auth/resend-verification', { email });
      
      if (response.data.success) {
        showMessageOnce(response.data.message || `Verification email sent to ${email}`, 'success');
        return { success: true, message: response.data.message };
      }
    } catch (err) {
      // console.error('Resend verification error:', err);
      showMessageOnce(`If ${email} is registered, a verification email will be sent.`, 'info');
      return { success: false, error: err.response?.data?.message };
    }
  };

  const verifyEmail = async (code) => {
    try {
      const response = await api.post('/auth/verify', { code });

      if (response.data.success) {
        showMessageOnce('Email verified successfully! You can now login.', 'success');
        return { success: true, message: response.data.message };
      }
    } catch (err) {
      // console.error('Verify email error:', err);
      const errorMsg = err.response?.data?.message || 'Email verification failed';
      showMessageOnce(errorMsg, 'error');
      return { success: false, error: errorMsg };
    }
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    getProfile,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    resendVerification,
    verifyEmail
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};