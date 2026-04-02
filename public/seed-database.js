/**
 * Database Seeder Script
 * 
 * Cara menggunakan:
 * 1. Buka browser console di halaman manapun
 * 2. Copy paste script ini
 * 3. Jalankan: seedDatabase()
 * 
 * Atau jalankan via Node.js dengan:
 * node scripts/seed.js
 */

// Sample Products Data
const sampleProducts = [
  {
    name: 'GT-Air II Matte Black',
    price: 6500000,
    category: 'Helmets',
    brand: 'Shoei',
    description: 'Premium modular helmet with matte black finish. Features advanced ventilation system and emergency quick release system.',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCbD7AljyZqOmjaLx7VFf8JvlxR9j-E6xgyCgTd7h15HpSsVNCw4bMCZQ9797JrNPQnoba_cpeEuyLs-Sv5jS_wrNB8uDlyVmfteIP4iQJGWfGUEADq4liaAVshg-uislyu_JBYHtlsqk4l-jyv7DDtAJS8z2tSDZZ8lk7RFEfanKYePOK93r2iNm8SfNV7WXSPDMWu3ucN7y6K9c58wpqDq6RmEyJkYm5kCZAgzzzr-9aLG3cmytiw2JbJlkoTTXT1_glX5CWxGlzM'
    ],
    stock: 15,
    rating: 4.9,
    reviews: 128,
    isFlashSale: true,
    flashSalePrice: 4250000,
    discount: 35,
    variants: [
      { name: 'Size', value: 'M' },
      { name: 'Size', value: 'L' },
      { name: 'Size', value: 'XL' }
    ],
    createdAt: Date.now(),
  },
  {
    name: 'Alpha-Carbon Gloves',
    price: 1100000,
    category: 'Gloves',
    brand: 'Alpine Stars',
    description: 'Premium leather gloves with carbon fiber knuckle protection. Touch-screen compatible fingertips.',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAyp9sff8sh75rpP5oeXvcTolA-zpErfpeq_GLupksm_s4Od6XdL_C2FtFREFwZ3OPRxfvWlRZPYfIETwiTsUE_Vg07fsFT5jgEUtDKFiVdt46Nyjpxpvg_ltsX4nsppzVy0vqwlTWA52UpQdQ-VpzkfunFwXtkHZtqYb0qMp1NbLbGXFVuYy4xuIaef9eEWlrOwc_264tJ1VLXK4sIliP13f9805IqawS-N5_ZTPWxvXGChFLE6dmrOXDQIXtBoCs4Z2UZ_H0HFQFI'
    ],
    stock: 50,
    rating: 4.8,
    reviews: 215,
    isFlashSale: true,
    flashSalePrice: 850000,
    discount: 20,
    variants: [
      { name: 'Size', value: 'S' },
      { name: 'Size', value: 'M' },
      { name: 'Size', value: 'L' },
      { name: 'Size', value: 'XL' }
    ],
    createdAt: Date.now(),
  },
  {
    name: 'Trekker 52L Alu Case',
    price: 3300000,
    category: 'Luggage',
    brand: 'GIVI',
    description: 'Heavy-duty aluminum top case with 52L capacity. Includes mounting kit and internal bag.',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAdb4d4uiimxrvtvxWiXmb5Ci1J_lQ-7YZuWur8mkp1_nXLvZn2kgF7ZEUwCaqHEcEkI-q2mLR681g0TYAItgh5NKuSZ457J_UYpVYOWwUMM41Ce0qQwubLBaInZ0h0EMt_tWFMQOL250GdmB5fJfDGK-Jo_kiGPfmNRuks4YLGKwe1ZQwsUqnFh5OTU7EzATUs6JYVDXGFOfyozq2wykuKf2ttmBRB8RHIqOKxjXFJil4wnfU4MsVDUlO6v0UUKWDVzfW5-AF0K6ko'
    ],
    stock: 12,
    rating: 4.7,
    reviews: 64,
    isFlashSale: true,
    flashSalePrice: 2800000,
    discount: 15,
    variants: [],
    createdAt: Date.now(),
  },
  {
    name: 'Stormbreaker V3 Jacket',
    price: 3250000,
    category: 'Jackets',
    brand: 'Rev\'it',
    description: 'All-weather touring jacket with waterproof membrane and thermal liner. CE-level 2 armor included.',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBhmtZS2nbuv9j1hxOU4l1zDG2bYRG64h17oOo6-SBkW4eUPth17VT9aNuHwsPLy7GpxR62cBKQztv-GGXDyRruztVRvG7cvje2viZf2XZA5bXgjvWihYWuQHFftEAPfq-MqWYJ5Bq7FtmAYeeut4ToNz8jqjgfiSofinARwtDo9mAp5BFQw_ntwepMxjw0NEypGXAiLzHqohHuxQ2yp9LkIXaX2T160JyDVxhB1ifzbZCWaG3sbX4nlrr6De5vw_CKAyZkbmNy8HEH'
    ],
    stock: 25,
    rating: 4.9,
    reviews: 186,
    isFlashSale: true,
    flashSalePrice: 1950000,
    discount: 40,
    variants: [
      { name: 'Size', value: 'M' },
      { name: 'Size', value: 'L' },
      { name: 'Size', value: 'XL' },
      { name: 'Size', value: '2XL' }
    ],
    createdAt: Date.now(),
  },
  {
    name: 'X-Spirit III Black',
    price: 8200000,
    category: 'Helmets',
    brand: 'Shoei',
    description: 'Track-focused full-face helmet with aggressive styling and superior aerodynamics.',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCoHsjm-hiyLX2Ug8V-xIPDyNXOQz8Xt16XXsSUGdg9f78PQ1frZm-d7JCsQZL6wsWxNQ9TCrCtQQLeVnie-MtjSeS8hvXrzPpqHCBS7tPn4mMOeCMELJXb1oV9GmYFPq_16a0Z9rj7THLG3wDOAb2TCh3AiZvTbAxsThDmrQC0J-i9E6qMO4YyAVyWb9y3-D_kvIkG0-1KujVDyOiO73DPdKgIPqjFfGrHHXeuBuK4DejX-7wGVCNeuYhh-JtqpykjPcMoHMF54KG2'
    ],
    stock: 8,
    rating: 5.0,
    reviews: 92,
    isFlashSale: false,
    variants: [
      { name: 'Size', value: 'M' },
      { name: 'Size', value: 'L' },
      { name: 'Size', value: 'XL' }
    ],
    createdAt: Date.now(),
  },
  {
    name: 'Rally Pro Pants',
    price: 2450000,
    category: 'Jackets',
    brand: 'KTM',
    description: 'Technical riding pants with reinforced knees and waterproof construction.',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCLNCvUq2b9gas1zGF2_Ml_IYCbeCHQbRIsDh8vdKQhrx-O1ucmtmYTFJDTGS8v4CIbvYbxGX-da2PT5anRWmB5BDjIkhjgFyo2jdtjL_P3l9drAeNupqK6ounkRwGS6fiu6j1n2f5cDGS5oiYF7dcVqj63vU4-Bd82HDh3Rxen_MAuSnZsPnq45OGn4cyb9_wXAQhsz_Lzst8yPc41y_qQGHtuzpxUKFvf9qUVBy8edfgGQOVDX7WCrpIbsGxmxr_B6fjYA-VYrXS1'
    ],
    stock: 20,
    rating: 4.6,
    reviews: 78,
    isFlashSale: false,
    variants: [
      { name: 'Size', value: 'M' },
      { name: 'Size', value: 'L' },
      { name: 'Size', value: 'XL' }
    ],
    createdAt: Date.now(),
  },
  {
    name: 'Terra EVO Boots',
    price: 3100000,
    category: 'Footwear',
    brand: 'Sidi',
    description: 'Adventure touring boots with Gore-Tex waterproof membrane and steel shank.',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD158Xf42IJlXRmIbAWJeRvsbCfvGKPo3nP6qwQq--xbjCwSLgqbg5MiCnpN_sRkMUTduZpvikUS190hGTMTssTDHI-64ofy69w6wHYzuio1mLq3VNasGcYLGTY4bsFq1b_nRWuWzAvJQ-YqmF0926uTWW8Cj3y8vUjDiacOWhpk7ytprnG6XCQ5i9bfu5IlzEZDFGnvTV01Rx4Bes5wUnupVQSPnq5uwjilQaotaazUb9VcML5drhNoU9Wm5bHOrSbnTiIDWiwlSqK'
    ],
    stock: 15,
    rating: 4.8,
    reviews: 104,
    isFlashSale: false,
    variants: [
      { name: 'Size', value: '42' },
      { name: 'Size', value: '43' },
      { name: 'Size', value: '44' },
      { name: 'Size', value: '45' }
    ],
    createdAt: Date.now(),
  },
  {
    name: 'Blizzard L Saddlebags',
    price: 4500000,
    category: 'Luggage',
    brand: 'Kriega',
    description: 'Waterproof soft panniers with 30L capacity. Rugged hypalon construction.',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAPG4vwuu1DsgzRmeBQSPmGrn6ejmuo-sO7jeLMkXjSyxSJkbrlu6vWQ4sZkqBxrvHm3iVAhAIQSsTPOch42bKIFJoLGMJqax-6E5FnL8P9sRMuW57AhdM__P3Fc-GBXD2QzRrH-s-7tnL8kjr71YMC4tmMEofuKkCND1Y63-_4Yulw7tbkLI3UEApDhPRfkvm2T8wzTIDqBta-Fzjykv60zFykOFdmvJ41YblwxlXw9OPMraWTdYgE6bDdGeDl-z_Qv51WlVlP31al'
    ],
    stock: 10,
    rating: 4.7,
    reviews: 56,
    isFlashSale: false,
    variants: [],
    createdAt: Date.now(),
  },
];

