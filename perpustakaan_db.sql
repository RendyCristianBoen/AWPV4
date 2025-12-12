-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 18 Okt 2025 pada 10.07
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `perpustakaan_db`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `books`
--

CREATE TABLE `books` (
  `id` int(11) NOT NULL,
  `judul` varchar(255) NOT NULL,
  `tahun_rilis` int(11) NOT NULL,
  `penulis` varchar(100) NOT NULL,
  `penerbit` varchar(100) NOT NULL,
  `genre` varchar(50) NOT NULL,
  `status` enum('Tersedia','Dipinjam','Dalam Perbaikan') DEFAULT 'Tersedia',
  `gambar` text DEFAULT NULL,
  `deskripsi` text DEFAULT NULL,
  `isbn` varchar(20) DEFAULT NULL,
  `rating` decimal(2,1) DEFAULT 0.0,
  `total_dipinjam` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `books`
--

INSERT INTO `books` (`id`, `judul`, `tahun_rilis`, `penulis`, `penerbit`, `genre`, `status`, `gambar`, `deskripsi`, `isbn`, `rating`, `total_dipinjam`, `created_at`, `updated_at`) VALUES
(1, 'One Piece Vol. 1', 1997, 'Eiichiro Oda', 'Shueisha', 'Komik', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1630693315i/59228494.jpg', 'Petualangan Monkey D. Luffy dan kru Topi Jerami mencari harta karun One Piece untuk menjadi Raja Bajak Laut.', '978-4020332959', 4.8, 0, '2025-10-10 17:42:59', '2025-10-12 16:56:44'),
(2, 'Naruto Vol. 1', 1999, 'Masashi Kishimoto', 'Shueisha', 'Komik', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388188730i/6181577.jpg', 'Kisah ninja muda Naruto Uzumaki bercita-cita menjadi Hokage dan mendapatkan pengakuan dari desanya.', '978-4020332960', 4.7, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(3, 'Attack on Titan Vol. 1', 2009, 'Hajime Isayama', 'Kodansha', 'Komik', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327872634i/10440092.jpg', 'Perjuangan umat manusia melawan makhluk raksasa Titan yang mengancam keberadaan mereka.', '978-4020332977', 4.9, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(4, 'Dragon Ball Vol. 1', 1984, 'Akira Toriyama', 'Shueisha', 'Komik', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1337540857i/13375408.jpg', 'Petualangan Goku mencari bola naga sambil melawan musuh-musuh kuat untuk melindungi Bumi.', '978-4020332984', 4.6, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(5, 'My Hero Academia Vol. 1', 2014, 'Kohei Horikoshi', 'Shueisha', 'Komik', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1421735678i/25074525.jpg', 'Kisah Izuku Midoriya bercita-cita menjadi pahlawan super meski terlahir tanpa kekuatan.', '978-4020332991', 4.5, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(6, 'Demon Slayer Vol. 1', 2016, 'Koyoharu Gotouge', 'Shueisha', 'Komik', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1544544916i/43263580.jpg', 'Perjalanan Tanjiro Kamado menjadi pembasmi iblis untuk menyelamatkan adiknya Nezuko.', '978-4020333004', 4.8, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(7, 'Filosofi Teras', 2018, 'Henry Manampiring', 'Kompas Gramedia', 'NonFiksi', 'Tersedia', 'https://cdn.gramedia.com/uploads/items/9786024125189_Filosofi-Teras.jpg', 'Panduan praktis filsafat Stoa untuk menghadapi tantangan hidup modern dengan bijaksana.', '978-6024125189', 4.9, 1, '2025-10-10 17:42:59', '2025-10-10 19:51:12'),
(8, 'Sapiens: Riwayat Singkat Umat Manusia', 2011, 'Yuval Noah Harari', 'Kepustakaan Populer Gramedia', 'NonFiksi', 'Tersedia', 'https://cdn.gramedia.com/uploads/items/9786024241520_sapiens_rev.jpg', 'Eksplorasi mendalam sejarah umat manusia dari asal-usulnya hingga dominasinya di planet Bumi.', '978-6024241520', 4.9, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(9, 'Atomic Habits', 2018, 'James Clear', 'Gramedia Pustaka Utama', 'NonFiksi', 'Tersedia', 'https://cdn.gramedia.com/uploads/items/9786020633172_Atomic_Habits.jpg', 'Kerangka kerja untuk meningkatkan diri setiap hari dengan membentuk kebiasaan baik yang kecil namun konsisten.', '978-6020633172', 4.9, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(10, 'Laskar Pelangi', 2005, 'Andrea Hirata', 'Bentang Pustaka', 'Fiksi', 'Tersedia', 'https://cdn.gramedia.com/uploads/items/9789791227020_Laskar_Pelangi.jpg', 'Kisah inspiratif sepuluh anak dari Belitung yang berjuang meraih mimpi di tengah keterbatasan ekonomi.', '978-9791227020', 4.6, 1, '2025-10-10 17:42:59', '2025-10-10 19:39:35'),
(11, 'Bumi Manusia', 1980, 'Pramoedya Ananta Toer', 'Lentera Dipantara', 'Fiksi', 'Tersedia', 'https://cdn.gramedia.com/uploads/items/9789799731234_Bumi_Manusia.jpg', 'Roman sejarah tentang perjuangan Minke melawan kolonialisme dan pencarian identitas di era Hindia Belanda.', '978-9799731234', 4.8, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(12, 'Harry Potter and the Sorcerer\'s Stone', 1997, 'J.K. Rowling', 'Bloomsbury', 'Fantasi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1474154022i/3.jpg', 'Petualangan Harry Potter menemukan warisan sihirnya di Sekolah Sihir Hogwarts tahun pertamanya.', '978-0747532743', 4.9, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(13, 'The Hobbit', 1937, 'J.R.R. Tolkien', 'Allen & Unwin', 'Fantasi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1546071216i/5907.jpg', 'Petualangan Bilbo Baggins yang tak terduga bersama para kurcaci untuk merebut kembali harta karun dari naga Smaug.', '978-0547928227', 4.8, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(14, 'The Lord of the Rings: Fellowship of the Ring', 1954, 'J.R.R. Tolkien', 'Allen & Unwin', 'Fantasi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1654215925i/61215351.jpg', 'Epik fantasi tentang perjalanan Frodo Baggins untuk menghancurkan One Ring dan menyelamatkan Middle-earth.', '978-0544003415', 4.9, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(15, 'The Chronicles of Narnia: The Lion, The Witch and The Wardrobe', 1950, 'C.S. Lewis', 'Geoffrey Bles', 'Fantasi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1442729704i/11127.jpg', 'Petualangan empat saudara yang menemukan dunia ajaib Narnia melalui lemari pakaian ajaib.', '978-0064471190', 4.7, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(16, 'Sherlock Holmes: A Study in Scarlet', 1887, 'Arthur Conan Doyle', 'Ward Lock & Co', 'Misteri', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1164045516i/2444816.jpg', 'Kasus pertama Sherlock Holmes dan Dr. Watson memecahkan misteri pembunuhan dengan petunjuk mengejutkan.', '978-0553212419', 4.6, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(17, 'Murder on the Orient Express', 1934, 'Agatha Christie', 'Collins Crime Club', 'Misteri', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1486131451i/853510.jpg', 'Detektif Hercule Poirot menyelidiki pembunuhan misterius di kereta api mewah yang terperangkap salju.', '978-0062693662', 4.7, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(18, 'The Da Vinci Code', 2003, 'Dan Brown', 'Doubleday', 'Misteri', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1579621267i/968.jpg', 'Robert Langdon memecahkan kode kuno yang mengungkap rahasia besar tentang sejarah Kristen.', '978-0307474278', 4.5, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(19, 'The Girl with the Dragon Tattoo', 2005, 'Stieg Larsson', 'Norstedts Förlag', 'Misteri', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327868566i/2429135.jpg', 'Jurnalis Mikael Blomkvist dan hacker Lisbeth Salander menyelidiki hilangnya wanita muda 40 tahun lalu.', '978-0307454546', 4.4, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(20, 'Gone Girl', 2012, 'Gillian Flynn', 'Crown Publishing', 'Misteri', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1554086139i/19288043.jpg', 'Kisah psikologis tentang pernikahan yang berantakan dan istri yang menghilang secara misterius.', '978-0307588371', 4.3, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(21, 'Steve Jobs', 2011, 'Walter Isaacson', 'Simon & Schuster', 'Biografi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1511288480i/11084145.jpg', 'Biografi mendalam tentang visioner Apple Steve Jobs berdasarkan wawancara eksklusif dan penelitian.', '978-1451648539', 4.7, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(22, 'The Diary of a Young Girl', 1947, 'Anne Frank', 'Contact Publishing', 'Biografi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1560816565i/48855.jpg', 'Catatan harian Anne Frank selama bersembunyi dari Nazi, menggambarkan harapan di tengah kengerian perang.', '978-0553296983', 4.8, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(23, 'I Am Malala', 2013, 'Malala Yousafzai', 'Little, Brown', 'Biografi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1375414895i/17851835.jpg', 'Kisah inspiratif Malala Yousafzai memperjuangkan pendidikan perempuan dan bertahan dari serangan Taliban.', '978-0316322409', 4.7, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(24, 'Becoming', 2018, 'Michelle Obama', 'Crown Publishing', 'Biografi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1528206996i/38746485.jpg', 'Memoar mendalam Michelle Obama tentang perjalanan hidupnya dari Chicago hingga menjadi Ibu Negara AS.', '978-1524763138', 4.9, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(25, 'Elon Musk: Tesla, SpaceX, and the Quest for a Fantastic Future', 2015, 'Ashlee Vance', 'Ecco', 'Biografi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1518291452i/25541028.jpg', 'Biografi visioner Elon Musk dan perusahaannya yang mengubah industri otomotif dan antariksa.', '978-0062301239', 4.6, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(26, 'A Brief History of Time', 1988, 'Stephen Hawking', 'Bantam Books', 'Sains', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1333578746i/3869.jpg', 'Penjelasan tentang kosmologi, lubang hitam, light cone, dan teori besar alam semesta untuk pembaca awam.', '978-0553380163', 4.7, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(27, 'Cosmos', 1980, 'Carl Sagan', 'Random House', 'Sains', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1401903320i/55030.jpg', 'Perjalanan epik melalui 15 miliar tahun evolusi kosmik yang mengubah pemahaman kita tentang alam semesta.', '978-0345539434', 4.9, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(28, 'The Selfish Gene', 1976, 'Richard Dawkins', 'Oxford University Press', 'Sains', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1366758096i/61535.jpg', 'Revolusi pemikiran evolusi yang berfokus pada gen sebagai unit seleksi alam yang fundamental.', '978-0199291151', 4.6, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(29, 'The Gene: An Intimate History', 2016, 'Siddhartha Mukherjee', 'Scribner', 'Sains', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1457209364i/27276428.jpg', 'Sejarah gen dari penemuan Mendel hingga teknologi CRISPR, ditulis dengan narasi yang memukau.', '978-1476733500', 4.7, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(30, 'The Art of War', -500, 'Sun Tzu', 'Various', 'Sejarah', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1630683326i/10534.jpg', 'Risalah militer klasik Tiongkok tentang strategi, taktik, dan filosofi perang yang masih relevan hingga kini.', '978-1590302255', 4.5, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(31, 'Guns, Germs, and Steel', 1997, 'Jared Diamond', 'W.W. Norton', 'Sejarah', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1453215833i/1842.jpg', 'Teori tentang mengapa peradaban Eurasia mendominasi dunia karena faktor geografi dan lingkungan.', '978-0393317558', 4.5, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(32, 'A People\'s History of the United States', 1980, 'Howard Zinn', 'Harper & Row', 'Sejarah', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1355442822i/2767.jpg', 'Sejarah Amerika dari perspektif rakyat biasa, buruh, budak, imigran, perempuan, dan penduduk asli.', '978-0062397348', 4.7, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(33, 'Dilan 1990', 2014, 'Pidi Baiq', 'Pastel Books', 'Fiksi', 'Tersedia', 'https://cdn.gramedia.com/uploads/items/9786027888691_Dilan_1990.jpg', 'Kisah cinta masa SMA antara Milea dan Dilan di Bandung tahun 1990 dengan romansa yang manis dan mengharukan.', '978-6027888691', 4.5, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(34, 'Pulang', 2015, 'Tere Liye', 'Gramedia Pustaka Utama', 'Fiksi', 'Tersedia', 'https://cdn.gramedia.com/uploads/items/9786020312896_Pulang.jpg', 'Petualangan Bujang mencari jati diri dan makna pulang setelah bertualang ke berbagai penjuru dunia.', '978-6020312896', 4.6, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(35, 'Hujan', 2016, 'Tere Liye', 'Gramedia Pustaka Utama', 'Fiksi', 'Tersedia', 'https://cdn.gramedia.com/uploads/items/9786020314463_Hujan.jpg', 'Kisah Lail dan Esok dalam dunia pasca-apokaliptik yang penuh dengan harapan dan cinta di tengah kehancuran.', '978-6020314463', 4.5, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(36, 'The Kite Runner', 2003, 'Khaled Hosseini', 'Riverhead Books', 'Fiksi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1579036753i/77203.jpg', 'Kisah persahabatan, pengkhianatan, dan penebusan antara Amir dan Hassan di Afghanistan yang bergejolak.', '978-1594631931', 4.7, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(37, 'To Kill a Mockingbird', 1960, 'Harper Lee', 'J.B. Lippincott', 'Fiksi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1553383690i/2657.jpg', 'Kisah tentang rasisme dan ketidakadilan di Alabama melalui mata anak-anak, dengan Atticus Finch sebagai pahlawan moral.', '978-0061120084', 4.8, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(38, '1984', 1949, 'George Orwell', 'Secker & Warburg', 'Fiksi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1657781256i/61439040.jpg', 'Distopia tentang masyarakat totaliter di bawah pengawasan Big Brother dan bahaya totalitarianisme.', '978-0451524935', 4.7, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(39, 'Pride and Prejudice', 1813, 'Jane Austen', 'T. Egerton', 'Fiksi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1320399351i/1885.jpg', 'Komedi romantis tentang Elizabeth Bennet dan Mr. Darcy dalam masyarakat Inggris abad ke-19 yang penuh kelas sosial.', '978-0141439518', 4.8, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(40, 'The Great Gatsby', 1925, 'F. Scott Fitzgerald', 'Charles Scribner\'s Sons', 'Fiksi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1490528560i/4671.jpg', 'Kritik terhadap American Dream melalui kisah Jay Gatsby yang obsesif dan masyarakat Jazz Age yang glamor.', '978-0743273565', 4.3, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(41, 'One Hundred Years of Solitude', 1967, 'Gabriel García Márquez', 'Editorial Sudamericana', 'Fiksi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327881361i/320.jpg', 'Realisme magis tentang keluarga Buendía selama tujuh generasi di kota fiksi Macondo, Kolombia.', '978-0060883287', 4.6, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(42, 'The Alchemist', 1988, 'Paulo Coelho', 'HarperTorch', 'Fiksi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1654371463i/18144590.jpg', 'Perjalanan spiritual gembala Santiago mencari harta karun dan menemukan makna hidup sejati di padang pasir.', '978-0061122415', 4.5, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(43, 'The Little Prince', 1943, 'Antoine de Saint-Exupéry', 'Reynal & Hitchcock', 'Fiksi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1367545443i/157993.jpg', 'Fabel filosofis tentang pangeran kecil dari asteroid yang belajar tentang cinta, persahabatan, dan makna hidup.', '978-0156012195', 4.9, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(44, 'The Hunger Games', 2008, 'Suzanne Collins', 'Scholastic', 'Fiksi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1586722975i/2767052.jpg', 'Katniss Everdeen bertarung dalam pertandingan mematikan di dunia dystopian Panem yang terbagi distrik.', '978-0439023481', 4.5, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(45, 'The Book Thief', 2005, 'Markus Zusak', 'Picador', 'Fiksi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1522157426i/19063.jpg', 'Kisah Liesel Meminger di Nazi Jerman yang menemukan kekuatan kata-kata dan buku di tengah kengerian perang.', '978-0375842207', 4.7, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(46, 'The Fault in Our Stars', 2012, 'John Green', 'Dutton Books', 'Fiksi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1360206420i/11870085.jpg', 'Kisah cinta Hazel dan Augustus, dua remaja penderita kanker yang menemukan makna hidup dan cinta sejati.', '978-0525478812', 4.4, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(47, 'Dune', 1965, 'Frank Herbert', 'Chilton Books', 'Fiksi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1555447414i/44767458.jpg', 'Epik sains fiksi tentang Paul Atreides di planet gurun Arrakis yang kaya dengan rempah melange yang berharga.', '978-0441172719', 4.6, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(48, 'Foundation', 1951, 'Isaac Asimov', 'Gnome Press', 'Fiksi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1417900846i/29579.jpg', 'Psychohistorian Hari Seldon mendirikan Foundation untuk mempersingkat zaman kegelapan setelah kejatuhan Galactic Empire.', '978-0553293357', 4.5, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(49, 'The Martian', 2011, 'Andy Weir', 'Crown', 'Fiksi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1413706054i/18007564.jpg', 'Astronot Mark Watney terdampar sendirian di Mars dan harus bertahan hidup dengan kecerdasan dan selera humor.', '978-0553418026', 4.7, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(50, 'Ready Player One', 2011, 'Ernest Cline', 'Crown', 'Fiksi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1500930947i/9969571.jpg', 'Perburuan harta karun di dunia virtual OASIS yang penuh dengan referensi budaya pop 1980-an dan teka-teki rumit.', '978-0307887436', 4.4, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(51, 'The Three-Body Problem', 2008, 'Liu Cixin', 'Chongqing Press', 'Fiksi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1415428227i/20518872.jpg', 'Kontak pertama dengan peradaban alien yang mengancam Bumi, menggabungkan fisika, sejarah, dan filosofi.', '978-0765377067', 4.3, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(52, 'Neuromancer', 1984, 'William Gibson', 'Ace', 'Fiksi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1554437249i/6088007.jpg', 'Hacker Case direkrut untuk pembobolan AI yang mengubah realitas di dunia cyberpunk yang gelap dan futuristik.', '978-0441569595', 4.3, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(53, 'Snow Crash', 1992, 'Neal Stephenson', 'Bantam', 'Fiksi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1589842551i/830.jpg', 'Hiro Protagonist melawan virus komputer yang bisa menginfeksi otak manusia di metaverse dan dunia nyata.', '978-0553380958', 4.2, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(54, 'Ender\'s Game', 1985, 'Orson Scott Card', 'Tor Books', 'Fiksi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1408303130i/375802.jpg', 'Anak jenius Ender Wiggin dilatih di Battle School untuk memimpin pertahanan Bumi melawan alien Formic.', '978-0812550702', 4.5, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(55, 'The Handmaid\'s Tale', 1985, 'Margaret Atwood', 'McClelland and Stewart', 'Fiksi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1578028274i/38447.jpg', 'Di Republik Gilead, Offred adalah Handmaid yang dipaksa melahirkan untuk elite dalam masyarakat teokratis.', '978-0385490818', 4.3, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(56, 'The Testaments', 2019, 'Margaret Atwood', 'Nan A. Talese', 'Fiksi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1554316221i/42975172.jpg', 'Sequel The Handmaid\'s Tale yang mengungkap rahasia dalam Republik Gilead dari tiga perspektif berbeda.', '978-0385543781', 4.2, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(57, 'Normal People', 2018, 'Sally Rooney', 'Faber & Faber', 'Fiksi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1571423190i/41057294.jpg', 'Kisah cinta rumit antara Connell dan Marianne dari masa SMA hingga kuliah di Irlandia yang penuh dinamika.', '978-0571334650', 4.0, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(58, 'Where the Crawdads Sing', 2018, 'Delia Owens', 'G.P. Putnam\'s Sons', 'Fiksi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1582135294i/36809135.jpg', 'Kya Clark, \"Marsh Girl\" yang hidup sendiri di rawa Carolina, dituduh membunuh mantan kekasihnya.', '978-0735219090', 4.7, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(59, 'The Seven Husbands of Evelyn Hugo', 2017, 'Taylor Jenkins Reid', 'Atria Books', 'Fiksi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1498168986i/32620332.jpg', 'Legenda Hollywood Evelyn Hugo mengungkap kisah hidupnya dan tujuh pernikahannya kepada jurnalis muda.', '978-1501161933', 4.5, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(60, 'Little Fires Everywhere', 2017, 'Celeste Ng', 'Penguin Press', 'Fiksi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1502684533i/34273236.jpg', 'Konflik antara keluarga kaya Richardson dan seniman misterius Mia Warren di kota suburban yang teratur.', '978-0735224292', 4.4, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(61, 'The Nightingale', 2015, 'Kristin Hannah', 'St. Martin\'s Press', 'Fiksi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1451446316i/21853621.jpg', 'Dua saudara perempuan di Prancis Nazi mengambil jalan berbeda untuk bertahan hidup selama Perang Dunia II.', '978-0312577223', 4.8, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(62, 'The Great Alone', 2018, 'Kristin Hannah', 'St. Martin\'s Press', 'Fiksi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1486021216i/34927832.jpg', 'Keluarga Allbright pindah ke Alaska yang liar untuk memulai hidup baru, tetapi alam dan masa lalu mengancam.', '978-0312577230', 4.6, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(63, 'Educated', 2018, 'Tara Westover', 'Random House', 'Biografi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1506026635i/35133922.jpg', 'Memoar tentang tumbuh besar dalam keluarga survivalis di pegunungan Idaho tanpa pendidikan formal hingga masuk Harvard.', '978-0399590504', 4.7, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(64, 'Born a Crime', 2016, 'Trevor Noah', 'Spiegel & Grau', 'Biografi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1473867911i/29780253.jpg', 'Kisah masa kecil Trevor Noah tumbuh sebagai anak campuran selama apartheid Afrika Selatan dengan humor dan insight.', '978-0399588174', 4.8, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(65, 'When Breath Becomes Air', 2016, 'Paul Kalanithi', 'Random House', 'Biografi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1492677644i/25899336.jpg', 'Neurosurgeon muda yang didiagnosis kanker terminal merefleksikan makna hidup, kematian, dan kedokteran.', '978-0812988406', 4.8, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(66, 'The Glass Castle', 2005, 'Jeannette Walls', 'Scribner', 'Biografi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1400930557i/7445.jpg', 'Memoar tentang masa kecil tidak biasa dengan orang tua yang brilliant namun dysfunctional dalam kemiskinan Amerika.', '978-0743247542', 4.5, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(67, 'Into the Wild', 1996, 'Jon Krakauer', 'Villard Books', 'Biografi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1634587789i/1845.jpg', 'Kisah Christopher McCandless yang meninggalkan kehidupan mewah untuk hidup di alam liar Alaska dan menemui ajal.', '978-0385486804', 4.4, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(68, 'The Immortal Life of Henrietta Lacks', 2010, 'Rebecca Skloot', 'Crown', 'Biografi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327878164i/6493208.jpg', 'Kisah sel HeLa yang abadi dari wanita Afrika-Amerika miskin yang merevolusi kedokteran tanpa sepengetahuannya.', '978-1400052172', 4.7, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(69, 'Shoe Dog', 2016, 'Phil Knight', 'Scribner', 'Biografi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1469035799i/27220736.jpg', 'Memoar pendiri Nike tentang perjalanan dari menjual sepatu dari bagasi mobil hingga menjadi empire olahraga global.', '978-1501135910', 4.8, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(70, 'Leonardo da Vinci', 2017, 'Walter Isaacson', 'Simon & Schuster', 'Biografi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1505294774i/34684622.jpg', 'Biografi jenius Renaissance Leonardo da Vinci yang menghubungkan seni, sains, dan rasa ingin tahu tanpa batas.', '978-1501139154', 4.7, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(71, 'The Wright Brothers', 2015, 'David McCullough', 'Simon & Schuster', 'Biografi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1420735580i/24162590.jpg', 'Kisah Orville dan Wilbur Wright, dua bersaudara dari Ohio yang mengubah dunia dengan menciptakan pesawat terbang.', '978-1476728742', 4.5, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(72, 'Alexander Hamilton', 2004, 'Ron Chernow', 'Penguin Press', 'Biografi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1331265666i/16130.jpg', 'Biografi mendalam Alexander Hamilton yang menginspirasi musical Broadway fenomenal karya Lin-Manuel Miranda.', '978-1594200090', 4.8, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(73, 'The Romanovs: 1613-1918', 2016, 'Simon Sebag Montefiore', 'Knopf', 'Sejarah', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1452629327i/25662770.jpg', 'Sejarah dinasti Romanov Rusia selama 300 tahun dari kebangkitan hingga kejatuhan tragis dalam Revolusi Bolshevik.', '978-0307266521', 4.5, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(74, 'The Plantagenets: The Warrior Kings and Queens Who Made England', 2012, 'Dan Jones', 'Viking', 'Sejarah', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1348269456i/13641642.jpg', 'Kisah dinasti Plantagenet yang memerintah Inggris selama 250 tahun dengan perang, intrik, dan pencapaian besar.', '978-0670026654', 4.6, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(75, 'The Crusades: The Authoritative History of the War for the Holy Land', 2010, 'Thomas Asbridge', 'Ecco', 'Sejarah', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1348269456i/13641642.jpg', 'Narasi komprehensif tentang Perang Salib yang menggabungkan perspektif Kristen dan Muslim tentang konflik 200 tahun.', '978-0060787295', 4.5, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(76, 'Homo Deus: A Brief History of Tomorrow', 2015, 'Yuval Noah Harari', 'Harper', 'Sejarah', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1468760809i/31138556.jpg', 'Visi masa depan umat manusia ketika kita mengatasi kelaparan, perang, dan wabah, menuju dewa melalui teknologi.', '978-0062464316', 4.4, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(77, '21 Lessons for the 21st Century', 2018, 'Yuval Noah Harari', 'Spiegel & Grau', 'Sejarah', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1530709035i/38820046.jpg', 'Analisis tantangan terbesar abad ke-21 termasuk AI, fake news, terorisme, dan krisis eksistensial manusia.', '978-0525512172', 4.3, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(78, 'The Better Angels of Our Nature: Why Violence Has Declined', 2011, 'Steven Pinker', 'Viking', 'Sejarah', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1348673690i/11324722.jpg', 'Argumentasi bahwa kekerasan telah menurun secara dramatis sepanjang sejarah manusia meski bertentangan dengan intuisi.', '978-0670022953', 4.5, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(79, 'Why Nations Fail: The Origins of Power, Prosperity, and Poverty', 2012, 'Daron Acemoglu & James Robinson', 'Crown', 'Sejarah', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1348673690i/11324722.jpg', 'Teori bahwa keberhasilan negara ditentukan oleh institusi politik dan ekonomi inklusif versus ekstraktif.', '978-0307719218', 4.6, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(80, 'Thinking, Fast and Slow', 2011, 'Daniel Kahneman', 'Farrar, Straus and Giroux', 'Sains', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1317793965i/11468377.jpg', 'Eksplorasi dua sistem pemikiran manusia: cepat-intuitif dan lambat-analitis, serta bias kognitif yang mempengaruhi keputusan.', '978-0374275631', 4.7, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(81, 'The Power of Habit: Why We Do What We Do in Life and Business', 2012, 'Charles Duhigg', 'Random House', 'Sains', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1366758686i/12609433.jpg', 'Penjelasan tentang sains pembentukan kebiasaan dan bagaimana mengubah kebiasaan buruk menjadi baik untuk kesuksesan.', '978-1400069286', 4.6, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(82, 'Influence: The Psychology of Persuasion', 1984, 'Robert B. Cialdini', 'Harper Business', 'Sains', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1462729704i/28815.jpg', 'Enam prinsip psikologi persuasi yang digunakan dalam pemasaran, penjualan, dan pengaruh sosial sehari-hari.', '978-0061241895', 4.7, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(83, 'Predictably Irrational: The Hidden Forces That Shape Our Decisions', 2008, 'Dan Ariely', 'HarperCollins', 'Sains', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1348252298i/1713426.jpg', 'Eksperimen yang menunjukkan bagaimana emosi dan bias mempengaruhi keputusan ekonomi kita secara sistematis.', '978-0061353239', 4.4, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(84, 'Nudge: Improving Decisions About Health, Wealth, and Happiness', 2008, 'Richard Thaler & Cass Sunstein', 'Yale University Press', 'Sains', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1348252298i/1713426.jpg', 'Konsep \"libertarian paternalism\" menggunakan nudges untuk membantu orang membuat keputusan yang lebih baik tanpa paksaan.', '978-0300122237', 4.5, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(85, 'The Black Swan: The Impact of the Highly Improbable', 2007, 'Nassim Nicholas Taleb', 'Random House', 'Sains', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1348252298i/1713426.jpg', 'Teori tentang peristiwa langka dan tak terduga yang memiliki dampak besar dan kecenderungan manusia untuk merasionalisasinya.', '978-1400063512', 4.3, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(86, 'The Signal and the Noise: Why So Many Predictions Fail—but Some Don\'t', 2012, 'Nate Silver', 'Penguin Press', 'Sains', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1348252298i/1713426.jpg', 'Seni dan sains prediksi dalam berbagai bidang mulai dari politik, ekonomi, cuaca, hingga olahraga dan perjudian.', '978-1594204111', 4.2, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(87, 'The Man Who Mistook His Wife for a Hat', 1985, 'Oliver Sacks', 'Summit Books', 'Sains', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1447047703i/63697.jpg', 'Kumpulan kasus neurologis yang aneh dan menarik yang mengungkap kompleksitas otak manusia dan identitas diri.', '978-0684853949', 4.7, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(88, 'The Emperor of All Maladies: A Biography of Cancer', 2010, 'Siddhartha Mukherjee', 'Scribner', 'Sains', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1307458643i/7170627.jpg', 'Sejarah komprehensif kanker dari zaman kuno hingga terapi modern, ditulis dengan narasi yang memukau dan humanis.', '978-1439107959', 4.8, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(89, 'The Body: A Guide for Occupants', 2019, 'Bill Bryson', 'Doubleday', 'Sains', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1568620715i/43582376.jpg', 'Tur menyenangkan melalui tubuh manusia dengan humor khas Bryson, menjelaskan keajaiban dan keanehan fisiologi kita.', '978-0385539302', 4.6, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(90, 'A Short History of Nearly Everything', 2003, 'Bill Bryson', 'Broadway Books', 'Sains', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1433086293i/21.jpg', 'Perjalanan melalui sains dari Big Bang hingga peradaban manusia, membuat konsep kompleks menjadi mudah dan menghibur.', '978-0767908184', 4.7, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(91, 'The Demon-Haunted World: Science as a Candle in the Dark', 1995, 'Carl Sagan', 'Random House', 'Sains', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1331533658i/112225.jpg', 'Pembelaan Carl Sagan tentang metode ilmiah sebagai alat untuk membedakan fakta dari fiksi dalam dunia penuh klaim palsu.', '978-0345409461', 4.8, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(92, 'Jurassic Park', 1990, 'Michael Crichton', 'Knopf', 'Fiksi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388189400i/40604658.jpg', 'Taman hiburan dengan dinosaurus hasil kloning menjadi mimpi buruk ketika sistem keamanan gagal dan predator lolos.', '978-0394588162', 4.6, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(93, 'The Lost World', 1995, 'Michael Crichton', 'Knopf', 'Fiksi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388189400i/40604658.jpg', 'Sequel Jurassic Park dimana tim kembali ke pulau kedua yang berisi dinosaurus lebih berbahaya dan rahasia gelap.', '978-0679419469', 4.3, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(94, 'The Firm', 1991, 'John Grisham', 'Doubleday', 'Fiksi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388189400i/40604658.jpg', 'Pengacara muda menemukan firma hukum impiannya sebenarnya front untuk organisasi kejahatan terorganisir Chicago.', '978-0385412706', 4.5, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(95, 'The Pelican Brief', 1992, 'John Grisham', 'Doubleday', 'Fiksi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388189400i/40604658.jpg', 'Mahasiswa hukum menulis brief tentang pembunuhan dua Hakim Agung dan menjadi target pembunuh bayaran.', '978-0385418241', 4.4, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(96, 'The Client', 1993, 'John Grisham', 'Doubleday', 'Fiksi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388189400i/40604658.jpg', 'Bocah 11 tahun menyaksikan bunuh diri pengacara mafia dan mengetahui lokasi mayat senator, menjadi target banyak pihak.', '978-0385424716', 4.3, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(97, 'A Time to Kill', 1989, 'John Grisham', 'Wynwood Press', 'Fiksi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388189400i/40604658.jpg', 'Pengacara putih membela ayah kulit hitam yang membunuh pemerkosa putrinya di Mississippi yang masih rasis tahun 1980-an.', '978-0922066416', 4.6, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(98, 'The Name of the Wind', 2007, 'Patrick Rothfuss', 'DAW Books', 'Fantasi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1270352123i/186074.jpg', 'Kisah Kvothe, legenda hidup yang menceritakan masa mudanya sebagai musisi, mahasiswa, dan pemburu iblis.', '978-0756404079', 4.8, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(99, 'Mistborn: The Final Empire', 2006, 'Brandon Sanderson', 'Tor Books', 'Fantasi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1617768316i/68428.jpg', 'Kelompok pemberontak dengan kemampuan mistborn berusaha menggulingkan Lord Ruler yang abadi di dunia Scadrial.', '978-0765311788', 4.7, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(100, 'A Game of Thrones', 1996, 'George R.R. Martin', 'Bantam Spectra', 'Fantasi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1562726234i/13496.jpg', 'Perebutan Iron Throne di Westeros dengan intrik politik, pertempuran, dan ancaman musim dingin yang abadi.', '978-0553103540', 4.6, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(101, 'American Gods', 2001, 'Neil Gaiman', 'William Morrow', 'Fantasi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1462924585i/30165203.jpg', 'Shadow Moon terjebat dalam perang antara dewa-dewa lama dan dewa baru di Amerika kontemporer yang penuh misteri.', '978-0062059888', 4.3, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(102, 'Good Omens', 1990, 'Neil Gaiman & Terry Pratchett', 'Gollancz', 'Fantasi', 'Tersedia', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1392528568i/12067.jpg', 'Komedi tentang malaikat Aziraphale dan iblis Crowley yang berusaha mencegah kiamat karena sudah nyaman di Bumi.', '978-0060853983', 4.7, 0, '2025-10-10 17:42:59', '2025-10-10 17:42:59');

-- --------------------------------------------------------

--
-- Struktur dari tabel `loan_history`
--

CREATE TABLE `loan_history` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `tanggal_pinjam` datetime DEFAULT current_timestamp(),
  `tanggal_kembali` datetime DEFAULT NULL,
  `batas_pengembalian` datetime NOT NULL,
  `status` enum('Dipinjam','Dikembalikan','Terlambat','Hilang') DEFAULT 'Dipinjam',
  `denda` decimal(10,2) DEFAULT 0.00,
  `durasi_hari` int(11) DEFAULT 7,
  `catatan` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `loan_history`
--

INSERT INTO `loan_history` (`id`, `user_id`, `book_id`, `tanggal_pinjam`, `tanggal_kembali`, `batas_pengembalian`, `status`, `denda`, `durasi_hari`, `catatan`, `created_at`, `updated_at`) VALUES
(1, 3, 10, '2025-10-11 02:17:07', '2025-10-11 02:39:35', '2025-10-18 02:17:07', 'Dikembalikan', 0.00, 7, NULL, '2025-10-10 19:17:07', '2025-10-10 19:39:35'),
(2, 4, 7, '2025-10-11 02:37:27', '2025-10-11 02:39:27', '2025-10-18 02:37:27', 'Dikembalikan', 0.00, 7, NULL, '2025-10-10 19:37:27', '2025-10-10 19:39:27'),
(3, 1, 7, '2025-10-11 02:51:03', '2025-10-11 02:51:12', '2025-10-18 02:51:03', 'Dikembalikan', 0.00, 7, NULL, '2025-10-10 19:51:03', '2025-10-10 19:51:12'),
(4, 1, 1, '2025-10-12 23:56:12', '2025-10-12 23:56:44', '2025-10-19 23:56:12', 'Dikembalikan', 0.00, 7, NULL, '2025-10-12 16:56:12', '2025-10-12 16:56:44');

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `nama` varchar(100) NOT NULL,
  `role` enum('admin','petugas','pengguna') DEFAULT 'pengguna',
  `telepon` varchar(20) DEFAULT NULL,
  `alamat` text DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `email`, `nama`, `role`, `telepon`, `alamat`, `status`, `last_login`, `created_at`, `updated_at`) VALUES
(1, 'admin', '$2b$10$eK3V3Qp/kv8pAoXNaKLeZuGWvCjmXNDj.76WkjML0q2VuZZGYVoJS', 'admin@perpustakaan.com', 'Administrator System', 'admin', '081234567890', 'Jl. Admin No. 1, Jakarta', 'active', NULL, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(2, 'petugas', '$2b$10$6h.lDsViEnjnd3PRrUaqqOuKZP.Nz19yNoJaixayOK/hTbMQlJgPi', 'petugas@perpustakaan.com', 'Budi Santoso', 'petugas', '081234567891', 'Jl. Petugas No. 2, Jakarta', 'active', NULL, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(3, 'userdemo', '$2b$10$AI6wxDsUEzcsAjFwEqVa6.YhXkn.iegTX2AJEDFRYyjKKGvMu2uAu', 'user@demo.com', 'User Demo', 'pengguna', '081234567892', 'Jl. Demo No. 3, Jakarta', 'active', NULL, '2025-10-10 17:42:59', '2025-10-10 17:42:59'),
(4, 'octa', '$2b$10$1dVLRrGgb.IX6rYfxQAZRuxJ85yAyfCfVSc.bc2buQLZFIycQzf9a', 'haha@gmail.com', 'Rendy', 'pengguna', NULL, NULL, 'active', NULL, '2025-10-10 19:36:51', '2025-10-10 19:36:51');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `books`
--
ALTER TABLE `books`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_judul` (`judul`),
  ADD KEY `idx_penulis` (`penulis`),
  ADD KEY `idx_genre` (`genre`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_rating` (`rating`);

--
-- Indeks untuk tabel `loan_history`
--
ALTER TABLE `loan_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_book_id` (`book_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_tanggal_pinjam` (`tanggal_pinjam`),
  ADD KEY `idx_batas_pengembalian` (`batas_pengembalian`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_username` (`username`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `books`
--
ALTER TABLE `books`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=103;

--
-- AUTO_INCREMENT untuk tabel `loan_history`
--
ALTER TABLE `loan_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `loan_history`
--
ALTER TABLE `loan_history`
  ADD CONSTRAINT `loan_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `loan_history_ibfk_2` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
