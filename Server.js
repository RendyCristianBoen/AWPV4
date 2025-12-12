// Server.js - SISTEM PERPUSTAKAAN UPGRADE FULL FEATURE
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const { db, runQuery, getQuery, allQuery, initializeDatabase } = require('./database');

// Initialize Express app
const app = express();

// Middleware setup
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

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

// Static file routes (no auth required) - now served by express.static from public folder

// Public routes (no auth required)
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Register.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'About.html'));
});
// Authentication routes
app.post('/login', async (req, res) => {
    try {
        console.log('Login request received:', req.body);
        
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username dan password harus diisi' });
        }

        console.log('Login attempt for user:', username);

        // Query dengan password hashing
        const user = await getQuery(
            'SELECT id, username, password, role, nama, email FROM users WHERE username = ?',
            [username]
        );
        
        console.log('Database query result:', user ? 'user found' : 'user not found');

        if (user) {
            
            // Password verification dengan bcrypt
            const isValidPassword = await bcrypt.compare(password, user.password);
            
            if (isValidPassword) {
                // Set session data
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
app.post('/register', async (req, res) => {
    try {
        const { username, password, email, nama, telepon, alamat } = req.body;
        
        // Validasi input
        if (!username || !password || !email || !nama) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username, password, email, dan nama harus diisi.' 
            });
        }
        
        // Validasi email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Format email tidak valid.' 
            });
        }
        
        // Validasi password strength
        if (password.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password harus minimal 6 karakter.' 
            });
        }
        
        // Cek apakah username atau email sudah ada
        const existingUsers = await allQuery(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );
        
        if (existingUsers.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username atau email sudah digunakan.' 
            });
        }
        
        // Hash password sebelum disimpan
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert user baru dengan role default 'pengguna'
        const result = await runQuery(
            `INSERT INTO users (username, password, email, nama, role, telepon, alamat) 
             VALUES (?, ?, ?, ?, 'pengguna', ?, ?)`,
            [username, hashedPassword, email, nama, telepon || null, alamat || null]
        );
        
        // Ambil data user yang baru dibuat
        const newUsers = await allQuery(
            'SELECT id, username, email, nama, role, telepon, alamat, created_at FROM users WHERE id = ?',
            [result.lastID]
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

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Gagal logout' });
        }
        res.json({ success: true, message: 'Logout berhasil' });
    });
});
// Dashboard Analytics
app.get('/dashboard-stats', requireAuth, async (req, res) => {
    try {
        const totalBooks = await getQuery('SELECT COUNT(*) as total FROM books');
        const totalUsers = await getQuery('SELECT COUNT(*) as total FROM users');
        const activeLoans = await getQuery('SELECT COUNT(*) as total FROM loan_history WHERE status = "Dipinjam"');
        const totalLoans = await getQuery('SELECT COUNT(*) as total FROM loan_history');
        const topRatedBook = await getQuery('SELECT judul, rating FROM books ORDER BY rating DESC LIMIT 1');
        
        // Stats genre popularity
        const genreStats = await allQuery(`
            SELECT genre, COUNT(*) as count 
            FROM books 
            GROUP BY genre 
            ORDER BY count DESC
        `);
        
        // Monthly loan trends
        const monthlyStats = await allQuery(`
            SELECT strftime('%Y-%m', tanggal_pinjam) as month, COUNT(*) as count 
            FROM loan_history 
            GROUP BY month 
            ORDER BY month DESC 
            LIMIT 6
        `);

        // Popular books (most borrowed)
        const popularBooks = await allQuery(`
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
                totalBooks: totalBooks.total,
                totalUsers: totalUsers.total,
                activeLoans: activeLoans.total,
                totalLoans: totalLoans.total,
                topRatedBook: topRatedBook || { judul: 'Tidak ada', rating: 0 },
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
// Advanced Search
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
        
        const books = await allQuery(sql, params);
        
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
// Book Recommendations
app.get('/recommendations', requireAuth, async (req, res) => {
    try {
        const { bookId, genre } = req.query;
        
        let recommendations = [];
        
        if (bookId) {
            // Rekomendasi berdasarkan buku yang sedang dilihat
            const book = await getQuery('SELECT genre FROM books WHERE id = ?', [bookId]);
            if (book) {
                const similarBooks = await allQuery(`
                    SELECT * FROM books 
                    WHERE genre = ? AND id != ? AND status = 'Tersedia'
                    ORDER BY rating DESC 
                    LIMIT 6
                `, [book.genre, bookId]);
                recommendations = similarBooks;
            }
        } else if (genre) {
            // Rekomendasi berdasarkan genre tertentu
            const genreBooks = await allQuery(`
                SELECT * FROM books 
                WHERE genre = ? AND status = 'Tersedia'
                ORDER BY rating DESC 
                LIMIT 8
            `, [genre]);
            recommendations = genreBooks;
        } else {
            // Rekomendasi umum: buku dengan rating tertinggi
            const topRated = await allQuery(`
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

// Popular Books
app.get('/popular-books', requireAuth, async (req, res) => {
    try {
        const popularBooks = await allQuery(`
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

// User Reading History
app.get('/reading-history', requireAuth, async (req, res) => {
    try {
        const readingHistory = await allQuery(`
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
// Protected routes - require authentication
app.get('/', (req, res) => {
    return res.redirect('/login');
});

app.get('/Catalog.html', (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'public', 'Catalog.html'));
});

app.get('/LoanHistory.html', (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'public', 'LoanHistory.html'));
});

app.get('/Dashboard.html', (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'public', 'Dashboard.html'));
});

// Books data endpoint
app.get('/data', requireAuth, async (req, res) => {
    try {
        const books = await allQuery('SELECT * FROM books');
        res.json(books);
    } catch (error) {
        console.error('Error loading data:', error);
        res.status(500).json({ success: false, message: 'Gagal memuat data buku.' });
    }
});
// Get single book by ID
app.get('/book/:id', requireAuth, async (req, res) => {
    try {
        const bookId = parseInt(req.params.id);
        const books = await allQuery('SELECT * FROM books WHERE id = ?', [bookId]);
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
// Get loan history
app.get('/loan-history', requireAuth, async (req, res) => {
    try {
        let query = `
            SELECT lh.*, b.judul, b.penulis, b.gambar, u.nama as nama_peminjam 
            FROM loan_history lh 
            JOIN books b ON lh.book_id = b.id 
            JOIN users u ON lh.user_id = u.id
        `;
        
        let params = [];
        
        // Filter berdasarkan role
        if (req.session.role === 'pengguna') {
            query += ' WHERE lh.user_id = ?';
            params.push(req.session.userId);
        }
        
        query += ' ORDER BY lh.tanggal_pinjam DESC';
        
        const loans = await allQuery(query, params);
        
        res.json({ success: true, loans });
    } catch (error) {
        console.error('Error loading loan history:', error);
        res.status(500).json({ success: false, message: 'Gagal memuat riwayat peminjaman.' });
    }
});
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

        const rows = await allQuery(
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
// Return book
app.post('/return-book/:id', requireAuth, async (req, res) => {
    try {
        const loanId = parseInt(req.params.id);
        
        // Cek apakah loan history ada dan milik user yang sesuai
        let query = 'SELECT lh.*, b.judul FROM loan_history lh JOIN books b ON lh.book_id = b.id WHERE lh.id = ?';
        let params = [loanId];
        
        // Jika user adalah pengguna biasa, hanya bisa mengembalikan bukunya sendiri
        if (req.session.role === 'pengguna') {
            query += ' AND lh.user_id = ?';
            params.push(req.session.userId);
        }
        
        const loans = await allQuery(query, params);
        
        if (loans.length === 0) {
            return res.status(404).json({ success: false, message: 'Riwayat peminjaman tidak ditemukan atau Anda tidak memiliki akses.' });
        }

        const loan = loans[0];
        
        // Cek apakah buku sudah dikembalikan
        if (loan.status !== 'Dipinjam' && loan.status !== 'Terlambat') {
            return res.status(400).json({ success: false, message: 'Buku sudah dikembalikan sebelumnya.' });
        }

        // Update status buku menjadi Tersedia
        await runQuery('UPDATE books SET status = "Tersedia" WHERE id = ?', [loan.book_id]);
        
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
        
        await runQuery(
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
// Add new book (Admin/Petugas only)
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

        const result = await runQuery(
            `INSERT INTO books (judul, tahun_rilis, penulis, penerbit, genre, gambar, deskripsi, isbn, rating) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [judul, parsedTahunRilis, penulis, penerbit, genre, gambar, deskripsi, isbn, parsedRating]
        );

        if (result.changes > 0) {
            const newBook = {
                id: result.lastID,
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
        } else {
            res.status(500).json({ success: false, message: 'Gagal menambahkan buku.' });
        }
    } catch (err) {
        console.error("Error adding book:", err);
        res.status(400).json({ success: false, message: 'Request tidak valid atau format JSON salah.' });
    }
});
// Update book (Admin/Petugas only)
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

        const result = await runQuery(
            `UPDATE books SET judul = ?, tahun_rilis = ?, penulis = ?, penerbit = ?, genre = ?, 
             gambar = ?, deskripsi = ?, isbn = ?, rating = ? WHERE id = ?`,
            [judul, parsedTahunRilis, penulis, penerbit, genre, gambar, deskripsi, isbn, parsedRating, bookId]
        );

        if (result.changes > 0) {
             const updatedBooks = await allQuery('SELECT * FROM books WHERE id = ?', [bookId]);
             res.json({ success: true, message: 'Buku berhasil diperbarui.', book: updatedBooks[0] });
         } else {
            res.status(404).json({ success: false, message: 'Buku tidak ditemukan.' });
        }
    } catch (err) {
        console.error("Error updating book:", err);
        res.status(400).json({ success: false, message: 'Request tidak valid atau format JSON salah.' });
    }
});

// Delete book (Admin/Petugas only)
app.delete('/book/:id', requireAdminOrPetugas, async (req, res) => {
    try {
        const bookId = parseInt(req.params.id);
        const result = await runQuery('DELETE FROM books WHERE id = ?', [bookId]);
        
        if (result.changes > 0) {
             res.json({ success: true, message: 'Buku berhasil dihapus.' });
         } else {
            res.status(404).json({ success: false, message: 'Buku tidak ditemukan.' });
        }
    } catch (error) {
        console.error("Error deleting book:", error);
        res.status(500).json({ success: false, message: 'Gagal menghapus buku.' });
    }
});
// Change book status (borrow/return)
app.post('/book/status/:id', requireAuth, async (req, res) => {
    try {
        const bookId = parseInt(req.params.id);
        const { status: newStatus, durasiHari = 7 } = req.body;
        
        if (!['Tersedia', 'Dipinjam'].includes(newStatus)) {
            return res.status(400).json({ success: false, message: 'Status buku tidak valid.' });
        }

        const books = await allQuery('SELECT * FROM books WHERE id = ?', [bookId]);
        if (books.length === 0) {
            return res.status(404).json({ success: false, message: 'Buku tidak ditemukan.' });
        }

        const book = books[0];
        
        // LOGIC PEMINJAMAN
        if (newStatus === 'Dipinjam') {
            if (req.session.role === 'pengguna' && book.status !== 'Tersedia') {
                return res.status(400).json({ success: false, message: 'Buku tidak tersedia untuk dipinjam.' });
            }
            
            // Update status buku
            await runQuery('UPDATE books SET status = ? WHERE id = ?', [newStatus, bookId]);
            
            // Tambah ke loan_history
            const batasPengembalian = new Date();
            batasPengembalian.setDate(batasPengembalian.getDate() + durasiHari);
            
            await runQuery(
                `INSERT INTO loan_history (user_id, book_id, batas_pengembalian, status, durasi_hari) 
                 VALUES (?, ?, ?, 'Dipinjam', ?)`,
                [req.session.userId, bookId, batasPengembalian, durasiHari]
            );
            
        } 
        // LOGIC PENGEMBALIAN (Hanya untuk admin/petugas melalui endpoint ini)
        else if (newStatus === 'Tersedia') {
            if (req.session.role === 'pengguna') {
                return res.status(403).json({ success: false, message: 'Akses ditolak. Untuk pengembalian, gunakan fitur pengembalian di halaman riwayat.' });
            }
            
            // Update status buku
            await runQuery('UPDATE books SET status = ? WHERE id = ?', [newStatus, bookId]);
            
            // Update loan_history
            const activeLoans = await allQuery(
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
                
                await runQuery(
                    `UPDATE loan_history 
                     SET tanggal_kembali = ?, status = ?, denda = ? 
                     WHERE id = ?`,
                    [sekarang, statusKembali, denda, loan.id]
                );
            }
        }

        const updatedBooks = await allQuery('SELECT * FROM books WHERE id = ?', [bookId]);
        
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
// Serve images
app.get('/images/*', (req, res) => {
    const imagePath = path.join(__dirname, 'public', 'images', req.params[0]);
    if (fs.existsSync(imagePath)) {
        res.sendFile(imagePath);
    } else {
        // Fallback ke placeholder image
        const placeholderPath = path.join(__dirname, 'public', 'images', 'default-book.jpg');
        if (fs.existsSync(placeholderPath)) {
            res.sendFile(placeholderPath);
        } else {
            res.status(404).send('Image not found');
        }
    }
});

// 404 handler
app.use((req, res) => {
    if (!req.session || !req.session.userId) {
        return res.redirect('/login');
    }
    res.status(404).send('404 Not Found');
});

// Inisialisasi database dan start server
async function startServer() {
    try {
        await initializeDatabase();
        
        const PORT = 3001;
        app.listen(PORT, () => {
            console.log(`🚀 Server Express berjalan di http://localhost:${PORT}`);
            console.log(`📚 Sistem Informasi Perpustakaan UPGRADE siap digunakan!`);
            console.log(`🔐 Fitur Baru:`);
            console.log(`   ✅ Express.js Framework`);
            console.log(`   ✅ Express Session Management`);
            console.log(`   ✅ CORS Support`);
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