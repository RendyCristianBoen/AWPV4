// Server.js - SISTEM PERPUSTAKAAN UPGRADE FULL FEATURE (FIXED)
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
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

// Initialize database
async function initializeDatabase() {
    if (!pool) {
        pool = mysql.createPool(dbConfig);
        console.log('✅ Database connected');
    }
    return pool;
}

// Session management functions
const sessions = {};

function createSession(user) {
    const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessions[sessionId] = {
        userId: user.id,
        username: user.username,
        role: user.role,
        nama: user.nama,
        createdAt: new Date()
    };
    return sessionId;
}

function verifySession(sessionId) {
    return sessions[sessionId];
}

// Initialize Express app
const app = express();

// Middleware setup
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// ✅ FIX: Static files dari folder public
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    secret: 'perpustakaan-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Database middleware
app.use(async (req, res, next) => {
    try {
        await initializeDatabase();
        next();
    } catch (error) {
        res.status(500).json({ success: false, message: 'Database error' });
    }
});

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

// ==================== ROUTES ====================

// HTML Routes - Express akan otomatis serve file dari public folder
// Tidak perlu route manual untuk file HTML karena sudah ada express.static

// API Routes
app.post('/api/login', async (req, res) => {
    try {
        console.log('Login request received:', req.body);
        
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username dan password harus diisi' });
        }

        const [users] = await pool.execute(
            'SELECT id, username, password, role, nama, email FROM users WHERE username = ?',
            [username]
        );
        
        console.log('Database query result:', users.length, 'users found');

        if (users.length > 0) {
            const user = users[0];
            
            const isValidPassword = await bcrypt.compare(password, user.password);
            
            if (isValidPassword) {
                const sessionId = createSession(user);
                res.cookie('sessionId', sessionId, { 
                    httpOnly: true, 
                    path: '/', 
                    maxAge: 86400000,
                    sameSite: 'strict'
                });
                
                res.json({ 
                    success: true, 
                    user: { 
                        id: user.id, 
                        username: user.username, 
                        role: user.role, 
                        nama: user.nama 
                    } 
                });
                console.log('Login successful for user:', user.username);
            } else {
                console.log('Login failed - invalid password for user:', username);
                res.status(401).json({ success: false, message: 'Username atau password salah' });
            }
        } else {
            console.log('Login failed - user not found:', username);
            res.status(401).json({ success: false, message: 'Username atau password salah' });
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(400).json({ success: false, message: 'Request tidak valid: ' + err.message });
    }
});

app.post('/api/register', async (req, res) => {
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
        
        console.log('New user registered:', username);
        
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan saat registrasi.' 
        });
    }
});

app.post('/api/logout', (req, res) => {
    const sessionId = req.cookies.sessionId;
    if (sessionId && sessions[sessionId]) {
        delete sessions[sessionId];
    }
    res.clearCookie('sessionId');
    res.json({ success: true, message: 'Logout berhasil' });
});

app.get('/api/check-session', (req, res) => {
    const sessionId = req.cookies.sessionId;
    const session = sessionId ? verifySession(sessionId) : null;
    
    if (session) {
        res.json({
            success: true,
            isLoggedIn: true,
            user: {
                id: session.userId,
                username: session.username,
                role: session.role,
                nama: session.nama
            }
        });
    } else {
        res.json({ success: true, isLoggedIn: false });
    }
});

// 🆕 DASHBOARD ANALYTICS
app.get('/api/dashboard-stats', requireAuth, async (req, res) => {
    try {
        const [totalBooks] = await pool.execute('SELECT COUNT(*) as total FROM books');
        const [totalUsers] = await pool.execute('SELECT COUNT(*) as total FROM users');
        const [activeLoans] = await pool.execute('SELECT COUNT(*) as total FROM loan_history WHERE status = "Dipinjam"');
        const [totalLoans] = await pool.execute('SELECT COUNT(*) as total FROM loan_history');
        const [topRatedBook] = await pool.execute('SELECT judul, rating FROM books ORDER BY rating DESC LIMIT 1');
        
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

        res.json({
            success: true,
            stats: {
                totalBooks: totalBooks[0].total,
                totalUsers: totalUsers[0].total,
                activeLoans: activeLoans[0].total,
                totalLoans: totalLoans[0].total,
                topRatedBook: topRatedBook[0] || { judul: 'Tidak ada', rating: 0 },
                genreDistribution: genreStats,
                monthlyTrends: monthlyStats,
                popularBooks: popularBooks
            }
        });
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        res.status(500).json({ success: false, message: 'Gagal memuat statistik dashboard.' });
    }
});

// 🆕 ADVANCED SEARCH
app.get('/api/search', requireAuth, async (req, res) => {
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

// 🆕 BOOK RECOMMENDATIONS
app.get('/api/recommendations', requireAuth, async (req, res) => {
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

// 🆕 POPULAR BOOKS
app.get('/api/popular-books', requireAuth, async (req, res) => {
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

// 🆕 USER READING HISTORY
app.get('/api/reading-history', requireAuth, async (req, res) => {
    try {
        const sessionId = req.cookies.sessionId;
        const session = verifySession(sessionId);
        
        const [readingHistory] = await pool.execute(`
            SELECT lh.*, b.judul, b.penulis, b.gambar, b.genre, b.rating
            FROM loan_history lh 
            JOIN books b ON lh.book_id = b.id 
            WHERE lh.user_id = ? 
            ORDER BY lh.tanggal_pinjam DESC
            LIMIT 20
        `, [session.userId]);
        
        res.json({ success: true, readingHistory });
    } catch (error) {
        console.error('Error loading reading history:', error);
        res.status(500).json({ success: false, message: 'Gagal memuat riwayat membaca.' });
    }
});

// Books API
app.get('/api/books', requireAuth, async (req, res) => {
    try {
        const [books] = await pool.execute('SELECT * FROM books');
        res.json(books);
    } catch (error) {
        console.error('Error loading data:', error);
        res.status(500).json({ success: false, message: 'Gagal memuat data buku.' });
    }
});

app.get('/api/book/:id', requireAuth, async (req, res) => {
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

// LOAN HISTORY
app.get('/api/loan-history', requireAuth, async (req, res) => {
    try {
        const sessionId = req.cookies.sessionId;
        const session = verifySession(sessionId);
        
        let query = `
            SELECT lh.*, b.judul, b.penulis, b.gambar, u.nama as nama_peminjam 
            FROM loan_history lh 
            JOIN books b ON lh.book_id = b.id 
            JOIN users u ON lh.user_id = u.id
        `;
        
        let params = [];
        
        if (session.role === 'pengguna') {
            query += ' WHERE lh.user_id = ?';
            params.push(session.userId);
        }
        
        query += ' ORDER BY lh.tanggal_pinjam DESC';
        
        const [loans] = await pool.execute(query, params);
        
        res.json({ success: true, loans });
    } catch (error) {
        console.error('Error loading loan history:', error);
        res.status(500).json({ success: false, message: 'Gagal memuat riwayat peminjaman.' });
    }
});

// Book CRUD routes
app.post('/api/book', requireAdminOrPetugas, async (req, res) => {
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

// ... (tambahkan semua route lainnya)

// ==================== START SERVER ====================

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
    console.log(`📚 Sistem Informasi Perpustakaan UPGRADE siap digunakan!`);
    console.log(`📁 Static files dari: ${path.join(__dirname, 'public')}`);
});