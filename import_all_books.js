const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

console.log('📖 MEMUAT DATA DARI FILE SQL...');

// Baca file SQL
const sqlContent = fs.readFileSync('perpustakaan_db.sql', 'utf8');

// Ekstrak bagian INSERT untuk books
const booksInsertMatch = sqlContent.match(/INSERT INTO `books`[^;]+;/);
if (!booksInsertMatch) {
    console.error('❌ Tidak ditemukan data books dalam file SQL');
    process.exit(1);
}

const insertStatement = booksInsertMatch[0];

// Ekstrak semua values dengan benar
const valuesPart = insertStatement.match(/VALUES\s*\((.*)\)/);
if (!valuesPart) {
    console.error('❌ Format VALUES tidak valid');
    process.exit(1);
}

// Pisahkan setiap row dengan benar
const allRows = valuesPart[1].split(/\),\s*\(/);
console.log(`📚 DITEMUKAN ${allRows.length} BUKU UNTUK DIIMPORT`);

// Koneksi ke SQLite
const db = new sqlite3.Database('perpustakaan.db');

// Hapus buku yang sudah ada
db.run('DELETE FROM books', function(err) {
    if (err) {
        console.error('❌ Error clearing books:', err.message);
        db.close();
        return;
    }
    
    console.log('🧹 TABEL BOOKS DIKOSONGKAN UNTUK IMPORT SEGAR');
    
    let imported = 0;
    let errors = 0;
    
    // Import setiap buku
    allRows.forEach((row, index) => {
        let cleanRow = row.trim();
        
        // Handle first and last row
        if (index === 0) cleanRow = cleanRow.replace(/^\(/, '');
        if (index === allRows.length - 1) cleanRow = cleanRow.replace(/\)$/, '');
        
        const values = cleanRow.split(',').map(val => {
            let cleaned = val.trim();
            
            // Handle NULL values
            if (cleaned === 'NULL') return null;
            
            // Remove quotes and handle escaped characters
            if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
                return cleaned.slice(1, -1)
                    .replace(/\\'/g, "'")
                    .replace(/\\"/g, '"')
                    .replace(/\\\\/g, '\\');
            }
            
            return cleaned;
        });
        
        if (values.length < 14) {
            console.log(`⚠️  Buku ${index + 1} format tidak valid, dilewati`);
            errors++;
            return;
        }
        
        const sql = `INSERT INTO books 
            (id, judul, tahun_rilis, penulis, penerbit, genre, status, gambar, deskripsi, isbn, rating, total_dipinjam, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        db.run(sql, values, function(err) {
            if (err) {
                console.error(`❌ Error buku ${index + 1}:`, err.message);
                errors++;
            } else {
                imported++;
                if (imported % 20 === 0) {
                    console.log(`✅ ${imported} buku berhasil diimport...`);
                }
            }
            
            // Jika sudah selesai semua
            if (imported + errors === allRows.length) {
                console.log('\n🎉 IMPORT SELESAI!');
                console.log(`📊 Total diproses: ${allRows.length} buku`);
                console.log(`✅ Berhasil diimport: ${imported} buku`);
                console.log(`❌ Gagal: ${errors} buku`);
                
                // Verifikasi final
                db.get('SELECT COUNT(*) as total FROM books', (err, row) => {
                    if (err) {
                        console.error('Error verifikasi:', err.message);
                    } else {
                        console.log(`🔍 TOTAL BUKU DI DATABASE: ${row.total} buku`);
                        
                        // Tampilkan sample buku
                        db.all('SELECT judul, penulis FROM books ORDER BY id LIMIT 5', (err, rows) => {
                            if (!err && rows.length > 0) {
                                console.log('\n📖 CONTOH BUKU YANG TERSIMPAN:');
                                rows.forEach((book, i) => {
                                    console.log(`${i + 1}. ${book.judul} - ${book.penulis}`);
                                });
                            }
                            db.close();
                        });
                    }
                });
            }
        });
    });
});