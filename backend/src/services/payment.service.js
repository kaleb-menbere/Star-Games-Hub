const httpService = require('./http.service');
const cacheService = require('./cache.service');
const authService = require('./auth.service');
const logger = require('./logger.service');
const { ENDPOINTS, CACHE_TTL, ERROR_CODES, PAYMENT_STATUS } = require('../config/constants');
const ApiError = require('../utils/apiError');

class PaymentService {
    /**
     * Check payment status with Ethio Telecom
     * @param {string} gameId - Game Center game ID
     * @param {string} paymentToken - Payment token from SuperApp
     * @returns {Promise<Object>} Payment status result
     */
    async checkPaymentStatus(gameId, paymentToken) {
        // Create cache key
        const cacheKey = `payment:${gameId}:${paymentToken.substring(0, 10)}`;
        
        // Check cache first
        const cachedResult = cacheService.get(cacheKey);
        if (cachedResult) {
            logger.debug('Returning cached payment status');
            return cachedResult;
        }

        // Get access token
        let accessToken = await authService.getAccessToken();
        
        try {
            // Make payment check request
            const result = await this._makePaymentCheck(gameId, paymentToken, accessToken);
            
            // Cache successful result
            cacheService.set(cacheKey, result, CACHE_TTL.PAYMENT);
            
            return result;
        } catch (error) {
            // Handle token expiration
            if (error.code === ERROR_CODES.UNAUTHORIZED) {
                logger.info('Token expired, refreshing and retrying...');
                
                // Refresh token and retry
                accessToken = await authService.refreshToken();
                
                const result = await this._makePaymentCheck(gameId, paymentToken, accessToken);
                
                // Cache successful result
                cacheService.set(cacheKey, result, CACHE_TTL.PAYMENT);
                
                return result;
            }
            
            // Re-throw other errors
            throw error;
        }
    }

    /**
     * Make the actual payment check API call
     * @private
     */
    async _makePaymentCheck(gameId, paymentToken, accessToken) {
        logger.debug('Checking payment status', { gameId });
        
        const data = await httpService.post(
            ENDPOINTS.PAYMENT_CHECK,
            { gameId, token: paymentToken },
            { 'access-token': accessToken }
        );

        // Check for API error
        if (data.resCode !== ERROR_CODES.SUCCESS) {
            throw new ApiError(400, data.resMsg || 'Payment check failed', data.resCode);
        }

        // Format and return result
        return {
            status: data.result.paymentStatus,
            isAllowed: this._isPaymentAllowed(data.result.paymentStatus),
            expireDate: data.result.expireDate,
            timestamp: data.result.timestamp
        };
    }

    /**
     * Check if payment status allows game access
     * @private
     */
    _isPaymentAllowed(status) {
        return status === PAYMENT_STATUS.PAID || status === PAYMENT_STATUS.TRIAL;
    }
}

module.exports = new PaymentService();