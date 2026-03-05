const logger = require('../services/logger.service');
const ApiError = require('../utils/apiError');
const env = require('../config/environment');

/**
 * Central error handling middleware
 */
const errorHandler = (err, req, res, next) => {
    // Log error
    logger.error('Error:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        code: err.code
    });

    // Handle known API errors
    if (err instanceof ApiError) {
        return res.status(err.status).json({
            success: false,
            error: {
                code: err.code,
                message: err.message,
                ...(err.details && { details: err.details })
            },
            timestamp: new Date().toISOString()
        });
    }

    // Handle rate limit errors
    if (err.code === 'GamesHub__TooFrequently') {
        return res.status(429).json({
            success: false,
            error: {
                code: 'RATE_LIMITED',
                message: 'Too many requests. Please try again later.'
            },
            timestamp: new Date().toISOString()
        });
    }

    // Default error response
    const status = err.status || 500;
    const message = env.IS_DEV ? err.message : 'Internal server error';
    
    res.status(status).json({
        success: false,
        error: {
            code: err.code || 'INTERNAL_ERROR',
            message
        },
        timestamp: new Date().toISOString()
    });
};

/**
 * 404 Not Found handler
 */
const notFound = (req, res, next) => {
    const error = new ApiError(404, `Cannot ${req.method} ${req.url}`, 'NOT_FOUND');
    next(error);
};

module.exports = {
    errorHandler,
    notFound
};