// Function to seed data to Firebase
async function seedDatabase() {
  console.log('🌱 Starting to seed database...\n');
  
  try {
    // Import Firebase functions
    const { initializeApp, getApps } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    const { getDatabase, ref, push, set } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
    
    // Firebase config
    const firebaseConfig = {
      apiKey: "AIzaSyAscBD3Q9Xg0dvECQlzD6G1murSz_aGA1w",
      authDomain: "enterprise-atmstore.firebaseapp.com",
      databaseURL: "https://enterprise-atmstore-default-rtdb.asia-southeast1.firebasedatabase.app",
      projectId: "enterprise-atmstore",
      storageBucket: "enterprise-atmstore.firebasestorage.app",
      messagingSenderId: "359527156801",
      appId: "1:359527156801:web:79f521d4e5497f4a2e0ac0"
    };
    
    // Initialize Firebase
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const db = getDatabase(app);
    
    console.log('📦 Adding products...\n');
    
    // Clear existing products first (optional)
    // await set(ref(db, 'products'), null);
    // console.log('✓ Cleared existing products\n');
    
    // Add each product
    for (const product of sampleProducts) {
      await push(ref(db, 'products'), product);
      console.log(`✓ Added: ${product.name}`);
    }
    
    console.log('\n✅ Successfully seeded all products!');
    console.log(`📊 Total products: ${sampleProducts.length}`);
    console.log(`🔥 Flash sale products: ${sampleProducts.filter(p => p.isFlashSale).length}`);
    console.log('\nRefresh the page to see the products!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

// Function to clear all data
async function clearDatabase() {
  if (!confirm('Are you sure you want to clear ALL data? This cannot be undone!')) {
    return;
  }
  
  try {
    const { initializeApp, getApps } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    const { getDatabase, ref, set } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
    
    const firebaseConfig = {
      apiKey: "AIzaSyAscBD3Q9Xg0dvECQlzD6G1murSz_aGA1w",
      authDomain: "enterprise-atmstore.firebaseapp.com",
      databaseURL: "https://enterprise-atmstore-default-rtdb.asia-southeast1.firebasedatabase.app",
      projectId: "enterprise-atmstore",
      storageBucket: "enterprise-atmstore.firebasestorage.app",
      messagingSenderId: "359527156801",
      appId: "1:359527156801:web:79f521d4e5497f4a2e0ac0"
    };
    
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const db = getDatabase(app);
    
    await set(ref(db, 'products'), null);
    await set(ref(db, 'orders'), null);
    
    console.log('✅ Database cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  }
}

// Export for browser console usage
if (typeof window !== 'undefined') {
  window.seedDatabase = seedDatabase;
  window.clearDatabase = clearDatabase;
}

// Instructions
console.log('╔════════════════════════════════════════════════════════╗');
console.log('║         DATABASE SEEDER - Instructions                 ║');
console.log('╠════════════════════════════════════════════════════════╣');
console.log('║  To seed database, run: seedDatabase()                 ║');
console.log('║  To clear database, run: clearDatabase()               ║');
console.log('╚════════════════════════════════════════════════════════╝');
