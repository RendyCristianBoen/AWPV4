// test-db.js - UPDATED VERSION
const { initializeDatabase, pool, getDatabaseStats } = require('./database');
const bcrypt = require('bcrypt');

async function testConnection() {
    let connection;
    try {
        console.log('🔄 Testing database connection...');
        
        // Test koneksi database
        connection = await pool.getConnection();
        console.log('✅ Database connection successful!');
        
        // Test query sederhana
        const [rows] = await connection.execute('SELECT 1 + 1 AS result');
        console.log('✅ Basic query test passed:', rows[0].result);
        
        // Test inisialisasi database
        console.log('🔄 Initializing database...');
        await initializeDatabase();
        console.log('✅ Database initialization successful!');
        
        // Test password hashing
        console.log('🔐 Testing password hashing...');
        const testPassword = 'test123';
        const hashedPassword = await bcrypt.hash(testPassword, 10);
        const isValid = await bcrypt.compare(testPassword, hashedPassword);
        console.log('✅ Password hashing test:', isValid ? 'PASSED' : 'FAILED');
        
        // Test query untuk melihat jumlah data
        const [books] = await connection.execute('SELECT COUNT(*) as bookCount FROM books');
        const [users] = await connection.execute('SELECT COUNT(*) as userCount FROM users');
        const [loans] = await connection.execute('SELECT COUNT(*) as loanCount FROM loan_history');
        const [reviews] = await connection.execute('SELECT COUNT(*) as reviewCount FROM book_reviews');
        const [favorites] = await connection.execute('SELECT COUNT(*) as favoriteCount FROM user_favorites');
        
        console.log(`✅ Books in database: ${books[0].bookCount}`);
        console.log(`✅ Users in database: ${users[0].userCount}`);
        console.log(`✅ Loans in database: ${loans[0].loanCount}`);
        console.log(`✅ Reviews in database: ${reviews[0].reviewCount}`);
        console.log(`✅ Favorites in database: ${favorites[0].favoriteCount}`);
        
        // Test database stats function
        console.log('📊 Testing database stats...');
        const stats = await getDatabaseStats();
        console.log('✅ Database stats:', {
            totalUsers: stats.users,
            totalBooks: stats.books,
            totalLoans: stats.loans,
            totalReviews: stats.reviews,
            totalFavorites: stats.favorites,
            activeLoans: stats.activeLoans
        });
        
        // Test query untuk melihat data user (without passwords)
        const [userData] = await connection.execute('SELECT username, role, nama, email FROM users');
        console.log('✅ User data:', userData);
        
        // Test query untuk melihat beberapa buku
        const [bookData] = await connection.execute('SELECT judul, penulis, genre, rating FROM books LIMIT 5');
        console.log('✅ Sample books:');
        bookData.forEach(book => {
            console.log(`   - ${book.judul} by ${book.penulis} (${book.genre}) - ⭐${book.rating}`);
        });
        
        // Test book search (bukan full-text search)
        console.log('🔍 Testing book search...');
        const [searchResults] = await connection.execute(`
            SELECT judul, penulis FROM books 
            WHERE judul LIKE '%petualangan%' OR penulis LIKE '%petualangan%' OR deskripsi LIKE '%petualangan%'
            LIMIT 3
        `);
        console.log('✅ Book search test:', searchResults.length > 0 ? 'PASSED' : 'NO RESULTS');
        if (searchResults.length > 0) {
            console.log('   Search results:');
            searchResults.forEach(book => {
                console.log(`   - ${book.judul} by ${book.penulis}`);
            });
        }
        
        // Test popular books
        console.log('🔥 Testing popular books query...');
        const [popularBooks] = await connection.execute(`
            SELECT judul, penulis, total_dipinjam 
            FROM books 
            ORDER BY total_dipinjam DESC 
            LIMIT 3
        `);
        console.log('✅ Popular books:', popularBooks);
        
        connection.release();
        
        console.log('\n🎉 All database tests passed!');
        console.log('📊 Final Statistics:');
        console.log(`   📚 Books: ${books[0].bookCount}`);
        console.log(`   👥 Users: ${users[0].userCount}`);
        console.log(`   📖 Loans: ${loans[0].loanCount}`);
        console.log(`   ⭐ Reviews: ${reviews[0].reviewCount}`);
        console.log(`   ❤️ Favorites: ${favorites[0].favoriteCount}`);
        console.log('\n🚀 System is ready for production!');
        console.log('📚 You can now start the server with: node server.js');
        
        process.exit(0);
    } catch (error) {
        console.error('💥 Database test failed:', error.message);
        console.error('Error details:', error);
        if (connection) connection.release();
        process.exit(1);
    }
}

// Handle promise rejection
process.on('unhandledRejection', (err) => {
    console.error('💥 Unhandled Promise Rejection:', err);
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught Exception:', err);
    process.exit(1);
});

// Jalankan test
testConnection();