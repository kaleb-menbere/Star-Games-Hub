/**
 * Standard success response formatter
 */
const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
    const response = {
        success: true,
        message,
        timestamp: new Date().toISOString()
    };
    
    if (data) {
        response.data = data;
    }
    
    return res.status(statusCode).json(response);
};

module.exports = {
    successResponse
};