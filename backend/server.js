require('dotenv').config();
const app = require('./src/app');
const env = require('./src/config/environment');
const { connectDB } = require('./src/config/database');
const logger = require('./src/services/logger.service');

 
const PORT = env.PORT;

// Better error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ UNCAUGHT EXCEPTION:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    logger.error('Uncaught Exception', { 
        error: error.message, 
        stack: error.stack,
        name: error.name 
    });
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ UNHANDLED REJECTION:');
    console.error('Reason:', reason);
    logger.error('Unhandled Rejection', { reason, promise });
});

// Connect to PostgreSQL
console.log('📦 Attempting to connect to PostgreSQL...');
connectDB().then(() => {
    console.log('✅ PostgreSQL connected successfully');
    
    const server = app.listen(PORT, () => {
        console.log(`
    ╔════════════════════════════════════════════╗
    ║     Star Games Hub Backend Started            ║
    ╠════════════════════════════════════════════╣
    ║ Port: ${PORT}                                      
    ║ Mode: ${env.NODE_ENV}                                  
    ║ Database: PostgreSQL                       
    ║ API: http://localhost:${PORT}/api/v1            
    ║ Games: http://localhost:${PORT}/games          
    ╚════════════════════════════════════════════╝
        `);
        
        logger.info(`Server started in ${env.NODE_ENV} mode on port ${PORT}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
        logger.info('SIGTERM received, shutting down gracefully');
        server.close(() => {
            logger.info('Process terminated');
            process.exit(0);
        });
    });
}).catch(error => {
    console.error('❌ Failed to connect to database:');
    console.error('Error:', error);
    process.exit(1);
});