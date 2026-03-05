const axios = require('axios');
const logger = require('./logger.service');
const ApiError = require('../utils/apiError');

/**
 * HTTP Service for making API calls to Ethio Telecom
 */
class HttpService {
    constructor() {
        this.client = axios.create({
            timeout: 10000, // 10 seconds
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Response interceptor for error handling
        this.client.interceptors.response.use(
            response => response,
            error => this._handleError(error)
        );
    }

    /**
     * Make POST request with JSON data
     */
    async post(url, data, headers = {}) {
        try {
            const response = await this.client.post(url, data, { headers });
            return response.data;
        } catch (error) {
            throw this._normalizeError(error);
        }
    }

    /**
     * Make POST request with form data
     */
    async postForm(url, data, headers = {}) {
        try {
            const response = await this.client.post(url, data, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    ...headers
                }
            });
            return response.data;
        } catch (error) {
            throw this._normalizeError(error);
        }
    }

    /**
     * Handle axios errors
     * @private
     */
    _handleError(error) {
        logger.error('HTTP Request Failed', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            message: error.message
        });
        
        return Promise.reject(error);
    }

    /**
     * Normalize error to ApiError
     * @private
     */
    _normalizeError(error) {
        if (error.response) {
            // Server responded with error
            const { status, data } = error.response;
            return new ApiError(
                status,
                data?.resMsg || error.message,
                data?.resCode || 'API_ERROR'
            );
        }
        
        if (error.request) {
            // No response received
            return new ApiError(503, 'Service unavailable', 'SERVICE_UNAVAILABLE');
        }
        
        // Request setup error
        return new ApiError(500, error.message, 'REQUEST_ERROR');
    }
}

module.exports = new HttpService();