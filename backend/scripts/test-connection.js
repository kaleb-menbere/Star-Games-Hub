const { Pool } = require('pg');
require('dotenv').config();

async function testConnection() {
    const pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'gamecenter',
        user: 'postgres', // Hardcode for testing
        password: 'postgres', // Hardcode for testing
    });

    try {
        console.log('🔌 Testing connection to PostgreSQL...');
        const res = await pool.query('SELECT version()');
        console.log('✅ Successfully connected to PostgreSQL!');
        console.log('📊 Version:', res.rows[0].version);
        
        // Test creating a simple table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS connection_test (
                id SERIAL PRIMARY KEY,
                test_time TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('✅ Table creation test passed');
        
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
    } finally {
        await pool.end();
    }
}

testConnection();