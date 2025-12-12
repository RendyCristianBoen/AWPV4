const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

// Konfigurasi koneksi MySQL XAMPP
const dbConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '', // Password MySQL XAMPP (biasanya kosong)
    database: 'perpustakaan_db',
    charset: 'utf8mb4',
    connectTimeout: 60000,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
};

// Buat connection pool untuk MySQL
let pool;

try {
    pool = mysql.createPool(dbConfig);
    console.log('✅ Connected to MySQL XAMPP database');
} catch (err) {
    console.error('❌ Error creating MySQL connection pool:', err.message);
    process.exit(1);
}

// Fungsi untuk menjalankan query dengan promise
async function runQuery(sql, params = []) {
    try {
        const [result] = await pool.execute(sql, params);
        return result;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

// Fungsi untuk mendapatkan single row
async function getQuery(sql, params = []) {
    try {
        const [rows] = await pool.execute(sql, params);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('Database get query error:', error);
        throw error;
    }
}

// Fungsi untuk mendapatkan semua rows
async function allQuery(sql, params = []) {
    try {
        const [rows] = await pool.execute(sql, params);
        return rows;
    } catch (error) {
        console.error('Database all query error:', error);
        throw error;
    }
}

// Fungsi untuk inisialisasi database (jika diperlukan)
async function initializeDatabase() {
    try {
        console.log('✅ Database MySQL sudah terhubung, tidak perlu inisialisasi khusus');
        return true;
    } catch (error) {
        console.error('❌ Error initializing database:', error);
        throw error;
    }
}

// Export functions
module.exports = {
    pool,
    runQuery,
    getQuery,
    allQuery,
    initializeDatabase
};