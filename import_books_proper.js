const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

// Baca file SQL
const sqlContent = fs.readFileSync('perpustakaan_db.sql', 'utf8');

// Ekstrak bagian INSERT untuk books
const booksSection = sqlContent.match(/INSERT INTO `books`[^;]+;/);
if (!booksSection) {
    console.error('❌ Tidak ditemukan data books dalam file SQL');
    process.exit(1);
}

const insertStatement = booksSection[0];

// Ekstrak semua values
const valuesMatch = insertStatement.match(/VALUES\s*\((.*)\)/);
if (!valuesMatch) {
    console.error('❌ Tidak ditemukan values dalam INSERT statement');
    process.exit(1);
}

// Pisahkan setiap row
const allValues = valuesMatch[1].split('),(').map(row => {
    return row.replace(/\(|\)/g, '').split(',').map(val => {
        let cleaned = val.trim();
        // Handle NULL values
        if (cleaned === 'NULL') return null;
        // Remove quotes
        if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
            return cleaned.slice(1, -1).replace(/\\'/g, "'").replace(/\\"/g, '"');
        }
        return cleaned;
    });
});

console.log(`📚 Ditemukan ${allValues.length} buku dalam file SQL`);

// Koneksi ke SQLite
const db = new sqlite3.Database('perpustakaan.db');

// Hapus buku yang sudah ada sebelumnya (jika ingin fresh start)
db.run('DELETE FROM books', function(err) {
    if (err) {
        console.error('❌ Error clearing books:', err.message);
        db.close();
        return;
    }
    
    console.log('🧹 Membersihkan tabel books sebelumnya...');
    
    // Reset autoincrement
    db.run('DELETE FROM sqlite_sequence WHERE name="books"', function() {
        console.log('🔄 Memulai import buku...');
        
        let imported = 0;
        let errors = 0;
        
        // Import setiap buku
        allValues.forEach((values, index) => {
            if (values.length < 14) {
                console.log(`⚠️  Row ${index + 1} memiliki format tidak valid, dilewati`);
                errors++;
                return;
            }
            
            const sql = `INSERT INTO books 
                (id, judul, tahun_rilis, penulis, penerbit, genre, status, gambar, deskripsi, isbn, rating, total_dipinjam, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            
            db.run(sql, values, function(err) {
                if (err) {
                    console.error(`❌ Error inserting book ${index + 1}:`, err.message);
                    errors++;
                } else {
                    imported++;
                    if (imported % 20 === 0) {
                        console.log(`📖 ${imported} buku berhasil diimport...`);
                    }
                }
                
                // Jika sudah selesai semua
                if (imported + errors === allValues.length) {
                    console.log(`\n✅ IMPORT SELESAI!`);
                    console.log(`📊 Total: ${allValues.length} buku`);
                    console.log(`✅ Berhasil: ${imported} buku`);
                    console.log(`❌ Gagal: ${errors} buku`);
                    
                    // Verifikasi jumlah buku di database
                    db.get('SELECT COUNT(*) as total FROM books', (err, row) => {
                        if (err) console.error('Error verifying:', err.message);
                        else console.log(`🔍 Total buku di database: ${row.total}`);
                        db.close();
                    });
                }
            });
        });
    });
});