const { Sequelize } = require('sequelize');
const env = require('./environment');
const logger = require('../services/logger.service');

const sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
    host: env.DB_HOST,
    port: env.DB_PORT,
    dialect: 'postgres',
    logging: (msg) => logger.debug(msg),
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        logger.info('PostgreSQL connected successfully');
        
        // Sync models in development
        if (env.IS_DEV) {
            await sequelize.sync({ alter: true });
            logger.info('Database synced');
        }
    } catch (error) {
        logger.error('Unable to connect to PostgreSQL:', error);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };