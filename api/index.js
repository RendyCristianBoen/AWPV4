<<<<<<< HEAD
// Vercel serverless function entry point
=======
// Vercel serverless function - Sistem Perpustakaan
>>>>>>> e7722ad (first commit)
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
<<<<<<< HEAD
const { pool, initializeDatabase } = require('../database');
=======
const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
    host: 'maglev.proxy.rlwy.net',
    port: 15489,
    user: 'root',
    password: 'dZCGhuLCPRWWaSyzXsOXgTpFRuqNiNOE',
    database: 'railway',
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
};

let pool;

// Initialize database connection
async function initDatabase() {
    if (!pool) {
        try {
            pool = mysql.createPool(dbConfig);
            console.log('✅ Database pool created');
        } catch (error) {
            console.error('❌ Database connection error:', error);
            throw error;
        }
    }
    return pool;
}
>>>>>>> e7722ad (first commit)

// Initialize Express app
const app = express();

// Middleware setup
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? 
        ['https://sistem-perpustakaan.vercel.app', 'https://*.vercel.app'] : 
        'http://localhost:3000',
    credentials: true
}));
<<<<<<< HEAD
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Session configuration for Vercel
=======

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Session configuration
>>>>>>> e7722ad (first commit)
app.use(session({
    secret: process.env.SESSION_SECRET || 'perpustakaan-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
<<<<<<< HEAD
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

=======
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Middleware to ensure database connection
app.use(async (req, res, next) => {
    try {
        await initDatabase();
        next();
    } catch (error) {
        console.error('Database connection failed:', error);
        res.status(500).json({ success: false, message: 'Database connection failed' });
    }
});

>>>>>>> e7722ad (first commit)
// Authentication middleware
function requireAuth(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    }
    res.status(401).json({ success: false, message: 'Anda harus login untuk mengakses data ini.' });
}

// Admin/Petugas middleware
function requireAdminOrPetugas(req, res, next) {
    if (req.session && req.session.userId && (req.session.role === 'admin' || req.session.role === 'petugas')) {
        return next();
    }
    res.status(403).json({ success: false, message: 'Akses ditolak. Hanya admin atau petugas yang dapat mengakses fitur ini.' });
}

<<<<<<< HEAD
// Public routes (no auth required)
=======
// Public routes
>>>>>>> e7722ad (first commit)
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'Login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'Register.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'About.html'));
});

// Authentication routes
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username dan password harus diisi' });
        }

        const [users] = await pool.execute(
            'SELECT id, username, password, role, nama, email FROM users WHERE username = ?',
            [username]
        );

        if (users.length > 0) {
            const user = users[0];
            const isValidPassword = await bcrypt.compare(password, user.password);
            
            if (isValidPassword) {
                req.session.userId = user.id;
                req.session.username = user.username;
                req.session.role = user.role;
                req.session.nama = user.nama;
                
                res.json({ 
                    success: true, 
                    user: { 
                        id: user.id, 
                        username: user.username, 
                        role: user.role, 
                        nama: user.nama 
                    } 
                });
            } else {
                res.status(401).json({ success: false, message: 'Username atau password salah' });
            }
        } else {
            res.status(401).json({ success: false, message: 'Username atau password salah' });
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(400).json({ success: false, message: 'Request tidak valid: ' + err.message });
    }
});

app.post('/register', async (req, res) => {
    try {
        const { username, password, email, nama, telepon, alamat } = req.body;
        
        if (!username || !password || !email || !nama) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username, password, email, dan nama harus diisi.' 
            });
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Format email tidak valid.' 
            });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password harus minimal 6 karakter.' 
            });
        }
        
        const [existingUsers] = await pool.execute(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );
        
        if (existingUsers.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username atau email sudah digunakan.' 
            });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [result] = await pool.execute(
            `INSERT INTO users (username, password, email, nama, role, telepon, alamat) 
             VALUES (?, ?, ?, ?, 'pengguna', ?, ?)`,
            [username, hashedPassword, email, nama, telepon || null, alamat || null]
        );
        
        const [newUsers] = await pool.execute(
            'SELECT id, username, email, nama, role, telepon, alamat, created_at FROM users WHERE id = ?',
            [result.insertId]
        );
        
        const newUser = newUsers[0];
        
        res.status(201).json({ 
            success: true, 
            message: 'Registrasi berhasil! Silakan login.',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                nama: newUser.nama,
                role: newUser.role
            }
        });
        
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat registrasi.' 
        });
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Gagal logout' });
        }
        res.json({ success: true, message: 'Logout berhasil' });
    });
});

<<<<<<< HEAD
// Protected routes - require authentication
=======
// Protected routes
>>>>>>> e7722ad (first commit)
app.get('/', (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, '../public', 'Index.html'));
});

app.get('/Catalog.html', (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, '../public', 'Catalog.html'));
});

app.get('/LoanHistory.html', (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, '../public', 'LoanHistory.html'));
});

app.get('/Dashboard.html', (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, '../public', 'Dashboard.html'));
});

<<<<<<< HEAD
// Books data endpoint
=======
// API Routes
>>>>>>> e7722ad (first commit)
app.get('/data', requireAuth, async (req, res) => {
    try {
        const [books] = await pool.execute('SELECT * FROM books');
        res.json(books);
    } catch (error) {
        console.error('Error loading data:', error);
        res.status(500).json({ success: false, message: 'Gagal memuat data buku.' });
    }
});

<<<<<<< HEAD
// Dashboard Analytics
=======
>>>>>>> e7722ad (first commit)
app.get('/dashboard-stats', requireAuth, async (req, res) => {
    try {
        const [totalBooks] = await pool.execute('SELECT COUNT(*) as total FROM books');
        const [totalUsers] = await pool.execute('SELECT COUNT(*) as total FROM users');
        const [activeLoans] = await pool.execute('SELECT COUNT(*) as total FROM loan_history WHERE status = "Dipinjam"');
        const [totalLoans] = await pool.execute('SELECT COUNT(*) as total FROM loan_history');
        const [topRatedBook] = await pool.execute('SELECT judul, rating FROM books ORDER BY rating DESC LIMIT 1');
        
<<<<<<< HEAD
        const [genreStats] = await pool.execute(`
            SELECT genre, COUNT(*) as count 
            FROM books 
            GROUP BY genre 
            ORDER BY count DESC
        `);
        
        const [monthlyStats] = await pool.execute(`
            SELECT DATE_FORMAT(tanggal_pinjam, '%Y-%m') as month, COUNT(*) as count 
            FROM loan_history 
            GROUP BY month 
            ORDER BY month DESC 
            LIMIT 6
        `);

        const [popularBooks] = await pool.execute(`
            SELECT b.*, COUNT(lh.id) as loan_count
            FROM books b 
            LEFT JOIN loan_history lh ON b.id = lh.book_id 
            GROUP BY b.id 
            ORDER BY loan_count DESC 
            LIMIT 5
        `);

=======
>>>>>>> e7722ad (first commit)
        res.json({
            success: true,
            stats: {
                totalBooks: totalBooks[0].total,
                totalUsers: totalUsers[0].total,
                activeLoans: activeLoans[0].total,
                totalLoans: totalLoans[0].total,
<<<<<<< HEAD
                topRatedBook: topRatedBook[0] || { judul: 'Tidak ada', rating: 0 },
                genreDistribution: genreStats,
                monthlyTrends: monthlyStats,
                popularBooks: popularBooks
=======
                topRatedBook: topRatedBook[0] || { judul: 'Tidak ada', rating: 0 }
>>>>>>> e7722ad (first commit)
            }
        });
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        res.status(500).json({ success: false, message: 'Gagal memuat statistik dashboard.' });
    }
});

<<<<<<< HEAD
// Advanced Search
=======
>>>>>>> e7722ad (first commit)
app.get('/search', requireAuth, async (req, res) => {
    try {
        const { q: query, genre, minRating, year, author } = req.query;
        
        let sql = `SELECT * FROM books WHERE 1=1`;
        let params = [];
        
        if (query) {
            sql += ` AND (judul LIKE ? OR penulis LIKE ? OR penerbit LIKE ? OR deskripsi LIKE ?)`;
            const searchTerm = `%${query}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }
        
        if (genre) {
            sql += ` AND genre = ?`;
            params.push(genre);
        }
        
        if (minRating) {
            sql += ` AND rating >= ?`;
            params.push(parseFloat(minRating));
        }
        
        if (year) {
            sql += ` AND tahun_rilis = ?`;
            params.push(parseInt(year));
        }

        if (author) {
            sql += ` AND penulis LIKE ?`;
            params.push(`%${author}%`);
        }
        
        sql += ` ORDER BY rating DESC, judul ASC`;
        
        const [books] = await pool.execute(sql, params);
        
        res.json({ 
            success: true, 
            books, 
            count: books.length,
            filters: { query, genre, minRating, year, author }
        });
    } catch (error) {
        console.error('Error in advanced search:', error);
        res.status(500).json({ success: false, message: 'Gagal melakukan pencarian.' });
    }
});

<<<<<<< HEAD
// Book Recommendations
=======
>>>>>>> e7722ad (first commit)
app.get('/recommendations', requireAuth, async (req, res) => {
    try {
        const { bookId, genre } = req.query;
        
        let recommendations = [];
        
        if (bookId) {
            const [book] = await pool.execute('SELECT genre FROM books WHERE id = ?', [bookId]);
            if (book.length > 0) {
                const [similarBooks] = await pool.execute(`
                    SELECT * FROM books 
                    WHERE genre = ? AND id != ? AND status = 'Tersedia'
                    ORDER BY rating DESC 
                    LIMIT 6
                `, [book[0].genre, bookId]);
                recommendations = similarBooks;
            }
        } else if (genre) {
            const [genreBooks] = await pool.execute(`
                SELECT * FROM books 
                WHERE genre = ? AND status = 'Tersedia'
                ORDER BY rating DESC 
                LIMIT 8
            `, [genre]);
            recommendations = genreBooks;
        } else {
            const [topRated] = await pool.execute(`
                SELECT * FROM books 
                WHERE status = 'Tersedia'
                ORDER BY rating DESC 
                LIMIT 10
            `);
            recommendations = topRated;
        }
        
        res.json({ success: true, recommendations });
    } catch (error) {
        console.error('Error loading recommendations:', error);
        res.status(500).json({ success: false, message: 'Gagal memuat rekomendasi.' });
    }
});

<<<<<<< HEAD
// Popular Books
=======
>>>>>>> e7722ad (first commit)
app.get('/popular-books', requireAuth, async (req, res) => {
    try {
        const [popularBooks] = await pool.execute(`
            SELECT b.*, COUNT(lh.id) as loan_count
            FROM books b 
            LEFT JOIN loan_history lh ON b.id = lh.book_id 
            GROUP BY b.id 
            ORDER BY loan_count DESC, rating DESC
            LIMIT 12
        `);
        
        res.json({ success: true, popularBooks });
    } catch (error) {
        console.error('Error loading popular books:', error);
        res.status(500).json({ success: false, message: 'Gagal memuat buku populer.' });
    }
});

<<<<<<< HEAD
// User Reading History
=======
>>>>>>> e7722ad (first commit)
app.get('/reading-history', requireAuth, async (req, res) => {
    try {
        const [readingHistory] = await pool.execute(`
            SELECT lh.*, b.judul, b.penulis, b.gambar, b.genre, b.rating
            FROM loan_history lh 
            JOIN books b ON lh.book_id = b.id 
            WHERE lh.user_id = ? 
            ORDER BY lh.tanggal_pinjam DESC
            LIMIT 20
        `, [req.session.userId]);
        
        res.json({ success: true, readingHistory });
    } catch (error) {
        console.error('Error loading reading history:', error);
        res.status(500).json({ success: false, message: 'Gagal memuat riwayat membaca.' });
    }
});

<<<<<<< HEAD
// Get loan history
=======
>>>>>>> e7722ad (first commit)
app.get('/loan-history', requireAuth, async (req, res) => {
    try {
        let query = `
            SELECT lh.*, b.judul, b.penulis, b.gambar, u.nama as nama_peminjam 
            FROM loan_history lh 
            JOIN books b ON lh.book_id = b.id 
            JOIN users u ON lh.user_id = u.id
        `;
        
        let params = [];
        
        if (req.session.role === 'pengguna') {
            query += ' WHERE lh.user_id = ?';
            params.push(req.session.userId);
        }
        
        query += ' ORDER BY lh.tanggal_pinjam DESC';
        
        const [loans] = await pool.execute(query, params);
        
        res.json({ success: true, loans });
    } catch (error) {
        console.error('Error loading loan history:', error);
        res.status(500).json({ success: false, message: 'Gagal memuat riwayat peminjaman.' });
    }
});

<<<<<<< HEAD
// Get single book by ID
=======
>>>>>>> e7722ad (first commit)
app.get('/book/:id', requireAuth, async (req, res) => {
    try {
        const bookId = parseInt(req.params.id);
        const [books] = await pool.execute('SELECT * FROM books WHERE id = ?', [bookId]);
        if (books.length > 0) {
            res.json({ success: true, book: books[0] });
        } else {
            res.status(404).json({ success: false, message: 'Buku tidak ditemukan.' });
        }
    } catch (error) {
        console.error('Error fetching book:', error);
        res.status(500).json({ success: false, message: 'Gagal memuat data buku.' });
    }
});

<<<<<<< HEAD
// Add new book (Admin/Petugas only)
=======
// Book CRUD routes
>>>>>>> e7722ad (first commit)
app.post('/book', requireAdminOrPetugas, async (req, res) => {
    try {
        const { judul, tahunRilis, penulis, penerbit, genre, gambar, deskripsi, isbn, rating } = req.body;

        if (!judul || !tahunRilis || !penulis || !penerbit || !genre || !gambar || !deskripsi || !isbn || !rating) {
            return res.status(400).json({ success: false, message: 'Semua kolom harus diisi.' });
        }
        
        const currentYear = new Date().getFullYear();
        const parsedTahunRilis = parseInt(tahunRilis);
        if (isNaN(parsedTahunRilis) || parsedTahunRilis < 1000 || parsedTahunRilis > currentYear) {
            return res.status(400).json({ success: false, message: `Tahun Rilis tidak valid. Harus antara 1000 dan ${currentYear}.` });
        }
        
        const parsedRating = parseFloat(rating);
        if (isNaN(parsedRating) || parsedRating < 0 || parsedRating > 5) {
            return res.status(400).json({ success: false, message: 'Rating tidak valid. Harus angka antara 0 dan 5.' });
        }

        const [result] = await pool.execute(
            `INSERT INTO books (judul, tahun_rilis, penulis, penerbit, genre, gambar, deskripsi, isbn, rating) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [judul, parsedTahunRilis, penulis, penerbit, genre, gambar, deskripsi, isbn, parsedRating]
        );

        const newBook = {
            id: result.insertId,
            judul,
            tahunRilis: parsedTahunRilis,
            penulis,
            penerbit,
            genre,
            status: "Tersedia",
            gambar,
            deskripsi,
            isbn,
            rating: parsedRating
        };
        
        res.status(201).json({ success: true, message: 'Buku berhasil ditambahkan.', book: newBook });
    } catch (err) {
        console.error("Error adding book:", err);
        res.status(400).json({ success: false, message: 'Request tidak valid atau format JSON salah.' });
    }
});

