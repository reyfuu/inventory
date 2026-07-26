-- Aktifkan ekstensi UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- SEED CATEGORIES
-- =============================================
INSERT INTO categories (id, name, description, created_at) VALUES
  (gen_random_uuid(), 'Elektronik',              'Perangkat elektronik, gadget, dan aksesoris', NOW()),
  (gen_random_uuid(), 'Pakaian',                 'Pakaian pria, wanita, dan anak-anak', NOW()),
  (gen_random_uuid(), 'Makanan & Minuman',        'Bahan makanan pokok, snack, dan minuman ringan', NOW()),
  (gen_random_uuid(), 'Peralatan Rumah Tangga',   'Peralatan dapur, kebersihan, dan dekorasi', NOW())
ON CONFLICT DO NOTHING;

-- =============================================
-- SEED PRODUCTS (menggunakan subquery untuk ambil category_id)
-- =============================================
DO $$
DECLARE
  cat_elek   UUID;
  cat_pakaian UUID;
  cat_makan  UUID;
  cat_alat   UUID;

  prod1  UUID;
  prod2  UUID;
  prod3  UUID;
  prod4  UUID;
  prod5  UUID;
  prod6  UUID;
  prod7  UUID;
  prod8  UUID;
  prod9  UUID;
  prod10 UUID;
