const { Pool } = require('pg');
const logger = require('./logger.service');
const env = require('../config/environment');

class DbService {
    constructor() {
        this.pool = null;
        this.buffer = [];
        this.bufferSize = 100;
        this.initialized = false;
    }

    async connect() {
        if (this.initialized) return;

        this.pool = new Pool({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            database: process.env.DB_NAME || 'game_center',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'postgres',
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });

        try {
            // Test connection
            const client = await this.pool.connect();
            client.release();
            logger.info('✅ Database connection test successful');

            await this.initTables();
            
            // Start batch processor
            setInterval(() => this.processBatch(), 3000);
            
            this.initialized = true;
            logger.info('🚀 PostgreSQL connected and ready');
        } catch (error) {
            logger.error('❌ Failed to connect to PostgreSQL:', error);
            throw error;
        }
    }

    async initTables() {
        const client = await this.pool.connect();
        try {
            logger.info('Starting database table initialization...');

            // Create tables in correct order (no dependencies first)
            
            await client.query(`
                CREATE TABLE IF NOT EXISTS daily_stats (
                    date DATE PRIMARY KEY,
                    game_id VARCHAR(50) DEFAULT 'all',
                    total_requests INTEGER DEFAULT 0,
                    allowed INTEGER DEFAULT 0,
                    denied INTEGER DEFAULT 0,
                    trial INTEGER DEFAULT 0,
                    paid INTEGER DEFAULT 0,
                    unpaid INTEGER DEFAULT 0,
                    errors INTEGER DEFAULT 0,
                    unique_users INTEGER DEFAULT 0,
                    avg_response_time INTEGER DEFAULT 0,
                    peak_hour INTEGER,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW()
                )
            `);
            logger.info('✅ Created daily_stats table');

            await client.query(`
                CREATE TABLE IF NOT EXISTS weekly_stats (
                    week_start DATE PRIMARY KEY,
                    game_id VARCHAR(50) DEFAULT 'all',
                    total_requests INTEGER DEFAULT 0,
                    allowed INTEGER DEFAULT 0,
                    denied INTEGER DEFAULT 0,
                    trial INTEGER DEFAULT 0,
                    paid INTEGER DEFAULT 0,
                    unpaid INTEGER DEFAULT 0,
                    errors INTEGER DEFAULT 0,
                    unique_users INTEGER DEFAULT 0,
                    avg_response_time INTEGER DEFAULT 0,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW()
                )
            `);
            logger.info('✅ Created weekly_stats table');

            await client.query(`
                CREATE TABLE IF NOT EXISTS monthly_stats (
                    month DATE PRIMARY KEY,
                    game_id VARCHAR(50) DEFAULT 'all',
                    total_requests INTEGER DEFAULT 0,
                    allowed INTEGER DEFAULT 0,
                    denied INTEGER DEFAULT 0,
                    trial INTEGER DEFAULT 0,
                    paid INTEGER DEFAULT 0,
                    unpaid INTEGER DEFAULT 0,
                    errors INTEGER DEFAULT 0,
                    unique_users INTEGER DEFAULT 0,
                    avg_response_time INTEGER DEFAULT 0,
                    peak_day INTEGER,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW()
                )
            `);
            logger.info('✅ Created monthly_stats table');

            await client.query(`
                CREATE TABLE IF NOT EXISTS yearly_stats (
                    year INTEGER PRIMARY KEY,
                    game_id VARCHAR(50) DEFAULT 'all',
                    total_requests INTEGER DEFAULT 0,
                    allowed INTEGER DEFAULT 0,
                    denied INTEGER DEFAULT 0,
                    trial INTEGER DEFAULT 0,
                    paid INTEGER DEFAULT 0,
                    unpaid INTEGER DEFAULT 0,
                    errors INTEGER DEFAULT 0,
                    unique_users INTEGER DEFAULT 0,
                    avg_response_time INTEGER DEFAULT 0,
                    peak_month INTEGER,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW()
                )
            `);
            logger.info('✅ Created yearly_stats table');

            await client.query(`
                CREATE TABLE IF NOT EXISTS api_logs (
                    id BIGSERIAL PRIMARY KEY,
                    endpoint VARCHAR(100),
                    status VARCHAR(20),
                    res_code VARCHAR(50),
                    response_time INTEGER,
                    timestamp TIMESTAMPTZ DEFAULT NOW()
                )
            `);
            logger.info('✅ Created api_logs table');

            await client.query(`
                CREATE TABLE IF NOT EXISTS hourly_breakdown (
                    hour TIMESTAMPTZ PRIMARY KEY,
                    total_requests INTEGER DEFAULT 0,
                    allowed INTEGER DEFAULT 0,
                    denied INTEGER DEFAULT 0,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                )
            `);
            logger.info('✅ Created hourly_breakdown table');

            await client.query(`
                CREATE TABLE IF NOT EXISTS unique_users (
                    ip INET,
                    game_id VARCHAR(50),
                    first_seen TIMESTAMPTZ DEFAULT NOW(),
                    last_seen TIMESTAMPTZ DEFAULT NOW(),
                    request_count INTEGER DEFAULT 1,
                    PRIMARY KEY (ip, game_id)
                )
            `);
            logger.info('✅ Created unique_users table');

            await client.query(`
                CREATE TABLE IF NOT EXISTS access_logs (
                    id BIGSERIAL PRIMARY KEY,
                    game_id VARCHAR(50),
                    ip INET,
                    user_agent TEXT,
                    status VARCHAR(20),
                    payment_token VARCHAR(50),
                    error_code VARCHAR(50),
                    error_msg TEXT,
                    response_time INTEGER,
                    timestamp TIMESTAMPTZ DEFAULT NOW()
                )
            `);
            logger.info('✅ Created access_logs table');

            // Create indexes for better performance
            await client.query('CREATE INDEX IF NOT EXISTS idx_access_logs_timestamp ON access_logs(timestamp DESC)');
            await client.query('CREATE INDEX IF NOT EXISTS idx_access_logs_status ON access_logs(status)');
            await client.query('CREATE INDEX IF NOT EXISTS idx_access_logs_game ON access_logs(game_id)');
            await client.query('CREATE INDEX IF NOT EXISTS idx_access_logs_error ON access_logs(error_code) WHERE error_code IS NOT NULL');
            await client.query('CREATE INDEX IF NOT EXISTS idx_api_logs_timestamp ON api_logs(timestamp DESC)');
            await client.query('CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date DESC)');
            await client.query('CREATE INDEX IF NOT EXISTS idx_daily_stats_game ON daily_stats(game_id)');
            
            logger.info('✅ Created all indexes');
            logger.info('🎉 Database tables initialized successfully');

        } catch (error) {
            logger.error('❌ Failed to initialize tables:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async initPartitions() {
        // Disabled for now - we'll add this later if needed
        logger.info('📁 Partitioning disabled for now');
        return;
    }

    async logAccess(data) {
        if (!this.initialized) await this.connect();
        
        const log = {
            ...data,
            paymentToken: data.paymentToken?.substring(0, 10),
            timestamp: new Date()
        };
        
        this.buffer.push(log);
        
        if (this.buffer.length >= this.bufferSize) {
            await this.processBatch();
        }
    }

    async processBatch() {
        if (this.buffer.length === 0) return;
        
        const batch = [...this.buffer];
        this.buffer = [];
        
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            
            for (const log of batch) {
                await client.query(`
                    INSERT INTO access_logs 
                    (game_id, ip, user_agent, status, payment_token, error_code, error_msg, response_time, timestamp)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                `, [
                    log.gameId,
                    log.ip,
                    log.userAgent?.substring(0, 255),
                    log.status,
                    log.paymentToken,
                    log.errorCode,
                    log.errorMsg?.substring(0, 255),
                    log.responseTime,
                    log.timestamp
                ]);
            }
            
            await this.updateAggregations(client, batch);
            
            await client.query('COMMIT');
            logger.debug(`Processed batch of ${batch.length} logs`);
        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('Batch insert failed:', error);
            this.buffer.unshift(...batch);
        } finally {
            client.release();
        }
    }

    async updateAggregations(client, batch) {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const hourStr = now.toISOString().slice(0, 13) + ':00:00';
        const weekStart = this.getWeekStart(now);
        const monthStr = dateStr.slice(0, 7) + '-01';
        const year = now.getFullYear();

        const stats = {
            total: batch.length,
            allowed: batch.filter(l => l.status === 'allowed').length,
            denied: batch.filter(l => l.status === 'denied').length,
            errors: batch.filter(l => l.errorCode).length,
            responseTime: Math.round(batch.reduce((sum, l) => sum + (l.responseTime || 0), 0) / batch.length),
            uniqueIPs: new Set(batch.map(l => l.ip)).size
        };

        await client.query(`
            INSERT INTO daily_stats (date, total_requests, allowed, denied, errors, avg_response_time, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            ON CONFLICT (date) DO UPDATE SET
                total_requests = daily_stats.total_requests + EXCLUDED.total_requests,
                allowed = daily_stats.allowed + EXCLUDED.allowed,
                denied = daily_stats.denied + EXCLUDED.denied,
                errors = daily_stats.errors + EXCLUDED.errors,
                avg_response_time = (daily_stats.avg_response_time + EXCLUDED.avg_response_time) / 2,
                updated_at = NOW()
        `, [dateStr, stats.total, stats.allowed, stats.denied, stats.errors, stats.responseTime]);

        await client.query(`
            INSERT INTO weekly_stats (week_start, total_requests, allowed, denied, errors, avg_response_time, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            ON CONFLICT (week_start) DO UPDATE SET
                total_requests = weekly_stats.total_requests + EXCLUDED.total_requests,
                allowed = weekly_stats.allowed + EXCLUDED.allowed,
                denied = weekly_stats.denied + EXCLUDED.denied,
                errors = weekly_stats.errors + EXCLUDED.errors,
                avg_response_time = (weekly_stats.avg_response_time + EXCLUDED.avg_response_time) / 2,
                updated_at = NOW()
        `, [weekStart, stats.total, stats.allowed, stats.denied, stats.errors, stats.responseTime]);

        await client.query(`
            INSERT INTO monthly_stats (month, total_requests, allowed, denied, errors, avg_response_time, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            ON CONFLICT (month) DO UPDATE SET
                total_requests = monthly_stats.total_requests + EXCLUDED.total_requests,
                allowed = monthly_stats.allowed + EXCLUDED.allowed,
                denied = monthly_stats.denied + EXCLUDED.denied,
                errors = monthly_stats.errors + EXCLUDED.errors,
                avg_response_time = (monthly_stats.avg_response_time + EXCLUDED.avg_response_time) / 2,
                updated_at = NOW()
        `, [monthStr, stats.total, stats.allowed, stats.denied, stats.errors, stats.responseTime]);

        await client.query(`
            INSERT INTO yearly_stats (year, total_requests, allowed, denied, errors, avg_response_time, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            ON CONFLICT (year) DO UPDATE SET
                total_requests = yearly_stats.total_requests + EXCLUDED.total_requests,
                allowed = yearly_stats.allowed + EXCLUDED.allowed,
                denied = yearly_stats.denied + EXCLUDED.denied,
                errors = yearly_stats.errors + EXCLUDED.errors,
                avg_response_time = (yearly_stats.avg_response_time + EXCLUDED.avg_response_time) / 2,
                updated_at = NOW()
        `, [year, stats.total, stats.allowed, stats.denied, stats.errors, stats.responseTime]);

        await client.query(`
            INSERT INTO hourly_breakdown (hour, total_requests, allowed, denied)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (hour) DO UPDATE SET
                total_requests = hourly_breakdown.total_requests + EXCLUDED.total_requests,
                allowed = hourly_breakdown.allowed + EXCLUDED.allowed,
                denied = hourly_breakdown.denied + EXCLUDED.denied
        `, [hourStr, stats.total, stats.allowed, stats.denied]);

        for (const log of batch) {
            await client.query(`
                INSERT INTO unique_users (ip, game_id, first_seen, last_seen, request_count)
                VALUES ($1, $2, NOW(), NOW(), 1)
                ON CONFLICT (ip, game_id) DO UPDATE SET
                    last_seen = NOW(),
                    request_count = unique_users.request_count + 1
            `, [log.ip, log.gameId]);
        }
    }

    async logApiCall(data) {
        if (!this.initialized) await this.connect();
        
        const client = await this.pool.connect();
        try {
            await client.query(`
                INSERT INTO api_logs (endpoint, status, res_code, response_time)
                VALUES ($1, $2, $3, $4)
            `, [data.endpoint, data.status, data.resCode, data.responseTime]);
        } finally {
            client.release();
        }
    }

    async getDashboardStats(period = 'day', gameId = 'all') {
        if (!this.initialized) await this.connect();
        
        const client = await this.pool.connect();
        try {
            let current, previous, trend;
            
            switch(period) {
                case 'day':
                    current = await this.getDailyStats(client, 1, gameId);
                    previous = await this.getDailyStats(client, 2, gameId, true);
                    break;
                case 'week':
                    current = await this.getWeeklyStats(client, 1, gameId);
                    previous = await this.getWeeklyStats(client, 2, gameId, true);
                    break;
                case 'month':
                    current = await this.getMonthlyStats(client, 1, gameId);
                    previous = await this.getMonthlyStats(client, 2, gameId, true);
                    break;
                case 'year':
                    current = await this.getYearlyStats(client, 1, gameId);
                    previous = await this.getYearlyStats(client, 2, gameId, true);
                    break;
                default:
                    current = await this.getDailyStats(client, 7, gameId);
            }
            
            if (previous && previous.total_requests > 0) {
                trend = {
                    requests: ((current.total_requests - previous.total_requests) / previous.total_requests * 100).toFixed(1),
                    allowed: ((current.allowed - previous.allowed) / previous.allowed * 100).toFixed(1),
                    denied: ((current.denied - previous.denied) / previous.denied * 100).toFixed(1)
                };
            }
            
            const chartData = await this.getChartData(client, period, gameId);
            const peakHours = await this.getPeakHours(client, period);
            const errors = await this.getRecentErrors(client);
            const apiHealth = await this.getApiHealth(client);
            
            return {
                period,
                gameId,
                current,
                previous,
                trend,
                chartData,
                peakHours,
                errors,
                apiHealth,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            logger.error('Error in getDashboardStats:', error);
            return {
                period,
                gameId,
                current: { total_requests: 0, allowed: 0, denied: 0, errors: 0, avg_response_time: 0, success_rate: '0.0' },
                chartData: [],
                peakHours: [],
                errors: [],
                apiHealth: { api_success: 0, api_failed: 0, api_avg_response: 0, unique_errors: 0 },
                timestamp: new Date().toISOString()
            };
        } finally {
            client.release();
        }
    }

    async getDailyStats(client, days, gameId = 'all', isPrevious = false) {
        const offset = isPrevious ? days : 0;
        
        try {
            const result = await client.query(`
                SELECT 
                    COALESCE(SUM(total_requests), 0) as total_requests,
                    COALESCE(SUM(allowed), 0) as allowed,
                    COALESCE(SUM(denied), 0) as denied,
                    COALESCE(SUM(errors), 0) as errors,
                    COALESCE(AVG(avg_response_time), 0)::INTEGER as avg_response_time,
                    COUNT(DISTINCT date) as days_count
                FROM daily_stats 
                WHERE date > CURRENT_DATE - $1::integer
                AND (game_id = $2 OR $2 = 'all')
            `, [days + offset, gameId]);
            
            const row = result.rows[0] || {
                total_requests: 0,
                allowed: 0,
                denied: 0,
                errors: 0,
                avg_response_time: 0,
                days_count: 0
            };
            
            return {
                total_requests: parseInt(row.total_requests) || 0,
                allowed: parseInt(row.allowed) || 0,
                denied: parseInt(row.denied) || 0,
                errors: parseInt(row.errors) || 0,
                avg_response_time: parseInt(row.avg_response_time) || 0,
                days_count: parseInt(row.days_count) || 0,
                success_rate: row.total_requests > 0 
                    ? ((row.allowed / row.total_requests) * 100).toFixed(1) 
                    : '0.0'
            };
        } catch (error) {
            logger.error('Error in getDailyStats:', error);
            return {
                total_requests: 0,
                allowed: 0,
                denied: 0,
                errors: 0,
                avg_response_time: 0,
                days_count: 0,
                success_rate: '0.0'
            };
        }
    }

    async getWeeklyStats(client, weeks, gameId = 'all', isPrevious = false) {
        const offset = isPrevious ? weeks : 0;
        
        try {
            const result = await client.query(`
                SELECT 
                    COALESCE(SUM(total_requests), 0) as total_requests,
                    COALESCE(SUM(allowed), 0) as allowed,
                    COALESCE(SUM(denied), 0) as denied,
                    COALESCE(SUM(errors), 0) as errors,
                    COALESCE(AVG(avg_response_time), 0)::INTEGER as avg_response_time,
                    COUNT(DISTINCT week_start) as weeks_count
                FROM weekly_stats 
                WHERE week_start > CURRENT_DATE - ($1::integer * 7)::integer
                AND (game_id = $2 OR $2 = 'all')
            `, [weeks + offset, gameId]);
            
            return result.rows[0] || {
                total_requests: 0,
                allowed: 0,
                denied: 0,
                errors: 0,
                avg_response_time: 0,
                weeks_count: 0
            };
        } catch (error) {
            logger.error('Error in getWeeklyStats:', error);
            return {
                total_requests: 0,
                allowed: 0,
                denied: 0,
                errors: 0,
                avg_response_time: 0,
                weeks_count: 0
            };
        }
    }

    async getMonthlyStats(client, months, gameId = 'all', isPrevious = false) {
        const offset = isPrevious ? months : 0;
        
        try {
            const result = await client.query(`
                SELECT 
                    COALESCE(SUM(total_requests), 0) as total_requests,
                    COALESCE(SUM(allowed), 0) as allowed,
                    COALESCE(SUM(denied), 0) as denied,
                    COALESCE(SUM(errors), 0) as errors,
                    COALESCE(AVG(avg_response_time), 0)::INTEGER as avg_response_time,
                    COUNT(DISTINCT month) as months_count
                FROM monthly_stats 
                WHERE month > CURRENT_DATE - INTERVAL '${months + offset} months'
                AND (game_id = $1 OR $1 = 'all')
            `, [gameId]);
            
            return result.rows[0] || {
                total_requests: 0,
                allowed: 0,
                denied: 0,
                errors: 0,
                avg_response_time: 0,
                months_count: 0
            };
        } catch (error) {
            logger.error('Error in getMonthlyStats:', error);
            return {
                total_requests: 0,
                allowed: 0,
                denied: 0,
                errors: 0,
                avg_response_time: 0,
                months_count: 0
            };
        }
    }

    async getYearlyStats(client, years, gameId = 'all', isPrevious = false) {
        const offset = isPrevious ? years : 0;
        
        try {
            const result = await client.query(`
                SELECT 
                    COALESCE(SUM(total_requests), 0) as total_requests,
                    COALESCE(SUM(allowed), 0) as allowed,
                    COALESCE(SUM(denied), 0) as denied,
                    COALESCE(SUM(errors), 0) as errors,
                    COALESCE(AVG(avg_response_time), 0)::INTEGER as avg_response_time,
                    COUNT(DISTINCT year) as years_count
                FROM yearly_stats 
                WHERE year > EXTRACT(YEAR FROM CURRENT_DATE) - $1
                AND (game_id = $2 OR $2 = 'all')
            `, [years + offset, gameId]);
            
            return result.rows[0] || {
                total_requests: 0,
                allowed: 0,
                denied: 0,
                errors: 0,
                avg_response_time: 0,
                years_count: 0
            };
        } catch (error) {
            logger.error('Error in getYearlyStats:', error);
            return {
                total_requests: 0,
                allowed: 0,
                denied: 0,
                errors: 0,
                avg_response_time: 0,
                years_count: 0
            };
        }
    }

    async getChartData(client, period, gameId = 'all') {
        try {
            let query;
            const params = [gameId];
            
            switch(period) {
                case 'day':
                    query = `
                        SELECT 
                            to_char(hour, 'HH24:00') as label,
                            COALESCE(total_requests, 0) as total_requests,
                            COALESCE(allowed, 0) as allowed,
                            COALESCE(denied, 0) as denied
                        FROM hourly_breakdown 
                        WHERE hour > NOW() - INTERVAL '24 hours'
                        ORDER BY hour ASC
                    `;
                    break;
                case 'week':
                    query = `
                        SELECT 
                            to_char(date, 'Dy') as label,
                            COALESCE(total_requests, 0) as total_requests,
                            COALESCE(allowed, 0) as allowed,
                            COALESCE(denied, 0) as denied
                        FROM daily_stats 
                        WHERE date > CURRENT_DATE - 7
                        AND (game_id = $1 OR $1 = 'all')
                        ORDER BY date ASC
                    `;
                    break;
                case 'month':
                    query = `
                        SELECT 
                            to_char(date, 'MM/DD') as label,
                            COALESCE(total_requests, 0) as total_requests,
                            COALESCE(allowed, 0) as allowed,
                            COALESCE(denied, 0) as denied
                        FROM daily_stats 
                        WHERE date > CURRENT_DATE - 30
                        AND (game_id = $1 OR $1 = 'all')
                        ORDER BY date ASC
                    `;
                    break;
                case 'year':
                    query = `
                        SELECT 
                            to_char(month, 'Mon') as label,
                            COALESCE(total_requests, 0) as total_requests,
                            COALESCE(allowed, 0) as allowed,
                            COALESCE(denied, 0) as denied
                        FROM monthly_stats 
                        WHERE month > CURRENT_DATE - INTERVAL '12 months'
                        AND (game_id = $1 OR $1 = 'all')
                        ORDER BY month ASC
                    `;
                    break;
                default:
                    return [];
            }
            
            const result = await client.query(query, params);
            return result.rows || [];
        } catch (error) {
            logger.error('Error in getChartData:', error);
            return [];
        }
    }

    async getPeakHours(client, period) {
        try {
            const result = await client.query(`
                SELECT 
                    EXTRACT(HOUR FROM hour) as hour,
                    COALESCE(AVG(total_requests), 0)::INTEGER as avg_requests
                FROM hourly_breakdown 
                WHERE hour > NOW() - INTERVAL '7 days'
                GROUP BY EXTRACT(HOUR FROM hour)
                ORDER BY avg_requests DESC
                LIMIT 5
            `);
            
            return result.rows || [];
        } catch (error) {
            logger.error('Error in getPeakHours:', error);
            return [];
        }
    }

    async getRecentErrors(client) {
        try {
            const result = await client.query(`
                SELECT 
                    to_char(timestamp, 'YYYY-MM-DD HH24:MI:SS') as timestamp,
                    COALESCE(game_id, 'unknown') as "gameId",
                    COALESCE(error_code, 'UNKNOWN') as "errorCode",
                    COALESCE(error_msg, 'No message') as "errorMsg",
                    COALESCE(ip, '0.0.0.0') as ip
                FROM access_logs 
                WHERE error_code IS NOT NULL 
                ORDER BY timestamp DESC 
                LIMIT 20
            `);
            
            return result.rows || [];
        } catch (error) {
            logger.error('Error in getRecentErrors:', error);
            return [];
        }
    }

    async getApiHealth(client) {
        try {
            const result = await client.query(`
                SELECT 
                    COALESCE(COUNT(*) FILTER (WHERE status = 'success'), 0) as api_success,
                    COALESCE(COUNT(*) FILTER (WHERE status = 'failed'), 0) as api_failed,
                    COALESCE(ROUND(AVG(response_time)), 0)::INTEGER as api_avg_response,
                    COALESCE(COUNT(DISTINCT CASE WHEN status = 'failed' THEN res_code END), 0) as unique_errors
                FROM api_logs
                WHERE timestamp > NOW() - INTERVAL '24 hours'
            `);
            
            return result.rows[0] || { 
                api_success: 0, 
                api_failed: 0, 
                api_avg_response: 0, 
                unique_errors: 0 
            };
        } catch (error) {
            logger.error('Error in getApiHealth:', error);
            return { 
                api_success: 0, 
                api_failed: 0, 
                api_avg_response: 0, 
                unique_errors: 0 
            };
        }
    }

    async verifyToken(token) {
        const authService = require('./auth.service');
        const paymentService = require('./payment.service');
        
        const start = Date.now();
        try {
            const accessToken = await authService.getAccessToken();
            const result = await paymentService._makePaymentCheck('test', token, accessToken);
            
            await this.logApiCall({
                endpoint: 'verify',
                status: 'success',
                resCode: '0',
                responseTime: Date.now() - start
            });
            
            return { valid: true, ...result };
        } catch (error) {
            await this.logApiCall({
                endpoint: 'verify',
                status: 'failed',
                resCode: error.code,
                responseTime: Date.now() - start
            });
            
            return { valid: false, error: error.message };
        }
    }

    getWeekStart(date) {
        const d = new Date(date);
        d.setDate(d.getDate() - d.getDay());
        return d.toISOString().split('T')[0];
    }

    async close() {
        await this.processBatch();
        if (this.pool) {
            await this.pool.end();
            logger.info('Database connection closed');
        }
    }
}

module.exports = new DbService();