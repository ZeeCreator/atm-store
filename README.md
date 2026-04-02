# Aksesoris Touring Madiun - E-Commerce Store

Platform e-commerce untuk penjualan aksesoris touring motor dengan pendekatan **Conversational Commerce** (WhatsApp-based Checkout).

## 🚀 Features

### Customer-Facing
- 🏠 **Home Page** - Hero banner, Flash Sale, Categories, Popular Products
- 🛍️ **Product Catalog** - Filter, Search, Sorting
- 📄 **Product Detail** - Images, Variants, Stock, Reviews
- 🛒 **Shopping Cart** - Add/Remove items, Update quantity
- 🧾 **WhatsApp Checkout** - Generate pre-filled WhatsApp message
- 📍 **About Page** - Store info, Location, Contact

### Admin Panel
- 📊 **Dashboard** - Stats, Revenue, Orders overview
- 📦 **Product Management** - CRUD products with images
- 📋 **Order Management** - Track orders, Update status
- ⚙️ **Site Settings** - Customize store appearance

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3
- **State Management**: Zustand
- **Backend**: Firebase Realtime Database (100% Database-driven)
- **Storage**: Firebase Storage

## 📦 Installation & Setup

### 1. Install Dependencies
```bash
cd D:\FOLDERAMAN\atm_store
npm install
```

### 2. Firebase Setup

**IMPORTANT**: Semua data sekarang 100% menggunakan Firebase Database. Tidak ada data dummy.

#### A. Buat Firebase Realtime Database
1. Buka https://console.firebase.google.com/
2. Pilih project `enterprise-atmstore`
3. Klik **Realtime Database** → **Create Database**
4. Pilih location: **asia-southeast1** (Singapore)
5. Start in **test mode** untuk development

#### B. Setup Security Rules
```json
{
  "rules": {
    "products": {
      ".read": true,
      ".write": true
    },
    "orders": {
      ".read": true,
      ".write": true
    }
  }
}
```

#### C. Isi Database dengan Sample Data

**Option 1: Via Browser Console (Recommended)**
1. Buka http://localhost:3000
2. Buka browser console (F12)
3. Load script: `<script src="/seed-database.js"></script>`
4. Jalankan: `seedDatabase()`
5. Refresh halaman

**Option 2: Via Admin Panel**
1. Buka http://localhost:3000/admin
2. Tab "Products" → "Add Product"
3. Tambahkan produk manual

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Production Build
```bash
npm run build
npm start
```

## 📱 Pages & Routes

| Route | Description |
|-------|-------------|
| `/` | Home page (Hero, Flash Sale, Categories) |
| `/catalog` | Product catalog dengan filters |
| `/product/[id]` | Product detail page |
| `/cart` | Shopping cart |
| `/checkout` | WhatsApp checkout |
| `/success` | Order success page |
| `/about` | About page |
| `/admin` | Admin panel |

## 🎨 Customization

### Site Settings (via Admin Panel)
- Store Name
- WhatsApp Number
- Logo Text
- Hero Title & Subtitle
- Hero Image
- Primary & Secondary Colors

### Database Structure

```json
{
  "products": {
    "product_id": {
      "name": "Product Name",
      "price": 1000000,
      "category": "Helmets",
      "brand": "Brand Name",
      "description": "Description",
      "images": ["url1", "url2"],
      "stock": 10,
      "rating": 4.5,
      "reviews": 100,
      "isFlashSale": false,
      "flashSalePrice": 900000,
      "discount": 10,
      "variants": [{"name": "Size", "value": "M"}],
      "createdAt": 1711900000000
    }
  },
  "orders": {
    "order_id": {
      "orderNumber": "ATM-20260331-0001",
      "orderSource": "whatsapp",
      "customer": {
        "name": "Budi",
        "phone": "081234567890",
        "address": "Madiun",
        "notes": ""
      },
      "items": [...],
      "subtotal": 1000000,
      "shippingCost": null,
      "total": null,
      "status": "pending",
      "isConfirmed": false,
      "waMessage": "...",
      "waLink": "...",
      "createdAt": 1711900000000
    }
  }
}
```

## 🔧 WhatsApp Checkout Flow

1. User browse catalog → pilih produk
2. Add to cart → isi customer info
3. Checkout → System generate WhatsApp message
4. Order disimpan ke Firebase
5. User di-redirect ke WhatsApp admin

### WhatsApp Message Format
```
*NEW ORDER - ATM-20260331-0001*

📦 *Order Details*
━━━━━━━━━━━━━━━━━━━━

1. *GT-Air II Matte Black* (L)
   Qty: 1 x Rp 4.250.000
   Subtotal: Rp 4.250.000

━━━━━━━━━━━━━━━━━━━━

💰 *Pricing Summary*
Subtotal: Rp 4.250.000
Shipping: _Calculated by admin_
*Total: Rp 4.250.000 + Ongkir*

━━━━━━━━━━━━━━━━━━━━

👤 *Customer Information*
Name: Budi Santoso
Phone: 081234567890
Address: Jl. Pahlawan No. 123, Madiun

_Please confirm availability and shipping cost. Thank you!_
```

## 📊 Order Status Flow

```
pending → confirmed → waiting_payment → paid → shipped → completed
                                    ↓
                              cancelled
```

## 🛠️ Admin Panel Usage

### Dashboard
- View total revenue, pending orders, completed orders
- Low stock alerts
- Recent orders & products overview

### Products
- **Add Product**: Click "Add Product", fill form
- **Edit Product**: Click edit icon, update data
- **Delete Product**: Click delete icon, confirm
- **Flash Sale**: Enable flash sale toggle, set discounted price

### Orders
- View all orders from Firebase
- Update status via dropdown
- Click WhatsApp icon to chat customer

### Settings
- Customize store appearance
- Changes saved locally (localStorage)

## 📈 Future Enhancements

- [ ] Firebase Authentication untuk admin
- [ ] Payment Gateway (Midtrans/Xendit)
- [ ] Shipping API (RajaOngkir)
- [ ] WhatsApp Automation (bot)
- [ ] Order Tracking Page
- [ ] Review System
- [ ] Email Notifications

## 🔐 Security Notes

**Untuk Production:**
1. Enable Firebase Authentication
2. Update security rules:
```json
{
  "rules": {
    "products": {
      ".read": true,
      ".write": "auth != null"
    },
    "orders": {
      ".read": "auth != null",
      ".write": true
    }
  }
}
```
3. Deploy ke Vercel/Hosting dengan HTTPS

## 📝 License

ISC

## 👥 Credits

Design inspired by "Technical Brutalism" aesthetic.

---

**Built for the Road** 🏍️

**Database**: 100% Firebase Realtime Database
**No Dummy Data**: All data from Firebase only
