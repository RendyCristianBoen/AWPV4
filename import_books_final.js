const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

console.log('📖 MEMBACA FILE SQL...');

// Baca file SQL
const sqlContent = fs.readFileSync('perpustakaan_db.sql', 'utf8');

// Cari bagian INSERT INTO books
const booksSection = sqlContent.match(/INSERT INTO `books`[^;]+;/);
if (!booksSection) {
    console.error('❌ Tidak ditemukan data books dalam file SQL');
    process.exit(1);
}

const insertStatement = booksSection[0];

// Ekstrak semua baris values (format multi-line)
const lines = insertStatement.split('\n');
let booksData = [];

lines.forEach(line => {
    line = line.trim();
    
    // Cari baris yang berisi data buku (dimulai dengan angka dalam kurung)
    if (line.match(/^\(\d+/)) {
        // Hapus koma di akhir jika ada
        let cleanLine = line.replace(/,$/, '').replace(/\);$/, '');
        
        // Parse values
        const match = cleanLine.match(/^\((.*)\)$/);
        if (match) {
            const values = match[1].split(',').map(val => {
                let cleaned = val.trim();
                
                // Handle NULL values
                if (cleaned === 'NULL') return null;
                
                // Remove quotes
                if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
                    return cleaned.slice(1, -1)
                        .replace(/\\'/g, "'")
                        .replace(/\\"/g, '"')
                        .replace(/\\\\/g, '\\');
                }
                
                return cleaned;
            });
            
            if (values.length >= 14) {
                booksData.push(values);
            }
        }
    }
});

console.log(`📚 DITEMUKAN ${booksData.length} BUKU DALAM FILE SQL`);

if (booksData.length === 0) {
    console.error('❌ Tidak ada data buku yang bisa diimport');
    process.exit(1);
}

// Koneksi ke SQLite
const db = new sqlite3.Database('perpustakaan.db');

console.log('🧹 MENGHAPUS BUKU LAMA...');

db.serialize(() => {
    // Hapus buku yang sudah ada
    db.run('DELETE FROM books', function(err) {
        if (err) {
            console.error('❌ Error menghapus buku lama:', err.message);
            db.close();
            return;
        }
        
        console.log('✅ Buku lama berhasil dihapus');
        
        let imported = 0;
        let errors = 0;
        
        // Import setiap buku
        booksData.forEach((values, index) => {
            const sql = `INSERT INTO books 
                (id, judul, tahun_rilis, penulis, penerbit, genre, status, gambar, deskripsi, isbn, rating, total_dipinjam, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            
            db.run(sql, values, function(err) {
                if (err) {
                    console.error(`❌ Error buku ${index + 1} (ID: ${values[0]}):`, err.message);
                    errors++;
                } else {
                    imported++;
                    if (imported % 20 === 0) {
                        console.log(`✅ ${imported} buku berhasil diimport...`);
                    }
                }
                
                // Jika sudah selesai semua
                if (imported + errors === booksData.length) {
                    console.log('\n🎉 IMPORT SELESAI!');
                    console.log(`📊 Total diproses: ${booksData.length} buku`);
                    console.log(`✅ Berhasil diimport: ${imported} buku`);
                    console.log(`❌ Gagal: ${errors} buku`);
                    
                    // Verifikasi final
                    db.get('SELECT COUNT(*) as total FROM books', (err, row) => {
                        if (err) {
                            console.error('Error verifikasi:', err.message);
                        } else {
                            console.log(`🔍 TOTAL BUKU DI DATABASE: ${row.total} buku`);
                            
                            // Tampilkan sample buku
                            db.all('SELECT id, judul, penulis FROM books ORDER BY id LIMIT 5', (err, rows) => {
                                if (!err && rows.length > 0) {
                                    console.log('\n📖 CONTOH BUKU YANG TERSIMPAN:');
                                    rows.forEach((book, i) => {
                                        console.log(`${i + 1}. [ID:${book.id}] ${book.judul} - ${book.penulis}`);
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
});