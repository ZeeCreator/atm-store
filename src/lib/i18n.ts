// Language translations configuration
export type Language = 'id' | 'en';

export interface Translation {
  // Navigation
  nav: {
    home: string;
    products: string;
    categories: string;
    about: string;
    admin: string;
    reviews: string;
    features: string;
  };

  // Hero Section
  hero: {
    title: string;
    subtitle: string;
    exploreCatalog: string;
    viewDetails: string;
  };

  // Products Page
  products: {
    title: string;
    showingProducts: string;
    searchPlaceholder: string;
    categories: string;
    priceRange: string;
    sortBy: string;
    noProductsFound: string;
    newest: string;
    priceAsc: string;
    priceDesc: string;
    topRated: string;
    viewAll: string;
  };

  // Categories
  categories: {
    browseRange: string;
    shopByCategory: string;
    readMore: string;
    showLess: string;
  };

  // Cart
  cart: {
    title: string;
    emptyCart: string;
    startShopping: string;
    subtotal: string;
    checkout: string;
    continueShopping: string;
  };

  // Checkout
  checkout: {
    title: string;
    emptyCart: string;
    browseProducts: string;
  };

  // Success Page
  success: {
    title: string;
    message: string;
    continueShopping: string;
    viewOrder: string;
  };

  // About Page
  about: {
    title: string;
    heroSubtitle: string;
    ourStory: string;
    ourValues: string;
    visitUs: string;
    readyToUpgrade: string;
    ctaSubtitle: string;
    browseCatalog: string;
    chatOnWhatsApp: string;
    qualityAssured: string;
    personalService: string;
    fastShipping: string;
    storeLocation: string;
    operatingHours: string;
    contact: string;
    storyContent: string;
    qualityContent: string;
    serviceContent: string;
    shippingContent: string;
  };

  // Common
  common: {
    loading: string;
    error: string;
    addToCart: string;
    viewDetails: string;
    sale: string;
    new: string;
    outOfStock: string;
    inStock: string;
    whatsappSupport: string;
    expertAdvice: string;
    consultVeterans: string;
    noProductsYet: string;
    checkBackLater: string;
  };

  // Features Section
  features: {
    title: string;
    subtitle: string;
    quality: {
      title: string;
      description: string;
    };
    price: {
      title: string;
      description: string;
    };
    service: {
      title: string;
      description: string;
    };
    shipping: {
      title: string;
      description: string;
    };
    warranty: {
      title: string;
      description: string;
    };
    trusted: {
      title: string;
      description: string;
    };
  };

  // Footer
  footer: {
    allProducts: string;
    categories: string;
    aboutUs: string;
    navigation: string;
    brandDescription: string;
    community: string;
    instagram: string;
    whatsappSupport: string;
    madiunHQ: string;
    joinTheRoad: string;
    joinNewsletter: string;
    newsletterPlaceholder: string;
    copyright: string;
    creditsATM: string;
  };

  // Instagram Page
  instagram: {
    title: string;
    followButton: string;
    description: string;
    noPosts: string;
    followDescription: string;
  };

  // Reviews Section
  reviews: {
    title: string;
    subtitle: string;
    ratingLabel: string;
    basedOn: string;
    seeMore: string;
  };