BEGIN
  -- Ambil ID kategori
  SELECT id INTO cat_elek    FROM categories WHERE name = 'Elektronik' LIMIT 1;
  SELECT id INTO cat_pakaian FROM categories WHERE name = 'Pakaian' LIMIT 1;
  SELECT id INTO cat_makan   FROM categories WHERE name = 'Makanan & Minuman' LIMIT 1;
  SELECT id INTO cat_alat    FROM categories WHERE name = 'Peralatan Rumah Tangga' LIMIT 1;

  -- Produk Elektronik
  INSERT INTO products (id, sku, name, description, category_id, quantity, price_buy, price_sell, low_stock_threshold, created_at, updated_at)
  VALUES (gen_random_uuid(), 'ELE-iP15PM', 'iPhone 15 Pro Max 256GB',
    'Smartphone flagship Apple dengan chip A17 Pro, kamera 48MP, dan layar Super Retina XDR 6.7 inci.',
    cat_elek, 12, 18500000, 21000000, 5, NOW(), NOW())
  RETURNING id INTO prod1;

  INSERT INTO products (id, sku, name, description, category_id, quantity, price_buy, price_sell, low_stock_threshold, created_at, updated_at)
  VALUES (gen_random_uuid(), 'ELE-MBM3-13', 'MacBook Air M3 13 inch',
    'Laptop tipis Apple dengan chip M3, baterai 18 jam, dan layar Liquid Retina 13 inci.',
    cat_elek, 3, 16000000, 18500000, 5, NOW(), NOW())
  RETURNING id INTO prod2;

  INSERT INTO products (id, sku, name, description, category_id, quantity, price_buy, price_sell, low_stock_threshold, created_at, updated_at)
  VALUES (gen_random_uuid(), 'ELE-TABS9FE', 'Samsung Galaxy Tab S9 FE',
    'Tablet premium Samsung 10.9 inci dengan S Pen, layar AMOLED, dan baterai 8000mAh.',
    cat_elek, 8, 5500000, 6800000, 3, NOW(), NOW())
  RETURNING id INTO prod3;

  INSERT INTO products (id, sku, name, description, category_id, quantity, price_buy, price_sell, low_stock_threshold, created_at, updated_at)
  VALUES (gen_random_uuid(), 'ELE-SONYWF5', 'TWS Earbuds Sony WF-1000XM5',
    'True wireless earbuds Sony dengan noise cancelling terbaik di kelasnya dan baterai 8 jam.',
    cat_elek, 2, 2800000, 3500000, 5, NOW(), NOW())
  RETURNING id INTO prod4;

  -- Produk Pakaian
  INSERT INTO products (id, sku, name, description, category_id, quantity, price_buy, price_sell, low_stock_threshold, created_at, updated_at)
  VALUES (gen_random_uuid(), 'PAK-FLNLPRM', 'Kemeja Flannel Pria Premium',
    'Kemeja flannel pria bahan katun 100%, tersedia berbagai warna plaid, cocok untuk kasual dan semi-formal.',
    cat_pakaian, 45, 85000, 150000, 10, NOW(), NOW())
  RETURNING id INTO prod5;

  INSERT INTO products (id, sku, name, description, category_id, quantity, price_buy, price_sell, low_stock_threshold, created_at, updated_at)
  VALUES (gen_random_uuid(), 'PAK-JNSSLIM', 'Celana Jeans Slim Fit Wanita',
    'Celana jeans wanita slim fit berbahan denim stretch premium, nyaman dipakai seharian, warna dark blue.',
    cat_pakaian, 7, 120000, 220000, 10, NOW(), NOW())
  RETURNING id INTO prod6;

  INSERT INTO products (id, sku, name, description, category_id, quantity, price_buy, price_sell, low_stock_threshold, created_at, updated_at)
  VALUES (gen_random_uuid(), 'PAK-KAOSRND', 'Kaos Polos Oversize Unisex',
    'Kaos polos oversize bahan cotton combed 30s, tersedia 20 warna, cocok untuk pria dan wanita.',
    cat_pakaian, 80, 45000, 85000, 15, NOW(), NOW())
  RETURNING id INTO prod7;

  -- Produk Makanan
  INSERT INTO products (id, sku, name, description, category_id, quantity, price_buy, price_sell, low_stock_threshold, created_at, updated_at)
  VALUES (gen_random_uuid(), 'MKN-BIMOLI2', 'Minyak Goreng Bimoli 2 Liter',
    'Minyak goreng serbaguna berkualitas tinggi dari kelapa sawit pilihan, cocok untuk menggoreng dan menumis.',
    cat_makan, 120, 28000, 35000, 20, NOW(), NOW())
  RETURNING id INTO prod8;

  INSERT INTO products (id, sku, name, description, category_id, quantity, price_buy, price_sell, low_stock_threshold, created_at, updated_at)
  VALUES (gen_random_uuid(), 'MKN-KPTRJA', 'Kopi Toraja Arabika 250gr',
    'Kopi arabika single origin dari Toraja, Sulawesi Selatan dengan cita rasa fruity dan after taste yang panjang.',
    cat_makan, 4, 65000, 95000, 10, NOW(), NOW())
  RETURNING id INTO prod9;

  -- Produk Alat RT
  INSERT INTO products (id, sku, name, description, category_id, quantity, price_buy, price_sell, low_stock_threshold, created_at, updated_at)
  VALUES (gen_random_uuid(), 'ART-MIYAKO18', 'Rice Cooker Miyako 1.8 Liter',
    'Rice cooker kapasitas 1.8 liter dengan fungsi masak dan penghangat otomatis, bodi anti lengket.',
    cat_alat, 15, 185000, 265000, 5, NOW(), NOW())
  RETURNING id INTO prod10;

  INSERT INTO products (id, sku, name, description, category_id, quantity, price_buy, price_sell, low_stock_threshold, created_at, updated_at)
  VALUES (gen_random_uuid(), 'ART-SAPUMCF', 'Sapu Lantai Bulu Microfiber',
    'Sapu lantai dengan bulu microfiber yang menyerap debu lebih baik, tangkai stainless anti karat.',
    cat_alat, 0, 35000, 60000, 5, NOW(), NOW())
  RETURNING id INTO prod10; -- reuse var, prod10 sekarang sapu

  -- =============================================
  -- SEED STOCK TRANSACTIONS (Penjualan & Restok)
  -- =============================================

  -- Stok Keluar (penjualan)
  INSERT INTO stock_transactions (id, product_id, type, quantity, notes, created_at)
  VALUES
    (gen_random_uuid(), prod1,  'OUT', 3,  'Penjualan ke pelanggan retail - counter Malang', NOW() - INTERVAL '5 days'),
    (gen_random_uuid(), prod1,  'OUT', 2,  'Penjualan via Shopee Flash Sale', NOW() - INTERVAL '2 days'),
    (gen_random_uuid(), prod2,  'OUT', 1,  'Penjualan ke perusahaan PT Maju Bersama', NOW() - INTERVAL '3 days'),
    (gen_random_uuid(), prod3,  'OUT', 2,  'Penjualan via Tokopedia - paket bundling', NOW() - INTERVAL '1 day'),
    (gen_random_uuid(), prod5,  'OUT', 10, 'Penjualan grosir ke reseller Surabaya', NOW() - INTERVAL '4 days'),
    (gen_random_uuid(), prod5,  'OUT', 5,  'Penjualan langsung toko offline', NOW() - INTERVAL '1 day'),
    (gen_random_uuid(), prod8,  'OUT', 30, 'Penjualan grosir ke warung Bu Sari', NOW() - INTERVAL '6 days'),
    (gen_random_uuid(), prod8,  'OUT', 20, 'Penjualan ke minimarket lokal', NOW() - INTERVAL '2 days');

  -- Update quantity produk setelah transaksi keluar
  UPDATE products SET quantity = quantity - 5  WHERE id = prod1;  -- -3-2
  UPDATE products SET quantity = quantity - 1  WHERE id = prod2;
  UPDATE products SET quantity = quantity - 2  WHERE id = prod3;
  UPDATE products SET quantity = quantity - 15 WHERE id = prod5;  -- -10-5
  UPDATE products SET quantity = quantity - 50 WHERE id = prod8;  -- -30-20

  -- Stok Masuk (restok)
  INSERT INTO stock_transactions (id, product_id, type, quantity, notes, created_at)
  VALUES
    (gen_random_uuid(), prod9,  'IN', 20, 'Restok dari supplier Toraja Coffee Co. - Invoice #TRC-0718', NOW() - INTERVAL '3 days'),
    (gen_random_uuid(), prod10, 'IN', 15, 'Pembelian dari distributor Miyako - Invoice #MYK-2026-0718', NOW() - INTERVAL '2 days'),
    (gen_random_uuid(), prod4,  'IN', 5,  'Restok dari distributor resmi Sony Indonesia', NOW() - INTERVAL '1 day');

  -- Update quantity setelah stok masuk
  UPDATE products SET quantity = quantity + 20 WHERE id = prod9;
  UPDATE products SET quantity = quantity + 15 WHERE id = prod10;
  UPDATE products SET quantity = quantity + 5  WHERE id = prod4;

  RAISE NOTICE 'Seed data berhasil dimasukkan!';
END $$;

-- Tampilkan ringkasan
SELECT 'categories' AS tabel, COUNT(*) AS total FROM categories
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'stock_transactions', COUNT(*) FROM stock_transactions;
