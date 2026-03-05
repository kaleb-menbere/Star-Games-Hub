const { Pool } = require('pg');

async function testConnection() {
    const pool = new Pool({
        host: 'localhost',
        port: 5432,
        database: 'game_center',
        user: 'postgres',
        password: 'postgres',
    });

    try {
        const res = await pool.query('SELECT NOW()');
        console.log('✅ Database connected!', res.rows[0]);
        
        // Test creating a simple table
        await pool.query('CREATE TABLE IF NOT EXISTS test_table (id SERIAL PRIMARY KEY, name TEXT)');
        console.log('✅ Can create tables');
        
        await pool.query('DROP TABLE test_table');
        console.log('✅ Can drop tables');
        
    } catch (error) {
        console.error('❌ Database error:', error);
    } finally {
        await pool.end();
    }
}

testConnection();