module.exports = {
    // API Endpoints
    ENDPOINTS: {
        TOKEN: 'https://ecommerce.ethiotelecom.et/baas/auth/v1.0/oauth2/token',
        PAYMENT_CHECK: 'https://ecommerce.ethiotelecom.et/service/GamesHub__GameCenter/1.0.0/checkPaymentStatus'
    },
    
    // Game ID mapping (from vendor portal)
    GAME_IDS: {
        game1: 'cnZw000001UUsjQWksVM',
        game2: 'cnZw000001UUtKbS9SHQ',
        game3: 'cnZw000001UUuoJxkc4G',
        game4: 'cnZw000001UUv5oRwfOi',
        game5: 'cnZw000001UUvarPY0uG',
        game6: 'cnZw000001UUvtAZzaPQ',
        game7: 'cnZw000001UUw75vFJpY',
        game8: 'cnZw000001UUwbZcKZii',
        game9: 'cnZw000001UUxQ1BWshk',
        game10: 'cnZw000001UUxYsAJdTM',
        game11: 'cnZw000001UUxkwsBBfU'
    },
    
    // Payment status values
    PAYMENT_STATUS: {
        UNPAID: 'Unpaid',
        TRIAL: 'Trial',
        PAID: 'Paid'
    },
    
    // Error codes from Game Center API
    ERROR_CODES: {
        SUCCESS: '0',
        UNAUTHORIZED: '405230602',
        TOO_FREQUENT: 'GamesHub__TooFrequently',
        INTERNAL_ERROR: 'GamesHub__InternalSystemException'
    },
    
    // Cache TTL in seconds
    CACHE_TTL: {
        TOKEN: 7000, // Slightly less than 7200 to be safe
        PAYMENT: 300 // 5 minutes
    },
    
    // Rate limiting
    RATE_LIMITS: {
        WINDOW_MS: 60 * 1000, // 1 minute
        MAX_REQUESTS: 60
    }
};