const paymentService = require('../services/payment.service');
const logger = require('../services/logger.service');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');
const { GAME_IDS } = require('../config/constants');
const ApiError = require('../utils/apiError');

/**
 * Authorize game access based on payment token
 * POST /api/v1/payments/authorize
 */
const authorizeGame = asyncHandler(async (req, res) => {
    const { game, paymentToken } = req.body;
    
    // Basic validation
    if (!game || !paymentToken) {
        throw new ApiError(400, 'Game and payment token are required', 'MISSING_FIELDS');
    }
    
    // Get game ID from mapping
    const gameId = GAME_IDS[game];
    if (!gameId) {
        throw new ApiError(400, 'Invalid game identifier', 'INVALID_GAME');
    }
    
    logger.info('Game authorization request', { game, gameId });
    
    // Check payment status with Ethio Telecom API
    const result = await paymentService.checkPaymentStatus(gameId, paymentToken);
    
    // Return authorization result
    successResponse(res, {
        allowed: result.isAllowed,
        status: result.status,
        expireDate: result.expireDate,
        game: game
    }, 'Game authorization completed');
});

/**
 * Verify payment status (optional endpoint)
 * GET /api/v1/payments/verify/:gameId
 */
const verifyPayment = asyncHandler(async (req, res) => {
    const { gameId } = req.params;
    const { token } = req.query;
    
    if (!token) {
        throw new ApiError(400, 'Payment token is required', 'MISSING_TOKEN');
    }
    
    const configGameId = GAME_IDS[gameId];
    if (!configGameId) {
        throw new ApiError(404, 'Game not found', 'INVALID_GAME');
    }
    
    const result = await paymentService.checkPaymentStatus(configGameId, token);
    
    successResponse(res, {
        gameId,
        ...result
    });
});

module.exports = {
    authorizeGame,
    verifyPayment
};