<<<<<<< HEAD
// Update book (Admin/Petugas only)
=======
>>>>>>> e7722ad (first commit)
app.put('/book/:id', requireAdminOrPetugas, async (req, res) => {
    try {
        const bookId = parseInt(req.params.id);
        const { judul, tahunRilis, penulis, penerbit, genre, gambar, deskripsi, isbn, rating } = req.body;

        if (!judul || !tahunRilis || !penulis || !penerbit || !genre || !gambar || !deskripsi || !isbn || !rating) {
            return res.status(400).json({ success: false, message: 'Semua kolom harus diisi.' });
        }
        
        const currentYear = new Date().getFullYear();
        const parsedTahunRilis = parseInt(tahunRilis);
        if (isNaN(parsedTahunRilis) || parsedTahunRilis < 1000 || parsedTahunRilis > currentYear) {
            return res.status(400).json({ success: false, message: `Tahun Rilis tidak valid. Harus antara 1000 dan ${currentYear}.` });
        }
        
        const parsedRating = parseFloat(rating);
        if (isNaN(parsedRating) || parsedRating < 0 || parsedRating > 5) {
            return res.status(400).json({ success: false, message: 'Rating tidak valid. Harus angka antara 0 dan 5.' });
        }

        const [result] = await pool.execute(
            `UPDATE books SET judul = ?, tahun_rilis = ?, penulis = ?, penerbit = ?, genre = ?, 
             gambar = ?, deskripsi = ?, isbn = ?, rating = ? WHERE id = ?`,
            [judul, parsedTahunRilis, penulis, penerbit, genre, gambar, deskripsi, isbn, parsedRating, bookId]
        );

        if (result.affectedRows > 0) {
            const [updatedBooks] = await pool.execute('SELECT * FROM books WHERE id = ?', [bookId]);
            res.json({ success: true, message: 'Buku berhasil diperbarui.', book: updatedBooks[0] });
        } else {
            res.status(404).json({ success: false, message: 'Buku tidak ditemukan.' });
        }
    } catch (err) {
        console.error("Error updating book:", err);
        res.status(400).json({ success: false, message: 'Request tidak valid atau format JSON salah.' });
    }
});

