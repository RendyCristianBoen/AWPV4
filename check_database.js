const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('perpustakaan.db');

console.log('📊 Memeriksa struktur database...');

// Cek tabel yang ada
db.all('SELECT name FROM sqlite_master WHERE type="table"', (err, tables) => {
    if (err) {
        console.error('❌ Error memeriksa tabel:', err.message);
        db.close();
        return;
    }
    
    console.log('\n📋 Daftar Tabel:');
    tables.forEach(table => console.log('  - ' + table.name));
    
    // Cek isi tabel buku jika ada
    if (tables.some(t => t.name === 'buku')) {
        console.log('\n📖 Memeriksa isi tabel buku:');
        db.all('SELECT COUNT(*) as total FROM buku', (err, result) => {
            if (err) console.error('❌ Error memeriksa buku:', err.message);
            else console.log('  Total buku: ' + result[0].total + ' buku');
            
            // Tampilkan beberapa buku jika ada
            if (result[0].total > 0) {
                db.all('SELECT id, judul, penulis FROM buku LIMIT 5', (err, books) => {
                    if (err) console.error('❌ Error mengambil buku:', err.message);
                    else {
                        console.log('\n📚 Contoh buku:');
                        books.forEach(book => console.log('  - ' + book.judul + ' oleh ' + book.penulis));
                    }
                    db.close();
                });
            } else {
                console.log('⚠️  Tabel buku kosong!');
                db.close();
            }
        });
    } else {
        console.log('❌ Tabel buku tidak ditemukan!');
        db.close();
    }
});