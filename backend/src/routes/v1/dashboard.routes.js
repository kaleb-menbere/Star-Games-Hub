const express = require('express');
const router = express.Router();
const dbService = require('../../services/db.service');
const paymentService = require('../../services/payment.service');
const authService = require('../../services/auth.service');
const asyncHandler = require('../../utils/asyncHandler');
const { successResponse } = require('../../utils/apiResponse');

// Get dashboard stats with period filtering
router.get('/stats', asyncHandler(async (req, res) => {
    const { period = 'day', gameId = 'all' } = req.query;
    
    // Initialize DB connection if needed
    await dbService.connect();
    
    const stats = await dbService.getDashboardStats(period, gameId);
    successResponse(res, stats);
}));

// Get game summary
router.get('/games/summary', asyncHandler(async (req, res) => {
    await dbService.connect();
    
    const client = await dbService.pool.connect();
    try {
        const result = await client.query(`
            SELECT 
                COALESCE(game_id, 'all') as "gameId",
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'allowed') as allowed,
                COUNT(*) FILTER (WHERE status = 'denied') as denied,
                COUNT(*) FILTER (WHERE error_code IS NOT NULL) as errors,
                ROUND(AVG(response_time)) as avg_response
            FROM access_logs 
            WHERE timestamp > NOW() - INTERVAL '7 days'
            GROUP BY game_id
            ORDER BY total DESC
        `);
        
        successResponse(res, result.rows);
    } finally {
        client.release();
    }
}));

// Get raw logs with filters
router.get('/logs', asyncHandler(async (req, res) => {
    await dbService.connect();
    
    const { 
        period = 'day',
        gameId,
        status,
        limit = 100,
        offset = 0 
    } = req.query;
    
    const client = await dbService.pool.connect();
    try {
        let query = `
            SELECT 
                to_char(timestamp, 'YYYY-MM-DD HH24:MI:SS') as timestamp,
                game_id as "gameId",
                ip,
                status,
                error_code as "errorCode",
                error_msg as "errorMsg",
                response_time as "responseTime"
            FROM access_logs 
            WHERE 1=1
        `;
        const params = [];
        
        if (gameId && gameId !== 'all') {
            params.push(gameId);
            query += ` AND game_id = $${params.length}`;
        }
        
        if (status) {
            params.push(status);
            query += ` AND status = $${params.length}`;
        }
        
        if (period === 'day') {
            query += ` AND timestamp > NOW() - INTERVAL '24 hours'`;
        } else if (period === 'week') {
            query += ` AND timestamp > NOW() - INTERVAL '7 days'`;
        } else if (period === 'month') {
            query += ` AND timestamp > NOW() - INTERVAL '30 days'`;
        }
        
        query += ` ORDER BY timestamp DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);
        
        const result = await client.query(query, params);
        
        // Get total count
        const countResult = await client.query('SELECT COUNT(*) FROM access_logs');
        
        successResponse(res, {
            logs: result.rows,
            pagination: {
                total: parseInt(countResult.rows[0].count),
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: parseInt(offset) + result.rows.length < parseInt(countResult.rows[0].count)
            }
        });
    } finally {
        client.release();
    }
}));

// Test API connection
router.post('/test-api', asyncHandler(async (req, res) => {
    const start = Date.now();
    try {
        const token = await authService.getAccessToken(true);
        
        // Log the API call
        await dbService.connect();
        await dbService.logApiCall({
            endpoint: 'test_api',
            status: 'success',
            resCode: '0',
            responseTime: Date.now() - start
        });
        
        successResponse(res, {
            connected: true,
            message: '✅ API Connection Successful',
            responseTime: Date.now() - start
        });
    } catch (error) {
        successResponse(res, {
            connected: false,
            message: '❌ API Connection Failed',
            error: error.message,
            responseTime: Date.now() - start
        });
    }
}));

// Verify token
router.post('/verify-token', asyncHandler(async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ error: 'Token required' });
    }
    
    const start = Date.now();
    try {        
        const accessToken = await authService.getAccessToken();
        const result = await paymentService._makePaymentCheck('test', token, accessToken);
        
        // Log the API call
        await dbService.connect();
        await dbService.logApiCall({
            endpoint: 'verify',
            status: 'success',
            resCode: '0',
            responseTime: Date.now() - start
        });
        
        successResponse(res, { valid: true, ...result });
    } catch (error) {
        successResponse(res, { 
            valid: false, 
            error: error.message 
        });
    }
}));

module.exports = router;