<<<<<<< HEAD
// Delete book (Admin/Petugas only)
=======
>>>>>>> e7722ad (first commit)
app.delete('/book/:id', requireAdminOrPetugas, async (req, res) => {
    try {
        const bookId = parseInt(req.params.id);
        const [result] = await pool.execute('DELETE FROM books WHERE id = ?', [bookId]);
        
        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Buku berhasil dihapus.' });
        } else {
            res.status(404).json({ success: false, message: 'Buku tidak ditemukan.' });
        }
    } catch (error) {
        console.error("Error deleting book:", error);
        res.status(500).json({ success: false, message: 'Gagal menghapus buku.' });
    }
});

<<<<<<< HEAD
// Change book status (borrow/return)
=======
// Book status change
>>>>>>> e7722ad (first commit)
app.post('/book/status/:id', requireAuth, async (req, res) => {
    try {
        const bookId = parseInt(req.params.id);
        const { status: newStatus, durasiHari = 7 } = req.body;
        
        if (!['Tersedia', 'Dipinjam'].includes(newStatus)) {
            return res.status(400).json({ success: false, message: 'Status buku tidak valid.' });
        }

        const [books] = await pool.execute('SELECT * FROM books WHERE id = ?', [bookId]);
        if (books.length === 0) {
            return res.status(404).json({ success: false, message: 'Buku tidak ditemukan.' });
        }

        const book = books[0];
        
        if (newStatus === 'Dipinjam') {
            if (req.session.role === 'pengguna' && book.status !== 'Tersedia') {
                return res.status(400).json({ success: false, message: 'Buku tidak tersedia untuk dipinjam.' });
            }
            
            await pool.execute('UPDATE books SET status = ? WHERE id = ?', [newStatus, bookId]);
            
            const batasPengembalian = new Date();
            batasPengembalian.setDate(batasPengembalian.getDate() + durasiHari);
            
            await pool.execute(
                `INSERT INTO loan_history (user_id, book_id, batas_pengembalian, status, durasi_hari) 
                 VALUES (?, ?, ?, 'Dipinjam', ?)`,
                [req.session.userId, bookId, batasPengembalian, durasiHari]
            );
            
        } else if (newStatus === 'Tersedia') {
            if (req.session.role === 'pengguna') {
                return res.status(403).json({ success: false, message: 'Akses ditolak. Untuk pengembalian, gunakan fitur pengembalian di halaman riwayat.' });
            }
            
            await pool.execute('UPDATE books SET status = ? WHERE id = ?', [newStatus, bookId]);
            
            const [activeLoans] = await pool.execute(
                'SELECT * FROM loan_history WHERE book_id = ? AND status = "Dipinjam" ORDER BY id DESC LIMIT 1',
                [bookId]
            );
            
            if (activeLoans.length > 0) {
                const loan = activeLoans[0];
                const sekarang = new Date();
                const batas = new Date(loan.batas_pengembalian);
                let denda = 0;
                let statusKembali = 'Dikembalikan';
                
                if (sekarang > batas) {
                    const hariTerlambat = Math.ceil((sekarang - batas) / (1000 * 60 * 60 * 24));
                    denda = hariTerlambat * 1000;
                    statusKembali = 'Terlambat';
                }
                
                await pool.execute(
                    `UPDATE loan_history 
                     SET tanggal_kembali = ?, status = ?, denda = ? 
                     WHERE id = ?`,
                    [sekarang, statusKembali, denda, loan.id]
                );
            }
        }

        const [updatedBooks] = await pool.execute('SELECT * FROM books WHERE id = ?', [bookId]);
        
        res.json({ 
            success: true, 
            book: updatedBooks[0],
            message: newStatus === 'Dipinjam' ? 
                `Buku berhasil dipinjam untuk ${durasiHari} hari` : 
                'Buku berhasil dikembalikan'
        });
    } catch (err) {
        console.error('Error changing book status:', err);
        res.status(400).json({ success: false, message: 'Request tidak valid' });
    }
});

