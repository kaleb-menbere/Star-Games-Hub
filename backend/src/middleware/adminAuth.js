const logger = require('../services/logger.service');

// Admin authorization middleware
const adminAuth = async (req, res, next) => {
    try {
        // Check if user exists and is admin
        // This assumes you have user info in req.user from your auth middleware
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        next();
    } catch (error) {
        logger.error('Admin auth error:', error);
        res.status(500).json({
            success: false,
            message: 'Authorization failed',
            error: error.message
        });
    }
};

module.exports = adminAuth;