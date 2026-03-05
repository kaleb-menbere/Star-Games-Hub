/**
 * Custom API Error class
 */
class ApiError extends Error {
    constructor(status, message, code = 'API_ERROR', details = null) {
        super(message);
        this.status = status;
        this.code = code;
        this.details = details;
        this.isOperational = true;
        
        // Capture stack trace
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = ApiError;