// Return book
app.post('/return-book/:id', requireAuth, async (req, res) => {
    try {
        const loanId = parseInt(req.params.id);
        
        let query = 'SELECT lh.*, b.judul FROM loan_history lh JOIN books b ON lh.book_id = b.id WHERE lh.id = ?';
        let params = [loanId];
        
        if (req.session.role === 'pengguna') {
            query += ' AND lh.user_id = ?';
            params.push(req.session.userId);
        }
        
        const [loans] = await pool.execute(query, params);
        
        if (loans.length === 0) {
            return res.status(404).json({ success: false, message: 'Riwayat peminjaman tidak ditemukan atau Anda tidak memiliki akses.' });
        }

        const loan = loans[0];
        
        if (loan.status !== 'Dipinjam' && loan.status !== 'Terlambat') {
            return res.status(400).json({ success: false, message: 'Buku sudah dikembalikan sebelumnya.' });
        }

        await pool.execute('UPDATE books SET status = "Tersedia" WHERE id = ?', [loan.book_id]);
        
        const sekarang = new Date();
        const batas = new Date(loan.batas_pengembalian);
        let denda = 0;
        let statusKembali = 'Dikembalikan';
        
        if (sekarang > batas) {
            const hariTerlambat = Math.ceil((sekarang - batas) / (1000 * 60 * 60 * 24));
            denda = hariTerlambat * 1000;
            statusKembali = 'Terlambat';
        }
        
        await pool.execute(
            `UPDATE loan_history 
             SET tanggal_kembali = ?, status = ?, denda = ? 
             WHERE id = ?`,
            [sekarang, statusKembali, denda, loan.id]
        );

        res.json({ 
            success: true, 
            message: `Buku "${loan.judul}" berhasil dikembalikan.${denda > 0 ? ` Denda: Rp ${denda.toLocaleString('id-ID')}` : ''}`,
            denda: denda
        });
    } catch (err) {
        console.error('Error returning book:', err);
        res.status(400).json({ success: false, message: 'Request tidak valid' });
    }
});

