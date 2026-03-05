const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    // Server
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    
    // Database - PostgreSQL
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: process.env.DB_PORT || 5432,
    DB_NAME: process.env.DB_NAME || 'gamecenter',
    DB_USER: process.env.DB_USER || 'postgres',
    DB_PASSWORD: process.env.DB_PASSWORD || 'postgres',
    
    // JWT
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-this',
    JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
    
    // Email (Gmail SMTP)
    EMAIL_USERNAME: process.env.EMAIL_USERNAME,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD, // Use Gmail App Password
    EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@gamecenter.com',
    
    // Frontend URL
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
    
    // Verification
    VERIFICATION_TOKEN_EXPIRE: process.env.VERIFICATION_TOKEN_EXPIRE || '24h',
    
    // Helpers
    IS_PROD: process.env.NODE_ENV === 'production',
    IS_DEV: process.env.NODE_ENV === 'development'
};