  // Admin Dashboard
  admin: {
    title: string;
    dashboard: string;
    products: string;
    orders: string;
    settings: string;
    categories: string;
    arsenal: string;
    flashSale: string;
    instagram: string;
    totalRevenue: string;
    pendingOrders: string;
    completedOrders: string;
    lowStockProducts: string;
    addProduct: string;
    editProduct: string;
    createProduct: string;
    updateProduct: string;
    cancel: string;
    loading: string;
    noProductsYet: string;
    addFirstProduct: string;
    productName: string;
    category: string;
    selectCategory: string;
    noCategoriesAvailable: string;
    addCategoriesFirst: string;
    brand: string;
    price: string;
    description: string;
    stock: string;
    flashSaleToggle: string;
    flashSalePrice: string;
    discount: string;
    manageCategories: string;
    categoriesDescription: string;
    addNewCategory: string;
    enterCategoryName: string;
    add: string;
    currentCategories: string;
    deleteCategory: string;
    deleteProduct: string;
    product: string;
    actions: string;
    saveSettings: string;
    settingsSaved: string;
    settingsFailed: string;
    authSettings: string;
    username: string;
    password: string;
    heroSettings: string;
    heroTitle: string;
    heroSubtitle: string;
    heroImage: string;
    contactSettings: string;
    whatsappNumber: string;
    storeName: string;
    instagramTag: string;
    aboutStory: string;
    flashSaleSettings: string;
    activateFlashSale: string;
    countdownTimer: string;
    hours: string;
    minutes: string;
    seconds: string;
    save: string;
    delete: string;
    edit: string;
    confirmDelete: string;
    savedSuccessfully: string;
    failedToSave: string;
    arsenalCategories: string;
    arsenalDescription: string;
    arsenalName: string;
    arsenalImage: string;
    arsenalLayout: string;
    dragToReorder: string;
    saveArsenal: string;
    cancelEdit: string;
    instagramPosts: string;
    instagramDescription: string;
    addPost: string;
    postUrl: string;
    validPostUrl: string;
    postExists: string;
    confirmDeletePost: string;
    savePosts: string;
    pending: string;
    confirmed: string;
    waitingPayment: string;
    paid: string;
    shipped: string;
    completed: string;
    cancelled: string;
    orderNumber: string;
    customer: string;
    total: string;
    status: string;
    noOrdersYet: string;
    viewWhatsApp: string;
    home: string;
    logout: string;
    fullScreen: string;
    exitFullScreen: string;
  };
}