<<<<<<< HEAD
// Export CSV loan history
app.get('/export-loan-history', requireAuth, async (req, res) => {
    try {
        const { status, sort = 'tanggal_pinjam', order = 'desc' } = req.query;
        const sortMap = {
            judul: 'b.judul',
            penulis: 'b.penulis',
            peminjam: 'u.nama',
            tanggal_pinjam: 'lh.tanggal_pinjam',
            batas_pengembalian: 'lh.batas_pengembalian',
            tanggal_kembali: 'lh.tanggal_kembali',
            durasi_hari: 'lh.durasi_hari',
            status: 'lh.status',
            denda: 'lh.denda'
        };
        const orderBy = sortMap[sort] || 'lh.tanggal_pinjam';
        const orderDirection = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

        let baseSql = `
            FROM loan_history lh 
            JOIN books b ON lh.book_id = b.id 
            JOIN users u ON lh.user_id = u.id
        `;
        const where = [];
        const params = [];
        if (req.session.role === 'pengguna') {
            where.push('lh.user_id = ?');
            params.push(req.session.userId);
        }
        if (status) {
            if (status === 'Terlambat') {
                where.push("((lh.status = 'Dipinjam' AND lh.batas_pengembalian < NOW()) OR lh.status = 'Terlambat'))");
            } else {
                where.push('lh.status = ?');
                params.push(status);
            }
        }
        const whereSql = where.length ? ' WHERE ' + where.join(' AND ') : '';

        const [rows] = await pool.execute(
            `SELECT lh.*, b.judul, b.penulis, b.gambar, u.nama as nama_peminjam ${baseSql} ${whereSql} ORDER BY ${orderBy} ${orderDirection}`,
            params
        );

        const header = ['Judul','Penulis','Peminjam','TanggalPinjam','BatasKembali','TanggalKembali','Durasi(hari)','Status','Denda'];
        const csvLines = [header.join(',')];
        for (const r of rows) {
            const statusDisplay = r.status;
            const vals = [
                r.judul, r.penulis, r.nama_peminjam,
                r.tanggal_pinjam ? new Date(r.tanggal_pinjam).toISOString() : '',
                r.batas_pengembalian ? new Date(r.batas_pengembalian).toISOString() : '',
                r.tanggal_kembali ? new Date(r.tanggal_kembali).toISOString() : '',
                r.durasi_hari || 0,
                statusDisplay,
                r.denda || 0
            ].map(v => '"' + String(v).replace(/"/g,'""') + '"');
            csvLines.push(vals.join(','));
        }
        const csv = csvLines.join('\n');
        res.set({
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': 'attachment; filename="loan-history.csv"'
        });
        res.send(csv);
    } catch (err) {
        console.error('Error exporting CSV:', err);
        res.status(500).json({ success: false, message: 'Gagal mengekspor CSV.' });
    }
});

=======
>>>>>>> e7722ad (first commit)
// Serve images
app.get('/images/*', (req, res) => {
    const imagePath = path.join(__dirname, '../public', 'images', req.params[0]);
    if (fs.existsSync(imagePath)) {
        res.sendFile(imagePath);
    } else {
<<<<<<< HEAD
        const placeholderPath = path.join(__dirname, '../public', 'images', 'default-book.jpg');
        if (fs.existsSync(placeholderPath)) {
            res.sendFile(placeholderPath);
        } else {
            res.status(404).send('Image not found');
        }
=======
        res.status(404).send('Image not found');
>>>>>>> e7722ad (first commit)
    }
});

// 404 handler
app.use((req, res) => {
    if (!req.session || !req.session.userId) {
        return res.redirect('/login');
    }
    res.status(404).send('404 Not Found');
});

<<<<<<< HEAD
// Initialize database and export app
module.exports = async (req, res) => {
    try {
        await initializeDatabase();
        return app(req, res);
    } catch (error) {
        console.error('Database initialization error:', error);
        res.status(500).json({ success: false, message: 'Database connection failed' });
    }
};
=======
// Export app for Vercel
module.exports = app;
>>>>>>> e7722ad (first commit)
