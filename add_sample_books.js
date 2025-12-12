const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('perpustakaan.db');

console.log('📚 Menambahkan buku contoh ke database...');

const sampleBooks = [
    {
        title: 'Laskar Pelangi',
        author: 'Andrea Hirata',
        isbn: '9789793062792',
        year: 2005,
        publisher: 'Bentang Pustaka',
        genre: 'Fiksi',
        description: 'Kisah persahabatan anak-anak di Belitung yang penuh semangat dan impian',
        image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300',
        rating: 4.7,
        status: 'Tersedia'
    },
    {
        title: 'Bumi Manusia',
        author: 'Pramoedya Ananta Toer',
        isbn: '9789799731234',
        year: 1980,
        publisher: 'Hasta Mitra',
        genre: 'Sejarah',
        description: 'Novel sejarah tentang perjuangan melawan kolonialisme Belanda',
        image: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=300',
        rating: 4.8,
        status: 'Tersedia'
    },
    {
        title: 'Dilan: Dia adalah Dilanku Tahun 1990',
        author: 'Pidi Baiq',
        isbn: '9786022910456',
        year: 2014,
        publisher: 'Pastel Books',
        genre: 'Romantis',
        description: 'Kisah cinta remaja yang manis dan mengharukan',
        image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300',
        rating: 4.5,
        status: 'Tersedia'
    },
    {
        title: 'Negeri 5 Menara',
        author: 'Ahmad Fuadi',
        isbn: '9789794335555',
        year: 2009,
        publisher: 'Gramedia Pustaka Utama',
        genre: 'Inspirasi',
        description: 'Kisah inspiratif tentang perjuangan meraih mimpi',
        image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300',
        rating: 4.6,
        status: 'Tersedia'
    },
    {
        title: 'Perahu Kertas',
        author: 'Dee Lestari',
        isbn: '9789797802578',
        year: 2009,
        publisher: 'Bentang Pustaka',
        genre: 'Romantis',
        description: 'Kisah cinta dan persahabatan yang penuh lika-liku',
        image: 'https://images.unsplash.com/photo-1553729459-efe14ef08ea4?w=300',
        rating: 4.4,
        status: 'Tersedia'
    },
    {
        title: 'Sang Pemimpi',
        author: 'Andrea Hirata',
        isbn: '9789793062793',
        year: 2006,
        publisher: 'Bentang Pustaka',
        genre: 'Fiksi',
        description: 'Kelanjutan kisah Laskar Pelangi tentang perjuangan meraih mimpi',
        image: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=300',
        rating: 4.6,
        status: 'Tersedia'
    },
    {
        title: 'Ronggeng Dukuh Paruk',
        author: 'Ahmad Tohari',
        isbn: '9789794193298',
        year: 1982,
        publisher: 'Gramedia Pustaka Utama',
        genre: 'Drama',
        description: 'Kisah tragis seorang penari ronggeng di pedesaan Jawa',
        image: 'https://images.unsplash.com/photo-1535982337059-51a5bc529df7?w=300',
        rating: 4.5,
        status: 'Tersedia'
    },
    {
        title: 'Ayat-Ayat Cinta',
        author: 'Habiburrahman El Shirazy',
        isbn: '9789793607055',
        year: 2004,
        publisher: 'Republika',
        genre: 'Romantis',
        description: 'Kisah cinta islami yang penuh hikmah',
        image: 'https://images.unsplash.com/photo-1568827999250-3f6afff96a66?w=300',
        rating: 4.3,
        status: 'Tersedia'
    }
];

// Insert buku satu per satu
let inserted = 0;
sampleBooks.forEach((book, index) => {
    const sql = `INSERT INTO books (title, author, isbn, year, publisher, genre, description, image, rating, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const params = [
        book.title, book.author, book.isbn, book.year, book.publisher,
        book.genre, book.description, book.image, book.rating, book.status
    ];
    
    db.run(sql, params, function(err) {
        if (err) {
            console.error(`❌ Gagal menambahkan buku ${index + 1}:`, err.message);
        } else {
            inserted++;
            console.log(`✅ Buku ${index + 1}: ${book.title} berhasil ditambahkan`);
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