export const translations: Record<Language, Translation> = {
  id: {
    nav: {
      home: 'Beranda',
      products: 'Produk',
      categories: 'Kategori',
      about: 'Tentang',
      admin: 'Admin',
      reviews: 'Ulasan',
      features: 'Keunggulan',
    },
    hero: {
      title: 'Lengkapi Petualanganmu',
      subtitle: 'Dirancang untuk perjalanan jarak jauh.',
      exploreCatalog: 'Jelajahi Katalog',
      viewDetails: 'Lihat Detail',
    },
    products: {
      title: 'Semua Produk',
      showingProducts: 'Menampilkan {count} produk',
      searchPlaceholder: 'Cari produk...',
      categories: 'Kategori',
      priceRange: 'Rentang Harga',
      sortBy: 'Urutkan Berdasarkan',
      noProductsFound: 'Tidak ada produk ditemukan',
      newest: 'Terbaru',
      priceAsc: 'Harga: Rendah ke Tinggi',
      priceDesc: 'Harga: Tinggi ke Rendah',
      topRated: 'Teratas',
      viewAll: 'Lihat Semua',
    },
    categories: {
      browseRange: 'Jelajahi',
      shopByCategory: 'Belanja berdasarkan kategori',
      readMore: 'Lihat Semua',
      showLess: 'Tampilkan Lebih Sedikit',
    },
    cart: {
      title: 'Keranjang Belanja',
      emptyCart: 'Keranjangmu masih kosong',
      startShopping: 'Mulai Belanja',
      subtotal: 'Subtotal',
      checkout: 'Checkout',
      continueShopping: 'Lanjutkan Belanja',
    },
    checkout: {
      title: 'Checkout',
      emptyCart: 'Tambahkan produk sebelum checkout.',
      browseProducts: 'Jelajahi Produk',
    },
    success: {
      title: 'Pesanan Berhasil!',
      message: 'Terima kasih telah berbelanja. Kami akan menghubungi Anda melalui WhatsApp.',
      continueShopping: 'Lanjutkan Belanja',
      viewOrder: 'Lihat Pesanan',
    },
    about: {
      title: 'Tentang Aksesoris Touring Madiun',
      heroSubtitle: 'Kami adalah rider yang berdedikasi untuk menyediakan aksesoris touring berkualitas tinggi untuk motor modern. Berbasis di Madiun, Indonesia, kami memahami kebutuhan unik penggemar touring di Asia Tenggara.',
      ourStory: 'Cerita Kami',
      ourValues: 'Nilai Kami',
      visitUs: 'Kunjungi Kami',
      readyToUpgrade: 'Siap Upgrade Ride-mu?',
      ctaSubtitle: 'Jelajahi katalog aksesoris touring premium kami dan temukan gear yang sempurna untuk petualangan berikutnya.',
      browseCatalog: 'Jelajahi Katalog',
      chatOnWhatsApp: 'Chat di WhatsApp',
      qualityAssured: 'Kualitas Terjamin',
      personalService: 'Layanan Personal',
      fastShipping: 'Pengiriman Cepat',
      storeLocation: 'Lokasi Toko',
      operatingHours: 'Jam Buka',
      contact: 'Kontak',
      storyContent: `Di ATM Autolight Madiun, kami percaya bahwa setiap kendaraan memiliki identitas—dan pencahayaan adalah salah satu elemen paling kuat untuk menegaskannya.

Berangkat dari passion terhadap dunia otomotif, kami membangun ATM Autolight dengan standar yang tidak kompromi: menghadirkan solusi lighting yang presisi, berteknologi, dan berorientasi pada detail. Bagi kami, kualitas bukan sekadar hasil akhir, tetapi proses—mulai dari pemilihan produk, teknik instalasi, hingga penyempurnaan setiap titik cahaya.

Kami memahami bahwa memilih untuk memodifikasi kendaraan bukan hanya soal fungsi, tetapi juga keberanian untuk tampil berbeda. Karena itu, setiap layanan yang kami berikan dirancang untuk menghadirkan keseimbangan antara performa, estetika, dan keamanan—menciptakan pengalaman berkendara yang lebih percaya diri di setiap perjalanan.

Seiring berkembangnya teknologi otomotif, ATM Autolight terus beradaptasi dan berinovasi, memastikan setiap pelanggan mendapatkan standar terbaik yang relevan dengan kebutuhan masa kini.

Hari ini, kami hadir bukan hanya sebagai penyedia jasa upgrade lampu, tetapi sebagai partner bagi mereka yang berani meningkatkan standar kendaraannya.

Wani Modif, Wani Ragat.`,
      qualityContent: 'Setiap produk di katalog kami diuji dan dipastikan kualitasnya. Kami hanya menyediakan barang yang akan kami gunakan sendiri untuk touring kami.',
      serviceContent: 'Pendekatan WhatsApp kami berarti Anda berbicara dengan orang asli yang memahami motor. Dapatkan saran ahli sebelum membeli.',
      shippingContent: 'Kami memproses pesanan dengan cepat dan mengirim ke seluruh Indonesia. Gear Anda tiba dengan aman dan tepat waktu, sehingga Anda bisa kembali ke jalan lebih cepat.',
    },
    common: {
      loading: 'Memuat...',
      error: 'Terjadi kesalahan',
      addToCart: 'Tambah ke Keranjang',
      viewDetails: 'Lihat Detail',
      sale: 'Diskon',
      new: 'Baru',
      outOfStock: 'Habis',
      inStock: 'Tersedia',
      whatsappSupport: 'Dukungan WhatsApp',
      expertAdvice: 'Expert advice just a message away',
      consultVeterans: 'Consult our road veterans for the perfect fit',
      noProductsYet: 'Belum ada produk',
      checkBackLater: 'Kunjungi kami lagi untuk produk terbaru',
    },
    features: {
      title: 'Keunggulan Kami',
      subtitle: 'Mengapa Memilih Kami',
      quality: {
        title: 'Kualitas Terjamin',
        description: 'Setiap produk diuji dan dipastikan kualitasnya. Kami hanya menyediakan barang yang akan kami gunakan sendiri untuk touring kami.',
      },
      price: {
        title: 'Harga Kompetitif',
        description: 'Dapatkan produk berkualitas dengan harga terbaik. Kami menawarkan harga yang kompetitif tanpa mengorbankan kualitas.',
      },
      service: {
        title: 'Layanan Personal',
        description: 'Pendekatan WhatsApp kami berarti Anda berbicara dengan orang asli yang memahami motor. Dapatkan saran ahli sebelum membeli.',
      },
      shipping: {
        title: 'Pengiriman Cepat',
        description: 'Kami memproses pesanan dengan cepat dan mengirim ke seluruh Indonesia. Gear Anda tiba dengan aman dan tepat waktu.',
      },
      warranty: {
        title: 'Garansi Resmi',
        description: 'Semua produk dilengkapi dengan garansi resmi. Kami berdiri di belakang setiap produk yang kami jual.',
      },
      trusted: {
        title: 'Dipercaya Rider',
        description: 'Ribuan rider di Indonesia mempercayai kami untuk kebutuhan aksesoris touring mereka. Bergabunglah dengan komunitas kami.',
      },
    },
    footer: {
      allProducts: 'Semua Produk',
      categories: 'Kategori',
      aboutUs: 'Tentang Kami',
      navigation: 'Navigasi',
      brandDescription: 'Dirancang untuk perjalanan jarak jauh. Menyediakan solusi touring berperforma tinggi untuk rider modern dari markas kami di Madiun.',
      community: 'Komunitas',
      instagram: 'Instagram',
      whatsappSupport: 'Dukungan WhatsApp',
      madiunHQ: 'Markas Madiun',
      joinTheRoad: 'Bergabunglah',
      joinNewsletter: 'Bergabung dengan Newsletter',
      newsletterPlaceholder: 'Join Newsletter',
      copyright: '© {year} Aksesoris Touring Madiun. {credits}',
      creditsATM: 'Dibuat oleh ATM',
    },
    instagram: {
      title: 'Ikuti Kami di Instagram',
      followButton: 'IKUTI KAMI',
      description: 'Lihat produk terbaru kami, ulasan pelanggan, dan konten di balik layar',
      noPosts: 'Belum ada postingan',
      followDescription: 'Ikuti kami di Instagram untuk update terbaru',
    },
    reviews: {
      title: 'Ulasan Pelanggan',
      subtitle: 'Apa Kata Mereka',
      ratingLabel: 'Berdasarkan Ulasan Google',
      basedOn: 'Berdasarkan',
      seeMore: 'Lihat Ulasan Lainnya di Google Maps',
    },
    admin: {
      title: 'Admin Panel',
      dashboard: 'Dashboard',
      products: 'Produk',
      orders: 'Pesanan',
      settings: 'Pengaturan',
      categories: 'Kategori',
      arsenal: 'The Arsenal',
      flashSale: 'Flash Sale',
      instagram: 'Instagram',
      totalRevenue: 'Total Pendapatan',
      pendingOrders: 'Pesanan Pending',
      completedOrders: 'Pesanan Selesai',
      lowStockProducts: 'Stok Menipis',
      addProduct: 'Tambah Produk',
      editProduct: 'Edit Produk',
      createProduct: 'Buat Produk',
      updateProduct: 'Update Produk',
      cancel: 'Batal',
      loading: 'Memuat...',
      noProductsYet: 'Belum ada produk',
      addFirstProduct: 'Tambah produk pertama Anda untuk memulai',
      productName: 'Nama Produk',
      category: 'Kategori',
      selectCategory: 'Pilih kategori...',
      noCategoriesAvailable: 'Belum ada kategori',
      addCategoriesFirst: 'Tambah kategori terlebih dahulu',
      brand: 'Brand',
      price: 'Harga (IDR)',
      description: 'Deskripsi',
      stock: 'Stok',
      flashSaleToggle: 'Flash Sale',
      flashSalePrice: 'Harga Flash Sale',
      discount: 'Diskon (%)',
      manageCategories: 'Kelola Kategori',
      categoriesDescription: 'Kategori akan muncul di filter Katalog dan bagian "The Arsenal".',
      addNewCategory: 'Tambah Kategori Baru',
      enterCategoryName: 'Masukkan nama kategori',
      add: 'Tambah',
      currentCategories: 'Kategori Saat Ini',
      deleteCategory: 'Hapus Kategori',
      deleteProduct: 'Hapus Produk',
      product: 'Produk',
      actions: 'Aksi',
      saveSettings: 'Simpan Pengaturan',
      settingsSaved: 'Pengaturan berhasil disimpan!',
      settingsFailed: 'Gagal menyimpan pengaturan',
      authSettings: 'Pengaturan Autentikasi',
      username: 'Username',
      password: 'Password',
      heroSettings: 'Pengaturan Hero Section',
      heroTitle: 'Judul Hero',
      heroSubtitle: 'Subjudul Hero',
      heroImage: 'Gambar Hero',
      contactSettings: 'Pengaturan Kontak',
      whatsappNumber: 'Nomor WhatsApp',
      storeName: 'Nama Toko',
      instagramTag: 'Tag Instagram',
      aboutStory: 'Cerita Tentang',
      flashSaleSettings: 'Pengaturan Flash Sale',
      activateFlashSale: 'Aktifkan Flash Sale',
      countdownTimer: 'Countdown Timer',
      hours: 'Jam',
      minutes: 'Menit',
      seconds: 'Detik',
      save: 'Simpan',
      delete: 'Hapus',
      edit: 'Edit',
      confirmDelete: 'Apakah Anda yakin ingin menghapus?',
      savedSuccessfully: 'Berhasil disimpan!',
      failedToSave: 'Gagal menyimpan',
      arsenalCategories: 'Kategori Arsenal',
      arsenalDescription: 'Kategori ini akan ditampilkan di halaman depan dengan layout grid. Drag untuk mengurutkan ulang.',
      arsenalName: 'Nama Kategori',
      arsenalImage: 'URL Gambar',
      arsenalLayout: 'Layout',
      dragToReorder: 'Drag untuk mengurutkan ulang',
      saveArsenal: 'Simpan Arsenal',
      cancelEdit: 'Batal Edit',
      instagramPosts: 'Postingan Instagram',
      instagramDescription: 'Tambahkan URL postingan Instagram untuk ditampilkan di galeri halaman depan.',
      addPost: 'Tambah Postingan',
      postUrl: 'URL Postingan',
      validPostUrl: 'Masukkan URL postingan Instagram yang valid',
      postExists: 'Postingan sudah ada',
      confirmDeletePost: 'Hapus postingan Instagram ini?',
      savePosts: 'Simpan Postingan',
      pending: 'pending',
      confirmed: 'dikonfirmasi',
      waitingPayment: 'menunggu_pembayaran',
      paid: 'dibayar',
      shipped: 'dikirim',
      completed: 'selesai',
      cancelled: 'dibatalkan',
      orderNumber: 'Nomor Pesanan',
      customer: 'Pelanggan',
      total: 'Total',
      status: 'Status',
      noOrdersYet: 'Belum ada pesanan',
      viewWhatsApp: 'Lihat di WhatsApp',
      home: 'Beranda',
      logout: 'Logout',
      fullScreen: 'Layar Penuh',
      exitFullScreen: 'Keluar Layar Penuh',
    },
  },
  en: {
    nav: {
      home: 'Home',
      products: 'Products',
      categories: 'Categories',
      about: 'About',
      admin: 'Admin',
      reviews: 'Reviews',
      features: 'Features',
    },
    hero: {
      title: 'Equip Your Adventure',
      subtitle: 'Engineered for the long haul.',
      exploreCatalog: 'Explore Catalog',
      viewDetails: 'View Details',
    },
    products: {
      title: 'All Products',
      showingProducts: 'Showing {count} products',
      searchPlaceholder: 'Search products...',
      categories: 'Categories',
      priceRange: 'Price Range',
      sortBy: 'Sort By',
      noProductsFound: 'No products found',
      newest: 'Newest Arrivals',
      priceAsc: 'Price: Low to High',
      priceDesc: 'Price: High to Low',
      topRated: 'Top Rated',
      viewAll: 'View All',
    },
    categories: {
      browseRange: 'Browse Range',
      shopByCategory: 'Shop by category',
      readMore: 'View All',
      showLess: 'Show Less',
    },
    cart: {
      title: 'Shopping Cart',
      emptyCart: 'Your cart is empty',
      startShopping: 'Start Shopping',
      subtotal: 'Subtotal',
      checkout: 'Checkout',
      continueShopping: 'Continue Shopping',
    },
    checkout: {
      title: 'Checkout',
      emptyCart: 'Add some products before checkout.',
      browseProducts: 'Browse Products',
    },
    success: {
      title: 'Order Successful!',
      message: 'Thank you for shopping. We will contact you via WhatsApp.',
      continueShopping: 'Continue Shopping',
      viewOrder: 'View Order',
    },
    about: {
      title: 'About Aksesoris Touring Madiun',
      heroSubtitle: 'We are passionate riders dedicated to providing high-quality touring accessories for the modern motorcyclist. Based in Madiun, Indonesia, we understand the unique needs of touring enthusiasts in Southeast Asia.',
      ourStory: 'Our Story',
      ourValues: 'Our Values',
      visitUs: 'Visit Us',
      readyToUpgrade: 'Ready to Upgrade Your Ride?',
      ctaSubtitle: 'Browse our catalog of premium touring accessories and find the perfect gear for your next adventure.',
      browseCatalog: 'Browse Catalog',
      chatOnWhatsApp: 'Chat on WhatsApp',
      qualityAssured: 'Quality Assured',
      personalService: 'Personal Service',
      fastShipping: 'Fast Shipping',
      storeLocation: 'Store Location',
      operatingHours: 'Operating Hours',
      contact: 'Contact',
      storyContent: `At ATM Autolight Madiun, we believe that every vehicle has an identity—and lighting is one of the most powerful elements to assert it.

Born from a passion for the automotive world, we built ATM Autolight with uncompromising standards: delivering precise, technological, and detail-oriented lighting solutions. For us, quality is not just an end result, but a process—from product selection, installation techniques, to perfecting every point of light.

We understand that choosing to modify a vehicle is not just about function, but also the courage to stand out. Therefore, every service we provide is designed to bring balance between performance, aesthetics, and safety—creating a more confident riding experience on every journey.

As automotive technology evolves, ATM Autolight continues to adapt and innovate, ensuring every customer gets the best standards relevant to today's needs.

Today, we are here not just as a lamp upgrade service provider, but as a partner for those who dare to raise their vehicle's standards.

Wani Modif, Wani Ragat.`,
      qualityContent: 'Every product in our catalog is tested and verified for quality. We only stock items that we would use ourselves on our own touring adventures.',
      serviceContent: 'Our WhatsApp-based approach means you talk to real people who understand motorcycles. Get expert advice before making your purchase.',
      shippingContent: 'We process orders quickly and ship nationwide. Your gear arrives safely and on time, so you can get back on the road faster.',
    },
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      addToCart: 'Add to Cart',
      viewDetails: 'View Details',
      sale: 'Sale',
      new: 'New',
      outOfStock: 'Out of Stock',
      inStock: 'In Stock',
      whatsappSupport: 'WhatsApp Support',
      expertAdvice: 'Expert advice just a message away',
      consultVeterans: 'Consult our road veterans for the perfect fit',
      noProductsYet: 'No products available yet',
      checkBackLater: 'Check back later or visit our catalog',
    },
    features: {
      title: 'Our Advantages',
      subtitle: 'Why Choose Us',
      quality: {
        title: 'Quality Assured',
        description: 'Every product in our catalog is tested and verified for quality. We only stock items that we would use ourselves on our own touring adventures.',
      },
      price: {
        title: 'Competitive Price',
        description: 'Get quality products at the best prices. We offer competitive pricing without compromising on quality.',
      },
      service: {
        title: 'Personal Service',
        description: 'Our WhatsApp-based approach means you talk to real people who understand motorcycles. Get expert advice before making your purchase.',
      },
      shipping: {
        title: 'Fast Shipping',
        description: 'We process orders quickly and ship nationwide. Your gear arrives safely and on time, so you can get back on the road faster.',
      },
      warranty: {
        title: 'Official Warranty',
        description: 'All products come with official warranty. We stand behind every product we sell.',
      },
      trusted: {
        title: 'Trusted by Riders',
        description: 'Thousands of riders in Indonesia trust us for their touring accessories needs. Join our community today.',
      },
    },
    footer: {
      allProducts: 'All Products',
      categories: 'Categories',
      aboutUs: 'About Us',
      navigation: 'Navigation',
      brandDescription: 'Engineered for the long haul. Providing high-performance touring solutions for the modern rider from our Madiun headquarters.',
      community: 'Community',
      instagram: 'Instagram',
      whatsappSupport: 'WhatsApp Support',
      madiunHQ: 'Madiun HQ',
      joinTheRoad: 'Join the Road',
      joinNewsletter: 'Join Newsletter',
      newsletterPlaceholder: 'Join Newsletter',
      copyright: '© {year} Aksesoris Touring Madiun. {credits}',
      creditsATM: 'Built by ATM',
    },
    instagram: {
      title: 'Follow Us on Instagram',
      followButton: 'FOLLOW US',
      description: 'Check out our latest products, customer reviews, and behind-the-scenes content',
      noPosts: 'No posts yet',
      followDescription: 'Follow us on Instagram for updates',
    },
    reviews: {
      title: 'Customer Reviews',
      subtitle: 'What Our Customers Say',
      ratingLabel: 'Based on Google Reviews',
      basedOn: 'Based on',
      seeMore: 'See More Reviews on Google Maps',
    },
    admin: {
      title: 'Admin Panel',
      dashboard: 'Dashboard',
      products: 'Products',
      orders: 'Orders',
      settings: 'Settings',
      categories: 'Categories',
      arsenal: 'The Arsenal',
      flashSale: 'Flash Sale',
      instagram: 'Instagram',
      totalRevenue: 'Total Revenue',
      pendingOrders: 'Pending Orders',
      completedOrders: 'Completed Orders',
      lowStockProducts: 'Low Stock Products',
      addProduct: 'Add Product',
      editProduct: 'Edit Product',
      createProduct: 'Create Product',
      updateProduct: 'Update Product',
      cancel: 'Cancel',
      loading: 'Loading...',
      noProductsYet: 'No products yet',
      addFirstProduct: 'Add your first product to get started',
      productName: 'Product Name',
      category: 'Category',
      selectCategory: 'Select a category...',
      noCategoriesAvailable: 'No categories available',
      addCategoriesFirst: 'Add categories first',
      brand: 'Brand',
      price: 'Price (IDR)',
      description: 'Description',
      stock: 'Stock',
      flashSaleToggle: 'Flash Sale',
      flashSalePrice: 'Flash Sale Price',
      discount: 'Discount (%)',
      manageCategories: 'Manage Categories',
      categoriesDescription: 'Categories will appear in Catalog filter and "The Arsenal" section.',
      addNewCategory: 'Add New Category',
      enterCategoryName: 'Enter category name',
      add: 'Add',
      currentCategories: 'Current Categories',
      deleteCategory: 'Delete Category',
      deleteProduct: 'Delete Product',
      product: 'Product',
      actions: 'Actions',
      saveSettings: 'Save Settings',
      settingsSaved: 'Settings saved successfully!',
      settingsFailed: 'Failed to save settings',
      authSettings: 'Authentication Settings',
      username: 'Username',
      password: 'Password',
      heroSettings: 'Hero Section Settings',
      heroTitle: 'Hero Title',
      heroSubtitle: 'Hero Subtitle',
      heroImage: 'Hero Image',
      contactSettings: 'Contact Settings',
      whatsappNumber: 'WhatsApp Number',
      storeName: 'Store Name',
      instagramTag: 'Instagram Tag',
      aboutStory: 'About Story',
      flashSaleSettings: 'Flash Sale Settings',
      activateFlashSale: 'Activate Flash Sale',
      countdownTimer: 'Countdown Timer',
      hours: 'Hours',
      minutes: 'Minutes',
      seconds: 'Seconds',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      confirmDelete: 'Are you sure you want to delete?',
      savedSuccessfully: 'Saved successfully!',
      failedToSave: 'Failed to save',
      arsenalCategories: 'Arsenal Categories',
      arsenalDescription: 'These categories will be displayed on the homepage with a grid layout. Drag to reorder.',
      arsenalName: 'Category Name',
      arsenalImage: 'Image URL',
      arsenalLayout: 'Layout',
      dragToReorder: 'Drag to reorder',
      saveArsenal: 'Save Arsenal',
      cancelEdit: 'Cancel Edit',
      instagramPosts: 'Instagram Posts',
      instagramDescription: 'Add Instagram post URLs to display in the homepage gallery.',
      addPost: 'Add Post',
      postUrl: 'Post URL',
      validPostUrl: 'Enter a valid Instagram post URL',
      postExists: 'This post already exists',
      confirmDeletePost: 'Delete this Instagram post?',
      savePosts: 'Save Posts',
      pending: 'pending',
      confirmed: 'confirmed',
      waitingPayment: 'waiting_payment',
      paid: 'paid',
      shipped: 'shipped',
      completed: 'completed',
      cancelled: 'cancelled',
      orderNumber: 'Order Number',
      customer: 'Customer',
      total: 'Total',
      status: 'Status',
      noOrdersYet: 'No orders yet',
      viewWhatsApp: 'View on WhatsApp',
      home: 'Home',
      logout: 'Logout',
      fullScreen: 'Full Screen',
      exitFullScreen: 'Exit Full Screen',
    },
  },
};

// Auto-detect user language
export function detectLanguage(): Language {
  if (typeof window === 'undefined') {
    return 'id'; // Default to Indonesian on server
  }

  const browserLang = navigator.language.toLowerCase();
  
  // Check if browser language starts with 'id' or 'en'
  if (browserLang.startsWith('id')) {
    return 'id';
  } else if (browserLang.startsWith('en')) {
    return 'en';
  }
  
  // Default to Indonesian
  return 'id';
}

// Get saved language from localStorage
export function getSavedLanguage(): Language | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const saved = localStorage.getItem('language');
  if (saved === 'id' || saved === 'en') {
    return saved;
  }
  
  return null;
}

// Save language preference to localStorage
export function saveLanguage(lang: Language): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', lang);
  }
}

// Get current language (saved or detected)
export function getCurrentLanguage(): Language {
  return getSavedLanguage() || detectLanguage();
}
