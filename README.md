# Sistem Informasi Perpustakaan

Sistem perpustakaan lengkap dengan Express.js, MySQL database, dan deployment di Vercel.

## 🚀 Deployment di Vercel

### 1. Konfigurasi Database
Database sudah dikonfigurasi untuk Railway MySQL:
- Host: `maglev.proxy.rlwy.net`
- Port: `15489`
- Database: `railway`

### 2. Environment Variables di Vercel
Tidak perlu environment variables tambahan karena database sudah dikonfigurasi langsung.

### 3. Struktur Project
```
📁 Project/
├── 📁 api/
│   └── index.js              # Vercel serverless function
├── 📁 public/                # Static files
│   ├── 📁 css/Style.css
│   ├── 📁 js/app.js
│   ├── 📁 images/
│   └── 📄 *.html files
├── 📄 Server.js              # Local development
├── 📄 database.js            # Database config
├── 📄 vercel.json            # Vercel config
└── 📄 package.json
```

### 4. Deployment Steps
1. Push code ke GitHub
2. Connect repository ke Vercel
3. Vercel akan otomatis detect `vercel.json` dan `api/index.js`
4. Deploy akan berhasil dengan database Railway

### 5. Features
- ✅ Express.js Framework
- ✅ Railway MySQL Database
- ✅ Session Management
- ✅ CORS Support
- ✅ Static File Serving
- ✅ Authentication & Authorization
- ✅ CRUD Operations
- ✅ Dashboard Analytics
- ✅ Loan Management
- ✅ Search & Recommendations

## 🔧 Local Development
```bash
npm install
npm start
```

## 📊 Database Status
- ✅ 102 books available
- ✅ 4 users registered
- ✅ 4 loan records
- ✅ All tables created

## 🌐 Production URL
Setelah deploy, aplikasi akan tersedia di:
`https://your-project-name.vercel.app`
