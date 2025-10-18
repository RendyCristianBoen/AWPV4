// reset-db.js - UPDATED VERSION
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function resetDatabase() {
    let connection;
    try {
        // Buat koneksi tanpa database terlebih dahulu
        connection = await mysql.createConnection({
            host: "maglev.proxy.rlwy.net",
            port: 15489,
            user: "root",
            password: "dZCGhuLCPRWWaSyzXsOXgTpFRuqNiNOE",
            database: "railway"
        });

        console.log('🔄 Resetting database...');
        
        // Drop database jika ada
        await connection.query('DROP DATABASE IF EXISTS perpustakaan_db');
        console.log('✅ Database dropped');
        
        // Create database baru
        await connection.query('CREATE DATABASE perpustakaan_db');
        console.log('✅ Database created');
        
        await connection.end();
        console.log('✅ Database reset successfully');
        
        // Tunggu sebentar untuk memastikan database benar-benar dibuat
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Sekarang initialize database dengan data baru
        console.log('🔄 Initializing database with tables and sample data...');
        const { initializeDatabase } = require('./database');
        await initializeDatabase();
        
        console.log('🎉 Database reset and initialization completed!');
        console.log('📚 You can now start the server with: node server.js');
        console.log('🔐 Default login credentials:');
        console.log('   👑 Admin: admin / admin123');

        
    } catch (error) {
        console.error('❌ Error resetting database:', error.message);
        console.error('Error details:', error);
        if (connection) await connection.end();
    }
}

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
    console.error('💥 Unhandled Promise Rejection:', err);
    process.exit(1);
});

resetDatabase();