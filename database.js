const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

// Path untuk database SQLite
const dbPath = path.join(__dirname, 'perpustakaan.db');

// Buat koneksi database SQLite
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error connecting to SQLite database:', err.message);
    } else {
        console.log('✅ Connected to SQLite database');
    }
});

// Fungsi untuk menjalankan query dengan promise
function runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: this.lastID, changes: this.changes });
            }
        });
    });
}

// Fungsi untuk mendapatkan data dengan promise
function getQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

// Fungsi untuk mendapatkan banyak data dengan promise
function allQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

async function initializeDatabase() {
    try {
        console.log('🔄 Initializing SQLite database...');
        
        // ✅ BUAT TABLE: users 
        await runQuery(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                email TEXT UNIQUE,
                nama TEXT NOT NULL,
                role TEXT CHECK(role IN ('admin', 'petugas', 'pengguna')) DEFAULT 'pengguna',
                telepon TEXT,
                alamat TEXT,
                status TEXT CHECK(status IN ('active', 'inactive')) DEFAULT 'active',
                last_login TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Users table created/checked');
        
        // ✅ BUAT TABLE: books
        await runQuery(`
            CREATE TABLE IF NOT EXISTS books (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                judul TEXT NOT NULL,
                tahun_rilis INTEGER NOT NULL,
                penulis TEXT NOT NULL,
                penerbit TEXT NOT NULL,
                genre TEXT NOT NULL,
                status TEXT CHECK(status IN ('Tersedia', 'Dipinjam', 'Dalam Perbaikan')) DEFAULT 'Tersedia',
                gambar TEXT,
                deskripsi TEXT,
                isbn TEXT,
                rating REAL DEFAULT 0.0,
                total_dipinjam INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Books table created/checked');
        
        // ✅ BUAT TABLE: loan_history
        await runQuery(`
            CREATE TABLE IF NOT EXISTS loan_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                book_id INTEGER NOT NULL,
                tanggal_pinjam DATETIME DEFAULT CURRENT_TIMESTAMP,
                tanggal_kembali DATETIME NULL,
                batas_pengembalian DATETIME NOT NULL,
                status TEXT CHECK(status IN ('Dipinjam', 'Dikembalikan', 'Terlambat', 'Hilang')) DEFAULT 'Dipinjam',
                denda REAL DEFAULT 0.00,
                durasi_hari INTEGER DEFAULT 7,
                catatan TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Loan history table created/checked');

        // ✅ BUAT TABLE: book_reviews
        await runQuery(`
            CREATE TABLE IF NOT EXISTS book_reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                book_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                rating INTEGER CHECK(rating BETWEEN 1 AND 5) NOT NULL,
                review TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Book reviews table created/checked');

        // ✅ BUAT TABLE: notifications
        await runQuery(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                message TEXT NOT NULL,
                type TEXT CHECK(type IN ('info', 'warning', 'success', 'error')) DEFAULT 'info',
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Notifications table created/checked');

        console.log('✅ Database initialization completed successfully');
        
    } catch (error) {
        console.error('❌ Error initializing database:', error.message);
        throw error;
    }
}

// Export fungsi-fungsi database
module.exports = {
    db,
    runQuery,
    getQuery,
    allQuery,
    initializeDatabase
};