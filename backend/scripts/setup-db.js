const { Pool } = require('pg');
require('dotenv').config();

async function setupDatabase() {
    // Connect using root user
    const rootPool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: 'postgres', // Connect to default db
        user: 'postgres', // Using root user
        password: 'postgres', // Using postgres password
    });

    try {
        console.log('🔌 Connecting to PostgreSQL as root...');
        
        // Check if database exists
        const dbCheck = await rootPool.query(`
            SELECT 1 FROM pg_database WHERE datname = '${process.env.DB_NAME}'
        `);

        if (dbCheck.rows.length === 0) {
            console.log(`📁 Creating database: ${process.env.DB_NAME}`);
            await rootPool.query(`
                CREATE DATABASE ${process.env.DB_NAME}
            `);
            console.log('✅ Database created successfully');
        } else {
            console.log('📁 Database already exists');
        }

        console.log('\n✅ Setup complete! You can now run your application.');
        console.log(`📊 Database: ${process.env.DB_NAME}`);
        console.log(`👤 User: root`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n📝 Troubleshooting tips:');
        console.log('1. Make sure PostgreSQL is running');
        console.log('2. Check if root user exists: psql -U root -h localhost -d postgres');
        console.log('3. Verify password is "postgres"');
    } finally {
        await rootPool.end();
    }
}

setupDatabase();