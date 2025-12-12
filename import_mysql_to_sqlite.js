const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Baca file SQL
const sqlFile = fs.readFileSync('perpustakaan_db.sql', 'utf8');

// Ekstrak hanya bagian INSERT untuk books
const booksInsertMatch = sqlFile.match(/INSERT INTO `books`[^;]+;/);
if (!booksInsertMatch) {
    console.error('❌ Tidak ditemukan data books dalam file SQL');
    process.exit(1);
}

const booksInsertSQL = booksInsertMatch[0];

// Koneksi ke SQLite
const dbPath = path.join(__dirname, 'perpustakaan.db');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Memproses data books dari MySQL ke SQLite...');

// Ekstrak semua nilai dari INSERT statement
const valuesRegex = /VALUES\s*\(([^)]+)\)/g;
let match;
let count = 0;

// Mulai transaction untuk performa lebih baik
db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    while ((match = valuesRegex.exec(booksInsertSQL)) !== null) {
        const values = match[1]
            .replace(/\),\s*\(/g, '|') // Pisahkan setiap row
            .split('|');
        
        for (const row of values) {
            const cleanRow = row.trim();
            if (!cleanRow) continue;
            
            // Parse nilai-nilai
            const valuesList = cleanRow.split(',').map(val => {
                let cleaned = val.trim();
                // Handle NULL values
                if (cleaned === 'NULL') return null;
                // Remove quotes and handle escaped characters
                if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
                    return cleaned.slice(1, -1).replace(/\\'/g, "'");
                }
                return cleaned;
            });
            
            // Insert ke SQLite
            const sql = `INSERT INTO books (id, judul, tahun_rilis, penulis, penerbit, genre, status, gambar, deskripsi, isbn, rating, total_dipinjam, created_at, updated_at) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            
            db.run(sql, valuesList, function(err) {
                if (err) {
                    console.error('❌ Error inserting book:', err.message);
                } else {
                    count++;
                    if (count % 20 === 0) {
                        console.log(`📚 ${count} buku berhasil diimport...`);
                    }
                }
            });
        }
    }
    
    db.run('COMMIT', () => {
        console.log(`✅ Selesai! ${count} buku berhasil diimport dari MySQL ke SQLite`);
        db.close();
    });
});