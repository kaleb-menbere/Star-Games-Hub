const httpService = require('./http.service');
const cacheService = require('./cache.service');
const logger = require('./logger.service');
const { ENDPOINTS, CACHE_TTL, ERROR_CODES } = require('../config/constants');
const env = require('../config/environment');
const ApiError = require('../utils/apiError');

class AuthService {
    /**
     * Get OAuth access token from Ethio Telecom
     * @param {boolean} forceRefresh - Force token refresh
     * @returns {Promise<string>} Access token
     */
    async getAccessToken(forceRefresh = false) {
        // Check cache first (unless force refresh)
        if (!forceRefresh) {
            const cachedToken = cacheService.get('access_token');
            if (cachedToken) {
                logger.debug('Using cached access token');
                return cachedToken;
            }
        }

        try {
            logger.info('Requesting new access token from Ethio Telecom');
            
            // Make token request
            const data = await httpService.postForm(
                ENDPOINTS.TOKEN,
                new URLSearchParams({
                    grant_type: 'client_credentials',
                    client_id: env.CLIENT_ID,
                    client_secret: env.CLIENT_SECRET
                }).toString()
            );

            // Validate response
            if (!data.access_token) {
                throw new ApiError(500, 'Invalid token response', 'TOKEN_RESPONSE_INVALID');
            }

            // Cache the token
            cacheService.set('access_token', data.access_token, CACHE_TTL.TOKEN);
            
            logger.info('New access token obtained successfully');
            
            return data.access_token;
        } catch (error) {
            logger.error('Failed to obtain access token', { 
                error: error.message,
                status: error.status 
            });
            throw error;
        }
    }

    /**
     * Force refresh the access token
     * @returns {Promise<string>} New access token
     */
    async refreshToken() {
        logger.info('Force refreshing access token');
        return this.getAccessToken(true);
    }
}

module.exports = new AuthService();