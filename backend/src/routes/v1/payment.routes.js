const express = require('express');
const router = express.Router();
const paymentController = require('../../controllers/payment.controller');
const { strictLimiter } = require('../../middleware/rateLimiter.middleware');

/**
 * @route   POST /api/v1/payments/authorize
 * @desc    Authorize game access with payment token
 * @access  Public (with valid token)
 */
router.post('/authorize', strictLimiter, paymentController.authorizeGame);

/**
 * @route   GET /api/v1/payments/verify/:gameId
 * @desc    Verify payment status for a game
 * @access  Public (with valid token)
 */
router.get('/verify/:gameId', paymentController.verifyPayment);

module.exports = router;