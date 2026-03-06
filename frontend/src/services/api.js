// Import axios normally — the standard entry exposes `create()` correctly.
import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'https://games.startechnologies.et/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // console.log(`🚀 API Request: ${config.method.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  (error) => {
    // console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // console.log(`✅ API Response: ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    //  console.error('❌ API Error:', {
    //   status: error.response?.status,
    //   url: error.config?.url,
    //   method: error.config?.method,
    //   data: error.response?.data,
    //   message: error.message
    // });
    
    // Handle 401 Unauthorized - but only for protected routes
    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      const isRegisterRequest = error.config?.url?.includes('/auth/register');
      const isVerifyRequest = error.config?.url?.includes('/auth/verify');
      const isResendRequest = error.config?.url?.includes('/auth/resend-verification');
      const isForgotRequest = error.config?.url?.includes('/auth/forgot-password');
      const isResetRequest = error.config?.url?.includes('/auth/reset-password');
      
      // Don't clear token for auth-related requests
      if (!isLoginRequest && !isRegisterRequest && !isVerifyRequest && 
          !isResendRequest && !isForgotRequest && !isResetRequest) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // You can emit an event here if needed
        window.dispatchEvent(new CustomEvent('unauthorized'));
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;