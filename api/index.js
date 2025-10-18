// Vercel serverless function - Sistem Perpustakaan
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const MySQLStore = require('express-mysql-session')(session);

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'maglev.proxy.rlwy.net',
    port: process.env.DB_PORT || 15489,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'dZCGhuLCPRWWaSyzXsOXgTpFRuqNiNOE',
    database: process.env.DB_NAME || 'railway',
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
};

let pool;
let sessionStore;

// Initialize database connection
async function initDatabase() {
    if (!pool) {
        try {
            pool = mysql.createPool(dbConfig);
            
            // Initialize session store
            sessionStore = new MySQLStore({
                expiration: 86400000, // 24 jam
                createDatabaseTable: true,
                schema: {
                    tableName: 'sessions',
                    columnNames: {
                        session_id: 'session_id',
                        expires: 'expires',
                        data: 'data'
                    }
                }
            }, pool);
            
            console.log('✅ Database pool created');
            console.log('✅ Session store initialized');
        } catch (error) {
            console.error('❌ Database connection error:', error);
            throw error;
        }
    }
    return pool;
}

// Initialize Express app
const app = express();

// ✅ FIX: Trust proxy for Vercel
app.set('trust proxy', 1);

// Middleware setup
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            'http://localhost:3000', 
            'http://localhost:3001',
            'https://*.vercel.app',
            process.env.FRONTEND_URL
        ].filter(Boolean);
        
        if (allowedOrigins.some(allowed => origin === allowed || origin.endsWith('.vercel.app'))) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ✅ FIX: Enhanced Session configuration for Vercel
app.use(session({
    secret: process.env.SESSION_SECRET || 'perpustakaan-secret-key-2024-very-long-secret-at-least-32-chars',
    resave: false,
    saveUninitialized: false,
    store: sessionStore, // Use database store for persistence
    proxy: true, // ✅ Important for Vercel
    cookie: {
        secure: process.env.NODE_ENV === 'production', // ✅ true in Vercel
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // ✅ Important for cross-origin
        maxAge: 24 * 60 * 60 * 1000, // 24 jam
        domain: process.env.NODE_ENV === 'production' ? '.vercel.app' : undefined
    },
    name: 'lib_session',
    rolling: true,
    unset: 'destroy'
}));

// Session debugging middleware
app.use((req, res, next) => {
    console.log('🔐 SESSION DEBUG:', {
        sessionId: req.sessionID,
        session: req.session,
        cookies: req.headers.cookie,
        origin: req.headers.origin,
        host: req.headers.host
    });
    next();
});

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

// Enhanced Authentication middleware
function requireAuth(req, res, next) {
    console.log('🔐 AUTH CHECK - User:', req.session.userId, 'Role:', req.session.role);
    
    if (req.session && req.session.userId) {
        console.log('✅ Auth check passed');
        return next();
    } else {
        console.log('❌ Auth check failed');
        return res.status(401).json({ 
            success: false, 
            message: 'Silakan login terlebih dahulu',
            requiresLogin: true
        });
    }
}

// Admin/Petugas middleware
function requireAdminOrPetugas(req, res, next) {
    if (req.session && req.session.userId && (req.session.role === 'admin' || req.session.role === 'petugas')) {
        return next();
    }
    res.status(403).json({ success: false, message: 'Akses ditolak. Hanya admin atau petugas yang dapat mengakses fitur ini.' });
}

// Public routes
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Register.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'About.html'));
});

// Enhanced Authentication routes
app.post('/login', async (req, res) => {
    try {
        console.log('🔐 LOGIN ATTEMPT:', req.body.username);
        
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
                // Destroy old session and create new one
                req.session.regenerate((err) => {
                    if (err) {
                        console.error('Session regenerate error:', err);
                        return res.status(500).json({ success: false, message: 'Session error' });
                    }

                    // Set session data
                    req.session.userId = user.id;
                    req.session.username = user.username;
                    req.session.role = user.role;
                    req.session.nama = user.nama;
                    req.session.loginTime = new Date().toISOString();
                    
                    console.log('✅ LOGIN SUCCESS - New Session:', {
                        sessionId: req.sessionID,
                        userId: user.id,
                        username: user.username
                    });

                    // Force session save
                    req.session.save((saveErr) => {
                        if (saveErr) {
                            console.error('Session save error:', saveErr);
                            return res.status(500).json({ success: false, message: 'Session save failed' });
                        }
                        
                        // Set cookie manually for additional security
                        res.cookie('lib_session', req.sessionID, {
                            secure: process.env.NODE_ENV === 'production',
                            httpOnly: true,
                            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                            maxAge: 24 * 60 * 60 * 1000
                        });
                        
                        res.json({ 
                            success: true, 
                            message: 'Login berhasil',
                            user: { 
                                id: user.id, 
                                username: user.username, 
                                role: user.role, 
                                nama: user.nama 
                            },
                            sessionId: req.sessionID
                        });
                    });
                });
            } else {
                console.log('❌ LOGIN FAILED - Invalid password for user:', username);
                res.status(401).json({ success: false, message: 'Username atau password salah' });
            }
        } else {
            console.log('❌ LOGIN FAILED - User not found:', username);
            res.status(401).json({ success: false, message: 'Username atau password salah' });
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server: ' + err.message });
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
    const sessionId = req.sessionID;
    console.log('🔐 LOGOUT - Session:', sessionId);
    
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ success: false, message: 'Gagal logout' });
        }
        
        res.clearCookie('lib_session');
        res.json({ success: true, message: 'Logout berhasil' });
    });
});

