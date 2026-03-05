const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
    register,
    verifyEmail,
    resendVerification,
    login,
    logout,
    forgotPassword,
    resetPassword,
    getMe,
    updateProfile,
    changePassword
} = require('../controllers/auth.controller');

// Public routes
router.post('/register', register);
router.post('/verify', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;