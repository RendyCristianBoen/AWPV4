// Server.js - SISTEM PERPUSTAKAAN UPGRADE FULL FEATURE
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const http = require('http'); // ✅ TAMBAHKAN INI

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

// ✅ TAMBAHKAN: Session management functions
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
app.use(express.static(__dirname));
app.use(cookieParser());

// Session configuration
app.use(session({
    secret: 'perpustakaan-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

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

const server = http.createServer(async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cookie, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    let session = null;
    const cookies = req.headers.cookie;
    if (cookies) {
        const sessionCookie = cookies.split(';').find(c => c.trim().startsWith('sessionId='));
        if (sessionCookie) {
            const sessionId = sessionCookie.split('=')[1];
            session = verifySession(sessionId);
        }
    }

    const serveStaticFile = (filePath, contentType, requiresAuth = false) => {
        if (requiresAuth && !session) {
            res.writeHead(302, { 'Location': '/login' });
            res.end();
            return;
        }
        
        if (!fs.existsSync(filePath)) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
        }

        fs.readFile(filePath, (err, content) => {
            if (err) {
                console.error('Error reading file:', err);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 Internal Server Error');
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content);
            }
        });
    };

    // Serve CSS file - TIDAK PERLU AUTH
    if (req.method === 'GET' && req.url === '/style.css') {
        serveStaticFile(path.join(__dirname, 'style.css'), 'text/css');
        return;
    }

    // Serve shared JS utilities - TIDAK PERLU AUTH
    if (req.method === 'GET' && req.url === '/app.js') {
        serveStaticFile(path.join(__dirname, 'app.js'), 'application/javascript');
        return;
    }

    // Public routes - TIDAK PERLU LOGIN
    if (req.method === 'GET' && req.url === '/login') {
        serveStaticFile(path.join(__dirname, 'Login.html'), 'text/html');
    }
    else if (req.method === 'GET' && req.url === '/register') {
        serveStaticFile(path.join(__dirname, 'Register.html'), 'text/html');
    }
    else if (req.method === 'POST' && req.url === '/login') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                console.log('Login request received:', body);
                
                if (!body) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'Request body is empty' }));
                    return;
                }

                const { username, password } = JSON.parse(body);
                
                console.log('Login attempt for user:', username);

                if (!username || !password) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'Username dan password harus diisi' }));
                    return;
                }

                // QUERY dengan password hashing
                const [users] = await pool.execute(
                    'SELECT id, username, password, role, nama, email FROM users WHERE username = ?',
                    [username]
                );
                
                console.log('Database query result:', users.length, 'users found');

                if (users.length > 0) {
                    const user = users[0];
                    
                    // ✅ FIX: Password verification dengan bcrypt
                    const isValidPassword = await bcrypt.compare(password, user.password);
                    
                    if (isValidPassword) {
                        const sessionId = createSession(user);
                        res.writeHead(200, {
                            'Content-Type': 'application/json',
                            'Set-Cookie': `sessionId=${sessionId}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict`
                        });
                        res.end(JSON.stringify({ 
                            success: true, 
                            user: { 
                                id: user.id, 
                                username: user.username, 
                                role: user.role, 
                                nama: user.nama 
                            } 
                        }));
                        console.log('Login successful for user:', user.username);
                    } else {
                        console.log('Login failed - invalid password for user:', username);
                        res.writeHead(401, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, message: 'Username atau password salah' }));
                    }
                } else {
                    console.log('Login failed - user not found:', username);
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'Username atau password salah' }));
                }
            } catch (err) {
                console.error('Login error:', err);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Request tidak valid: ' + err.message }));
            }
        });
    }
    else if (req.method === 'POST' && req.url === '/register') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const { username, password, email, nama, telepon, alamat } = JSON.parse(body);
                
                // Validasi input
                if (!username || !password || !email || !nama) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        success: false, 
                        message: 'Username, password, email, dan nama harus diisi.' 
                    }));
                    return;
                }
                
                // Validasi email
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        success: false, 
                        message: 'Format email tidak valid.' 
                    }));
                    return;
                }
                
                // Validasi password strength
                if (password.length < 6) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        success: false, 
                        message: 'Password harus minimal 6 karakter.' 
                    }));
                    return;
                }
                
                // Cek apakah username atau email sudah ada
                const [existingUsers] = await pool.execute(
                    'SELECT id FROM users WHERE username = ? OR email = ?',
                    [username, email]
                );
                
                if (existingUsers.length > 0) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        success: false, 
                        message: 'Username atau email sudah digunakan.' 
                    }));
                    return;
                }
                
                // ✅ FIX: Hash password sebelum disimpan
                const hashedPassword = await bcrypt.hash(password, 10);
                
                // Insert user baru dengan role default 'pengguna'
                const [result] = await pool.execute(
                    `INSERT INTO users (username, password, email, nama, role, telepon, alamat) 
                     VALUES (?, ?, ?, ?, 'pengguna', ?, ?)`,
                    [username, hashedPassword, email, nama, telepon || null, alamat || null]
                );
                
                // Ambil data user yang baru dibuat
                const [newUsers] = await pool.execute(
                    'SELECT id, username, email, nama, role, telepon, alamat, created_at FROM users WHERE id = ?',
                    [result.insertId]
                );
                
                const newUser = newUsers[0];
                
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: true, 
                    message: 'Registrasi berhasil! Silakan login.',
                    user: {
                        id: newUser.id,
                        username: newUser.username,
                        email: newUser.email,
                        nama: newUser.nama,
                        role: newUser.role
                    }
                }));
                
                console.log('New user registered:', username);
                
            } catch (err) {
                console.error('Register error:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: false, 
                    message: 'Terjadi kesalahan saat registrasi.' 
                }));
            }
        });
    }
    else if (req.method === 'POST' && req.url === '/logout') {
        if (session) {
            for (const key in sessions) {
                if (sessions[key].userId === session.userId) {
                    delete sessions[key];
                }
            }
        }
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Set-Cookie': 'sessionId=; HttpOnly; Path=/; Max-Age=0'
        });
        res.end(JSON.stringify({ success: true, message: 'Logout berhasil' }));
    }
    else if (req.method === 'GET' && req.url === '/about') {
        serveStaticFile(path.join(__dirname, 'About.html'), 'text/html');
    }
    // 🆕 DASHBOARD ANALYTICS
    else if (req.method === 'GET' && req.url === '/dashboard-stats') {
        if (!session) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Anda harus login untuk mengakses data ini.' }));
            return;
        }

        try {
            const [totalBooks] = await pool.execute('SELECT COUNT(*) as total FROM books');
            const [totalUsers] = await pool.execute('SELECT COUNT(*) as total FROM users');
            const [activeLoans] = await pool.execute('SELECT COUNT(*) as total FROM loan_history WHERE status = "Dipinjam"');
            const [totalLoans] = await pool.execute('SELECT COUNT(*) as total FROM loan_history');
            const [topRatedBook] = await pool.execute('SELECT judul, rating FROM books ORDER BY rating DESC LIMIT 1');
            
            // Stats genre popularity
            const [genreStats] = await pool.execute(`
                SELECT genre, COUNT(*) as count 
                FROM books 
                GROUP BY genre 
                ORDER BY count DESC
            `);
            
            // Monthly loan trends
            const [monthlyStats] = await pool.execute(`
                SELECT DATE_FORMAT(tanggal_pinjam, '%Y-%m') as month, COUNT(*) as count 
                FROM loan_history 
                GROUP BY month 
                ORDER BY month DESC 
                LIMIT 6
            `);

            // Popular books (most borrowed)
            const [popularBooks] = await pool.execute(`
                SELECT b.*, COUNT(lh.id) as loan_count
                FROM books b 
                LEFT JOIN loan_history lh ON b.id = lh.book_id 
                GROUP BY b.id 
                ORDER BY loan_count DESC 
                LIMIT 5
            `);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
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
            }));
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Gagal memuat statistik dashboard.' }));
        }
    }
    // 🆕 ADVANCED SEARCH
    else if (req.method === 'GET' && req.url.startsWith('/search')) {
        if (!session) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Anda harus login untuk mengakses data ini.' }));
            return;
        }

        try {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const query = url.searchParams.get('q') || '';
            const genre = url.searchParams.get('genre') || '';
            const minRating = url.searchParams.get('minRating') || '0';
            const year = url.searchParams.get('year') || '';
            const author = url.searchParams.get('author') || '';
            
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
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: true, 
                books, 
                count: books.length,
                filters: { query, genre, minRating, year, author }
            }));
        } catch (error) {
            console.error('Error in advanced search:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Gagal melakukan pencarian.' }));
        }
    }
    // 🆕 BOOK RECOMMENDATIONS
    else if (req.method === 'GET' && req.url.startsWith('/recommendations')) {
        if (!session) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Anda harus login untuk mengakses data ini.' }));
            return;
        }

        try {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const bookId = url.searchParams.get('bookId');
            const genre = url.searchParams.get('genre');
            
            let recommendations = [];
            
            if (bookId) {
                // Rekomendasi berdasarkan buku yang sedang dilihat
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
                // Rekomendasi berdasarkan genre tertentu
                const [genreBooks] = await pool.execute(`
                    SELECT * FROM books 
                    WHERE genre = ? AND status = 'Tersedia'
                    ORDER BY rating DESC 
                    LIMIT 8
                `, [genre]);
                recommendations = genreBooks;
            } else {
                // Rekomendasi umum: buku dengan rating tertinggi
                const [topRated] = await pool.execute(`
                    SELECT * FROM books 
                    WHERE status = 'Tersedia'
                    ORDER BY rating DESC 
                    LIMIT 10
                `);
                recommendations = topRated;
            }
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, recommendations }));
        } catch (error) {
            console.error('Error loading recommendations:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Gagal memuat rekomendasi.' }));
        }
    }
    // 🆕 POPULAR BOOKS
    else if (req.method === 'GET' && req.url === '/popular-books') {
        if (!session) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Anda harus login untuk mengakses data ini.' }));
            return;
        }

        try {
            const [popularBooks] = await pool.execute(`
                SELECT b.*, COUNT(lh.id) as loan_count
                FROM books b 
                LEFT JOIN loan_history lh ON b.id = lh.book_id 
                GROUP BY b.id 
                ORDER BY loan_count DESC, rating DESC
                LIMIT 12
            `);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, popularBooks }));
        } catch (error) {
            console.error('Error loading popular books:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Gagal memuat buku populer.' }));
        }
    }
    // 🆕 USER READING HISTORY
    else if (req.method === 'GET' && req.url === '/reading-history') {
        if (!session) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Anda harus login untuk mengakses data ini.' }));
            return;
        }

        try {
            const [readingHistory] = await pool.execute(`
                SELECT lh.*, b.judul, b.penulis, b.gambar, b.genre, b.rating
                FROM loan_history lh 
                JOIN books b ON lh.book_id = b.id 
                WHERE lh.user_id = ? 
                ORDER BY lh.tanggal_pinjam DESC
                LIMIT 20
            `, [session.userId]);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, readingHistory }));
        } catch (error) {
            console.error('Error loading reading history:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Gagal memuat riwayat membaca.' }));
        }
    }
    // Protected routes - HARUS LOGIN
    else if (req.method === 'GET' && req.url === '/') {
        serveStaticFile(path.join(__dirname, 'Index.html'), 'text/html', true);
    }
    else if (req.method === 'GET' && req.url === '/Catalog.html') {
        serveStaticFile(path.join(__dirname, 'Catalog.html'), 'text/html', true);
    }
    else if (req.method === 'GET' && req.url === '/LoanHistory.html') {
        serveStaticFile(path.join(__dirname, 'LoanHistory.html'), 'text/html', true);
    }
    else if (req.method === 'GET' && req.url === '/Dashboard.html') {
        serveStaticFile(path.join(__dirname, 'Dashboard.html'), 'text/html', true);
    }
    else if (req.method === 'GET' && req.url === '/data') {
        if (!session) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Anda harus login untuk mengakses data ini.' }));
            return;
        }
        try {
            const [books] = await pool.execute('SELECT * FROM books');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(books));
        } catch (error) {
            console.error('Error loading data:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Gagal memuat data buku.' }));
        }
    }
    // New endpoint for fetching a single book by ID
    else if (req.method === 'GET' && req.url.startsWith('/book/')) {
        if (!session) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Anda harus login untuk mengakses data ini.' }));
            return;
        }
        const bookId = parseInt(req.url.split('/')[2]);
        try {
            const [books] = await pool.execute('SELECT * FROM books WHERE id = ?', [bookId]);
            if (books.length > 0) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, book: books[0] }));
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Buku tidak ditemukan.' }));
            }
        } catch (error) {
            console.error('Error fetching book:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Gagal memuat data buku.' }));
        }
    }
    // ENDPOINT BARU: GET LOAN HISTORY
    else if (req.method === 'GET' && req.url === '/loan-history') {
        if (!session) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Anda harus login untuk mengakses data ini.' }));
            return;
        }

        try {
            let query = `
                SELECT lh.*, b.judul, b.penulis, b.gambar, u.nama as nama_peminjam 
                FROM loan_history lh 
                JOIN books b ON lh.book_id = b.id 
                JOIN users u ON lh.user_id = u.id
            `;
            
            let params = [];
            
            // Filter berdasarkan role
            if (session.role === 'pengguna') {
                query += ' WHERE lh.user_id = ?';
                params.push(session.userId);
            }
            
            query += ' ORDER BY lh.tanggal_pinjam DESC';
            
            const [loans] = await pool.execute(query, params);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, loans }));
        } catch (error) {
            console.error('Error loading loan history:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Gagal memuat riwayat peminjaman.' }));
        }
    }
    // ENDPOINT BARU: EXPORT CSV RIWAYAT PEMINJAMAN
    else if (req.method === 'GET' && req.url.startsWith('/export-loan-history')) {
        if (!session) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Anda harus login untuk mengakses data ini.' }));
            return;
        }
        try {
            const urlObj = new URL(req.url, `http://${req.headers.host}`);
            const status = urlObj.searchParams.get('status') || '';
            const sort = (urlObj.searchParams.get('sort') || 'tanggal_pinjam').toLowerCase();
            const order = (urlObj.searchParams.get('order') || 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC';
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

            let baseSql = `
                FROM loan_history lh 
                JOIN books b ON lh.book_id = b.id 
                JOIN users u ON lh.user_id = u.id
            `;
            const where = [];
            const params = [];
            if (session.role === 'pengguna') {
                where.push('lh.user_id = ?');
                params.push(session.userId);
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
                `SELECT lh.*, b.judul, b.penulis, b.gambar, u.nama as nama_peminjam ${baseSql} ${whereSql} ORDER BY ${orderBy} ${order}`,
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
            res.writeHead(200, {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': 'attachment; filename="loan-history.csv"'
            });
            res.end(csv);
        } catch (err) {
            console.error('Error exporting CSV:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Gagal mengekspor CSV.' }));
        }
    }
    else if (req.method === 'POST' && req.url.startsWith('/return-book/')) {
        if (!session) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Anda harus login untuk mengakses data ini.' }));
            return;
        }

        const loanId = parseInt(req.url.split('/')[2]);
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                // Cek apakah loan history ada dan milik user yang sesuai
                let query = 'SELECT lh.*, b.judul FROM loan_history lh JOIN books b ON lh.book_id = b.id WHERE lh.id = ?';
                let params = [loanId];
                
                // Jika user adalah pengguna biasa, hanya bisa mengembalikan bukunya sendiri
                if (session.role === 'pengguna') {
                    query += ' AND lh.user_id = ?';
                    params.push(session.userId);
                }
                
                const [loans] = await pool.execute(query, params);
                
                if (loans.length === 0) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'Riwayat peminjaman tidak ditemukan atau Anda tidak memiliki akses.' }));
                    return;
                }

                const loan = loans[0];
                
                // Cek apakah buku sudah dikembalikan
                if (loan.status !== 'Dipinjam' && loan.status !== 'Terlambat') {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'Buku sudah dikembalikan sebelumnya.' }));
                    return;
                }

                // Update status buku menjadi Tersedia
                await pool.execute('UPDATE books SET status = "Tersedia" WHERE id = ?', [loan.book_id]);
                
                // Update loan_history
                const sekarang = new Date();
                const batas = new Date(loan.batas_pengembalian);
                let denda = 0;
                let statusKembali = 'Dikembalikan';
                
                // Hitung denda jika terlambat (Rp 1000/hari)
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

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: true, 
                    message: `Buku "${loan.judul}" berhasil dikembalikan.${denda > 0 ? ` Denda: Rp ${denda.toLocaleString('id-ID')}` : ''}`,
                    denda: denda
                }));
            } catch (err) {
                console.error('Error returning book:', err);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Request tidak valid' }));
            }
        });
    }
    else if (req.method === 'POST' && req.url === '/book') {
        if (!session || (session.role !== 'admin' && session.role !== 'petugas')) {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Akses ditolak. Hanya admin atau petugas yang dapat menambah buku.' }));
            return;
        }

        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const { judul, tahunRilis, penulis, penerbit, genre, gambar, deskripsi, isbn, rating } = JSON.parse(body);

                if (!judul || !tahunRilis || !penulis || !penerbit || !genre || !gambar || !deskripsi || !isbn || !rating) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'Semua kolom harus diisi.' }));
                    return;
                }
                
                const currentYear = new Date().getFullYear();
                const parsedTahunRilis = parseInt(tahunRilis);
                if (isNaN(parsedTahunRilis) || parsedTahunRilis < 1000 || parsedTahunRilis > currentYear) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: `Tahun Rilis tidak valid. Harus antara 1000 dan ${currentYear}.` }));
                    return;
                }
                
                const parsedRating = parseFloat(rating);
                if (isNaN(parsedRating) || parsedRating < 0 || parsedRating > 5) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'Rating tidak valid. Harus angka antara 0 dan 5.' }));
                    return;
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
                
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'Buku berhasil ditambahkan.', book: newBook }));
            } catch (err) {
                console.error("Error adding book:", err);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Request tidak valid atau format JSON salah.' }));
            }
        });
    }
    else if (req.method === 'PUT' && req.url.startsWith('/book/')) {
        if (!session || (session.role !== 'admin' && session.role !== 'petugas')) {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Akses ditolak. Hanya admin atau petugas yang dapat mengubah detail buku.' }));
            return;
        }

        const bookId = parseInt(req.url.split('/')[2]);
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const { judul, tahunRilis, penulis, penerbit, genre, gambar, deskripsi, isbn, rating } = JSON.parse(body);

                if (!judul || !tahunRilis || !penulis || !penerbit || !genre || !gambar || !deskripsi || !isbn || !rating) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'Semua kolom harus diisi.' }));
                    return;
                }
                
                const currentYear = new Date().getFullYear();
                const parsedTahunRilis = parseInt(tahunRilis);
                if (isNaN(parsedTahunRilis) || parsedTahunRilis < 1000 || parsedTahunRilis > currentYear) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: `Tahun Rilis tidak valid. Harus antara 1000 dan ${currentYear}.` }));
                    return;
                }
                
                const parsedRating = parseFloat(rating);
                if (isNaN(parsedRating) || parsedRating < 0 || parsedRating > 5) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'Rating tidak valid. Harus angka antara 0 dan 5.' }));
                    return;
                }

                const [result] = await pool.execute(
                    `UPDATE books SET judul = ?, tahun_rilis = ?, penulis = ?, penerbit = ?, genre = ?, 
                     gambar = ?, deskripsi = ?, isbn = ?, rating = ? WHERE id = ?`,
                    [judul, parsedTahunRilis, penulis, penerbit, genre, gambar, deskripsi, isbn, parsedRating, bookId]
                );

                if (result.affectedRows > 0) {
                    const [updatedBooks] = await pool.execute('SELECT * FROM books WHERE id = ?', [bookId]);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, message: 'Buku berhasil diperbarui.', book: updatedBooks[0] }));
                } else {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'Buku tidak ditemukan.' }));
                }
            } catch (err) {
                console.error("Error updating book:", err);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Request tidak valid atau format JSON salah.' }));
            }
        });
    }
    else if (req.method === 'DELETE' && req.url.startsWith('/book/')) {
        if (!session || (session.role !== 'admin' && session.role !== 'petugas')) {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Akses ditolak. Hanya admin atau petugas yang dapat menghapus buku.' }));
            return;
        }

        const bookId = parseInt(req.url.split('/')[2]);
        try {
            const [result] = await pool.execute('DELETE FROM books WHERE id = ?', [bookId]);
            
            if (result.affectedRows > 0) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'Buku berhasil dihapus.' }));
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Buku tidak ditemukan.' }));
            }
        } catch (error) {
            console.error("Error deleting book:", error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Gagal menghapus buku.' }));
        }
    }
    // UPDATE ENDPOINT: PINJAM BUKU (DENGAN DURASI DAN RIWAYAT)
    else if (req.method === 'POST' && req.url.startsWith('/book/status/')) {
        if (!session || (session.role !== 'admin' && session.role !== 'petugas' && session.role !== 'pengguna')) {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Akses ditolak. Anda tidak memiliki izin untuk mengubah status buku.' }));
            return;
        }

        const bookId = parseInt(req.url.split('/')[3]);
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const parsed = JSON.parse(body);
                const newStatus = parsed.status;
                const durasiHari = parsed.durasiHari || 7; // Default 7 hari
                
                if (!['Tersedia', 'Dipinjam'].includes(newStatus)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'Status buku tidak valid.' }));
                    return;
                }

                const [books] = await pool.execute('SELECT * FROM books WHERE id = ?', [bookId]);
                if (books.length === 0) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'Buku tidak ditemukan.' }));
                    return;
                }

                const book = books[0];
                
                // LOGIC PEMINJAMAN
                if (newStatus === 'Dipinjam') {
                    if (session.role === 'pengguna' && book.status !== 'Tersedia') {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, message: 'Buku tidak tersedia untuk dipinjam.' }));
                        return;
                    }
                    
                    // Update status buku
                    await pool.execute('UPDATE books SET status = ? WHERE id = ?', [newStatus, bookId]);
                    
                    // Tambah ke loan_history
                    const batasPengembalian = new Date();
                    batasPengembalian.setDate(batasPengembalian.getDate() + durasiHari);
                    
                    await pool.execute(
                        `INSERT INTO loan_history (user_id, book_id, batas_pengembalian, status, durasi_hari) 
                         VALUES (?, ?, ?, 'Dipinjam', ?)`,
                        [session.userId, bookId, batasPengembalian, durasiHari]
                    );
                    
                } 
                // LOGIC PENGEMBALIAN (Hanya untuk admin/petugas melalui endpoint ini)
                else if (newStatus === 'Tersedia') {
                    if (session.role === 'pengguna') {
                        res.writeHead(403, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, message: 'Akses ditolak. Untuk pengembalian, gunakan fitur pengembalian di halaman riwayat.' }));
                        return;
                    }
                    
                    // Update status buku
                    await pool.execute('UPDATE books SET status = ? WHERE id = ?', [newStatus, bookId]);
                    
                    // Update loan_history
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
                        
                        // Hitung denda jika terlambat (Rp 1000/hari)
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
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: true, 
                    book: updatedBooks[0],
                    message: newStatus === 'Dipinjam' ? 
                        `Buku berhasil dipinjam untuk ${durasiHari} hari` : 
                        'Buku berhasil dikembalikan'
                }));
            } catch (err) {
                console.error('Error changing book status:', err);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Request tidak valid' }));
            }
        });
    }
    // Serve placeholder images untuk buku
    else if (req.method === 'GET' && req.url.startsWith('/images/')) {
        const imagePath = path.join(__dirname, 'images', req.url.split('/images/')[1]);
        if (fs.existsSync(imagePath)) {
            serveStaticFile(imagePath, 'image/jpeg');
        } else {
            // Fallback ke placeholder image
            const placeholderPath = path.join(__dirname, 'images', 'default-book.jpg');
            if (fs.existsSync(placeholderPath)) {
                serveStaticFile(placeholderPath, 'image/jpeg');
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Image not found');
            }
        }
    }
    // Redirect semua route yang tidak dikenal ke login
    else {
        if (!session) {
            res.writeHead(302, { 'Location': '/login' });
            res.end();
            return;
        }
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});

// Inisialisasi database dan start server
async function startServer() {
    try {
        await initializeDatabase();
        
        const PORT = 3000;
        server.listen(PORT, () => {
            console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
            console.log(`📚 Sistem Informasi Perpustakaan UPGRADE siap digunakan!`);
            console.log(`🔐 Fitur Baru:`);
            console.log(`   ✅ Password Hashing dengan bcrypt`);
            console.log(`   📊 Dashboard Analytics`);
            console.log(`   🔍 Advanced Search`);
            console.log(`   💡 Book Recommendations`);
            console.log(`   📖 Reading History`);
            console.log(`   🔥 Popular Books`);
            console.log(`📝 Fitur Registrasi Aktif!`);
            console.log(`📋 Sistem Riwayat Peminjaman aktif!`);
            console.log(`🔄 Fitur pengembalian untuk semua user aktif!`);
            console.log(`⏰ Durasi peminjaman & denda otomatis aktif!`);
            console.log(`🔐 Akses diproteksi - harus login terlebih dahulu`);
        });
    } catch (error) {
        console.error('❌ Gagal memulai server:', error);
    }
}

startServer();