// Enhanced CHECK SESSION ENDPOINT
app.get('/check-session', async (req, res) => {
    console.log('🔐 SESSION CHECK - SessionID:', req.sessionID);
    console.log('🔐 SESSION CHECK - Session Data:', req.session);
    
    if (req.session && req.session.userId) {
        // Refresh session expiration
        req.session.touch && req.session.touch();
        
        // Get fresh user data from database
        try {
            const [users] = await pool.execute(
                'SELECT id, username, role, nama, email FROM users WHERE id = ?',
                [req.session.userId]
            );
            
            if (users.length > 0) {
                const user = users[0];
                // Update session with fresh data
                req.session.username = user.username;
                req.session.role = user.role;
                req.session.nama = user.nama;
                
                req.session.save((err) => {
                    if (err) {
                        console.error('Session save error in check-session:', err);
                    }
                    
                    res.json({
                        success: true,
                        isLoggedIn: true,
                        user: {
                            id: user.id,
                            username: user.username,
                            role: user.role,
                            nama: user.nama,
                            email: user.email
                        },
                        sessionId: req.sessionID
                    });
                });
            } else {
                // User not found in database, destroy session
                req.session.destroy(() => {
                    res.json({ 
                        success: true, 
                        isLoggedIn: false,
                        message: 'User tidak ditemukan'
                    });
                });
            }
        } catch (error) {
            console.error('Error checking session:', error);
            res.json({ 
                success: false, 
                isLoggedIn: false,
                message: 'Error checking session'
            });
        }
    } else {
        console.log('🔐 NO ACTIVE SESSION');
        res.json({ 
            success: true, 
            isLoggedIn: false,
            message: 'No active session'
        });
    }
});

// Session Keep-Alive Endpoint
app.post('/session-keepalive', (req, res) => {
    if (req.session.userId) {
        req.session.touch && req.session.touch();
        req.session.save((err) => {
            if (err) {
                console.error('Session keep-alive error:', err);
                return res.json({ success: false, message: 'Session update failed' });
            }
            res.json({ success: true, message: 'Session updated', sessionId: req.sessionID });
        });
    } else {
        res.json({ success: false, message: 'No active session' });
    }
});

// Public routes that don't require auth
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Index.html'));
});

app.get('/Catalog.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Catalog.html'));
});

app.get('/LoanHistory.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'LoanHistory.html'));
});

app.get('/Dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Dashboard.html'));
});

// API Routes (protected)
app.get('/data', requireAuth, async (req, res) => {
    try {
        const [books] = await pool.execute('SELECT * FROM books');
        res.json(books);
    } catch (error) {
        console.error('Error loading data:', error);
        res.status(500).json({ success: false, message: 'Gagal memuat data buku.' });
    }
});

app.get('/dashboard-stats', requireAuth, async (req, res) => {
    try {
        const [totalBooks] = await pool.execute('SELECT COUNT(*) as total FROM books');
        const [totalUsers] = await pool.execute('SELECT COUNT(*) as total FROM users');
        const [activeLoans] = await pool.execute('SELECT COUNT(*) as total FROM loan_history WHERE status = "Dipinjam"');
        const [totalLoans] = await pool.execute('SELECT COUNT(*) as total FROM loan_history');
        const [topRatedBook] = await pool.execute('SELECT judul, rating FROM books ORDER BY rating DESC LIMIT 1');
        
        res.json({
            success: true,
            stats: {
                totalBooks: totalBooks[0].total,
                totalUsers: totalUsers[0].total,
                activeLoans: activeLoans[0].total,
                totalLoans: totalLoans[0].total,
                topRatedBook: topRatedBook[0] || { judul: 'Tidak ada', rating: 0 }
            }
        });
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        res.status(500).json({ success: false, message: 'Gagal memuat statistik dashboard.' });
    }
});

// ... (tambahkan semua route API lainnya yang sudah ada sebelumnya)
// [Semua route API lainnya tetap sama seperti sebelumnya]

// Serve images
app.get('/images/*', (req, res) => {
    const imagePath = path.join(__dirname, 'public', 'images', req.params[0]);
    if (fs.existsSync(imagePath)) {
        res.sendFile(imagePath);
    } else {
        res.status(404).send('Image not found');
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).send('404 Not Found');
});

// Export app for Vercel
module.exports = app;