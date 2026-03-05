const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const gameRoutes = require('./game.routes');
const adminRoutes = require('./admin.routes');

// Mount routes
if (authRoutes && typeof authRoutes === 'function') router.use('/auth', authRoutes);
if (gameRoutes && typeof gameRoutes === 'function') router.use('/games', gameRoutes);
if (adminRoutes && typeof adminRoutes === 'function') router.use('/admin', adminRoutes);

// API health check
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

module.exports = router;