const fs = require('fs');

// Baca file SQL
const sqlContent = fs.readFileSync('perpustakaan_db.sql', 'utf8');

// Cari bagian INSERT INTO books
const booksInsertMatch = sqlContent.match(/INSERT INTO `books`[^;]+;/);
if (!booksInsertMatch) {
    console.log('❌ Tidak ditemukan data books dalam file SQL');
    process.exit(1);
}

const insertStatement = booksInsertMatch[0];

// Hitung jumlah baris dengan pattern (angka, ')
const bookLines = insertStatement.match(/\(\d+,\s*'/g);
const totalBooks = bookLines ? bookLines.length : 0;

console.log(`📚 TOTAL BUKU DALAM FILE SQL: ${totalBooks} buku`);

// Tampilkan beberapa contoh buku
const sampleBooks = insertStatement.match(/\(\d+,\s*'[^)]+\)/g);
if (sampleBooks) {
    console.log('\n📖 CONTOH BUKU:');
    sampleBooks.slice(0, 5).forEach((book, index) => {
        const match = book.match(/\(\d+,\s*'([^']+)'/);
        if (match) {
            console.log(`${index + 1}. ${match[1]}`);
        }
    });
    if (totalBooks > 5) {
        console.log(`... dan ${totalBooks - 5} buku lainnya`);
    }
}