const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('perpustakaan.db');

console.log('📚 Menambahkan buku contoh ke database...');

const sampleBooks = [
    {
        judul: 'Laskar Pelangi',
        penulis: 'Andrea Hirata',
        isbn: '9789793062792',
        tahun_rilis: 2005,
        penerbit: 'Bentang Pustaka',
        genre: 'Fiksi',
        deskripsi: 'Kisah persahabatan anak-anak di Belitung yang penuh semangat dan impian',
        gambar: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300',
        rating: 4.7,
        status: 'Tersedia',
        total_dipinjam: 15
    },
    {
        judul: 'Bumi Manusia',
        penulis: 'Pramoedya Ananta Toer',
        isbn: '9789799731234',
        tahun_rilis: 1980,
        penerbit: 'Hasta Mitra',
        genre: 'Sejarah',
        deskripsi: 'Novel sejarah tentang perjuangan melawan kolonialisme Belanda',
        gambar: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=300',
        rating: 4.8,
        status: 'Tersedia',
        total_dipinjam: 12
    },
    {
        judul: 'Dilan: Dia adalah Dilanku Tahun 1990',
        penulis: 'Pidi Baiq',
        isbn: '9786022910456',
        tahun_rilis: 2014,
        penerbit: 'Pastel Books',
        genre: 'Romantis',
        deskripsi: 'Kisah cinta remaja yang manis dan mengharukan',
        gambar: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300',
        rating: 4.5,
        status: 'Tersedia',
        total_dipinjam: 18
    },
    {
        judul: 'Negeri 5 Menara',
        penulis: 'Ahmad Fuadi',
        isbn: '9789794335555',
        tahun_rilis: 2009,
        penerbit: 'Gramedia Pustaka Utama',
        genre: 'Inspirasi',
        deskripsi: 'Kisah inspiratif tentang perjuangan meraih mimpi',
        gambar: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300',
        rating: 4.6,
        status: 'Tersedia',
        total_dipinjam: 10
    },
    {
        judul: 'Perahu Kertas',
        penulis: 'Dee Lestari',
        isbn: '9789797802578',
        tahun_rilis: 2009,
        penerbit: 'Bentang Pustaka',
        genre: 'Romantis',
        deskripsi: 'Kisah cinta dan persahabatan yang penuh lika-liku',
        gambar: 'https://images.unsplash.com/photo-1553729459-efe14ef08ea4?w=300',
        rating: 4.4,
        status: 'Tersedia',
        total_dipinjam: 8
    },
    {
        judul: 'Sang Pemimpi',
        penulis: 'Andrea Hirata',
        isbn: '9789793062793',
        tahun_rilis: 2006,
        penerbit: 'Bentang Pustaka',
        genre: 'Fiksi',
        deskripsi: 'Kelanjutan kisah Laskar Pelangi tentang perjuangan meraih mimpi',
        gambar: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=300',
        rating: 4.6,
        status: 'Tersedia',
        total_dipinjam: 9
    },
    {
        judul: 'Ronggeng Dukuh Paruk',
        penulis: 'Ahmad Tohari',
        isbn: '9789794193298',
        tahun_rilis: 1982,
        penerbit: 'Gramedia Pustaka Utama',
        genre: 'Drama',
        deskripsi: 'Kisah tragis seorang penari ronggeng di pedesaan Jawa',
        gambar: 'https://images.unsplash.com/photo-1535982337059-51a5bc529df7?w=300',
        rating: 4.5,
        status: 'Tersedia',
        total_dipinjam: 7
    },
    {
        judul: 'Ayat-Ayat Cinta',
        penulis: 'Habiburrahman El Shirazy',
        isbn: '9789793607055',
        tahun_rilis: 2004,
        penerbit: 'Republika',
        genre: 'Romantis',
        deskripsi: 'Kisah cinta islami yang penuh hikmah',
        gambar: 'https://images.unsplash.com/photo-1568827999250-3f6afff96a66?w=300',
        rating: 4.3,
        status: 'Tersedia',
        total_dipinjam: 20
    }
];

// Insert buku satu per satu
let inserted = 0;
sampleBooks.forEach((book, index) => {
    const sql = `INSERT INTO books (judul, penulis, isbn, tahun_rilis, penerbit, genre, deskripsi, gambar, rating, status, total_dipinjam, created_at, updated_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`;
    
    const params = [
        book.judul, book.penulis, book.isbn, book.tahun_rilis, book.penerbit,
        book.genre, book.deskripsi, book.gambar, book.rating, book.status, book.total_dipinjam
    ];
    
    db.run(sql, params, function(err) {
        if (err) {
            console.error(`❌ Gagal menambahkan buku ${index + 1}:`, err.message);
        } else {
            inserted++;
            console.log(`✅ Buku ${index + 1}: ${book.judul} berhasil ditambahkan`);
        }
        
        // Jika semua buku sudah diproses
        if (index === sampleBooks.length - 1) {
            console.log(`\n🎉 ${inserted} dari ${sampleBooks.length} buku berhasil ditambahkan!`);
            
            // Verifikasi data yang sudah dimasukkan
            db.all('SELECT COUNT(*) as total FROM books', (err, result) => {
                if (err) {
                    console.error('❌ Error memverifikasi:', err.message);
                } else {
                    console.log(`📊 Total buku dalam database sekarang: ${result[0].total} buku`);
                }
                db.close();
            });
        }
    });
});