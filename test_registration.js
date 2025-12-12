const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const dbConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'perpustakaan_db'
};

async function testRegistration() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        console.log('🔧 Testing registration process...');
        
        // Data test user
        const userData = {
            username: 'testuser',
            password: 'testpassword123',
            email: 'test@example.com',
            nama: 'Test User',
            telepon: '081234567890',
            alamat: 'Test Address'
        };
        
        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        console.log('🔑 Password hashed successfully');
        
        // Cek apakah username sudah ada
        const [existingUser] = await connection.execute(
            'SELECT * FROM users WHERE username = ?', 
            [userData.username]
        );
        
        if (existingUser.length > 0) {
            console.log('⚠️  Username sudah ada, menghapus yang lama...');
            await connection.execute('DELETE FROM users WHERE username = ?', [userData.username]);
        }
        
        // Insert user baru
        const [result] = await connection.execute(
            `INSERT INTO users (username, password, email, nama, telepon, alamat, role, status, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, ?, 'pengguna', 'active', NOW(), NOW())`,
            [userData.username, hashedPassword, userData.email, userData.nama, userData.telepon, userData.alamat]
        );
        
        console.log('✅ User berhasil didaftarkan!');
        console.log('📊 User ID:', result.insertId);
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Error during registration test:');
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('Error sqlState:', error.sqlState);
        console.error('Full error:', error);
    }
}

testRegistration();