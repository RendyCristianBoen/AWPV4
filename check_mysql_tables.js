const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'perpustakaan_db'
};

async function checkTables() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Cek apakah database ada
        console.log('🔍 Mengecek koneksi MySQL...');
        
        // Cek tabel users
        const [userTables] = await connection.execute('SHOW TABLES LIKE "users"');
        console.log('📋 Tabel users ada:', userTables.length > 0);
        
        // Cek struktur tabel users
        if (userTables.length > 0) {
            const [userStructure] = await connection.execute('DESCRIBE users');
            console.log('🔍 Struktur tabel users:');
            userStructure.forEach(col => {
                console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
            });
        } else {
            console.log('⚠️  Tabel users tidak ditemukan!');
        }
        
        // Cek tabel books
        const [bookTables] = await connection.execute('SHOW TABLES LIKE "books"');
        console.log('📚 Tabel books ada:', bookTables.length > 0);
        
        await connection.end();
    } catch (error) {
        console.error('❌ Error checking tables:', error.message);
        console.error('Detail error:', error);
    }
}

checkTables();