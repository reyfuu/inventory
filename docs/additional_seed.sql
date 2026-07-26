DO $$
DECLARE
  cat_elec   UUID;
  cat_office UUID;
  cat_tools  UUID;
  cat_pakaian UUID;
  cat_makan  UUID;
  cat_alat   UUID;
BEGIN
  -- Ambil ID kategori berdasarkan nama yang ada
  SELECT id INTO cat_elec    FROM categories WHERE name IN ('Elektronik', 'Electronics') LIMIT 1;
  SELECT id INTO cat_office  FROM categories WHERE name = 'Office Supplies' LIMIT 1;
  SELECT id INTO cat_tools   FROM categories WHERE name = 'Tools & Hardware' LIMIT 1;
  SELECT id INTO cat_pakaian FROM categories WHERE name = 'Pakaian' LIMIT 1;
  SELECT id INTO cat_makan   FROM categories WHERE name = 'Makanan & Minuman' LIMIT 1;
  SELECT id INTO cat_alat    FROM categories WHERE name = 'Peralatan Rumah Tangga' LIMIT 1;

  -- 1. Tambahan Elektronik
  INSERT INTO products (id, sku, name, description, category_id, quantity, price_buy, price_sell, low_stock_threshold, created_at, updated_at)
  VALUES 
    (gen_random_uuid(), 'ELE-ROG-G14', 'Asus ROG Zephyrus G14', 'Laptop gaming premium dengan Ryzen 9, RTX 4060, layar 120Hz ROG Nebula.', cat_elec, 4, 24500000, 27900000, 2, NOW(), NOW()),
    (gen_random_uuid(), 'ELE-MXM3S', 'Logitech MX Master 3S', 'Wireless mouse ergonomis premium untuk produktivitas tinggi dan editing.', cat_elec, 15, 1250000, 1550000, 4, NOW(), NOW()),
    (gen_random_uuid(), 'ELE-SONYXM5', 'Headphone Sony WH-1000XM5', 'Noise cancelling headphone nirkabel terbaik dengan asisten suara pintar.', cat_elec, 6, 4200000, 4890000, 2, NOW(), NOW())
  ON CONFLICT (sku) DO NOTHING;

  -- 2. Tambahan Office Supplies
  INSERT INTO products (id, sku, name, description, category_id, quantity, price_buy, price_sell, low_stock_threshold, created_at, updated_at)
  VALUES 
    (gen_random_uuid(), 'OFC-PPLINE-A4', 'Kertas Paperline Gold A4 80gr', 'Satu ream kertas HVS putih kualitas tinggi ukuran A4 80gr isi 500 lembar.', cat_office, 50, 42000, 55000, 10, NOW(), NOW()),
    (gen_random_uuid(), 'OFC-SNWM-BLK', 'Spidol Snowman Boardmarker Hitam', 'Spidol whiteboard warna hitam mudah dihapus untuk presentasi atau sekolah.', cat_office, 120, 7500, 10500, 15, NOW(), NOW()),
    (gen_random_uuid(), 'OFC-BANTEX-A4', 'Bantex Ring Binder A4 25mm', 'Binder organizer dokumen ukuran A4 dengan ring besi kokoh warna biru.', cat_office, 25, 38000, 49000, 5, NOW(), NOW())
  ON CONFLICT (sku) DO NOTHING;

  -- 3. Tambahan Tools & Hardware
  INSERT INTO products (id, sku, name, description, category_id, quantity, price_buy, price_sell, low_stock_threshold, created_at, updated_at)
  VALUES 
    (gen_random_uuid(), 'TLS-BOSCH-SDR', 'Bosch Cordless Screwdriver Go 2', 'Obeng elektrik portable USB rechargeable dengan opsi torsi presisi.', cat_tools, 12, 450000, 599000, 3, NOW(), NOW()),
    (gen_random_uuid(), 'TLS-STNL-5M', 'Meteran Stanley 5 Meter', 'Alat pengukur panjang pita baja berlapis nilon ergonomis ukuran 5m.', cat_tools, 30, 65000, 85000, 5, NOW(), NOW()),
    (gen_random_uuid(), 'TLS-WD40-333', 'Cairan Anti Karat WD-40 333ml', 'Pelumas serbaguna untuk menghilangkan karat, kelembaban, dan derit pada besi.', cat_tools, 40, 52000, 68000, 8, NOW(), NOW())
  ON CONFLICT (sku) DO NOTHING;

  -- 4. Tambahan Pakaian
  INSERT INTO products (id, sku, name, description, category_id, quantity, price_buy, price_sell, low_stock_threshold, created_at, updated_at)
  VALUES 
    (gen_random_uuid(), 'PAK-JBM-NVY', 'Jaket Bomber Canvas Navy', 'Jaket kasual pria bahan canvas tebal dengan furing windproof warna biru tua.', cat_pakaian, 18, 165000, 249000, 4, NOW(), NOW()),
    (gen_random_uuid(), 'PAK-CHN-SLM', 'Celana Chino Pria Slim Fit', 'Celana chino katun stretch premium warna khaki potongan slim fit modern.', cat_pakaian, 22, 110000, 189000, 5, NOW(), NOW()),
    (gen_random_uuid(), 'PAK-KKS-BLK', 'Kaos Kaki Polos Hitam (3 Pack)', 'Set isi 3 pasang kaos kaki kerja/sekolah katun tebal anti bau warna hitam.', cat_pakaian, 60, 22000, 35000, 10, NOW(), NOW())
  ON CONFLICT (sku) DO NOTHING;

  -- 5. Tambahan Makanan & Minuman
  INSERT INTO products (id, sku, name, description, category_id, quantity, price_buy, price_sell, low_stock_threshold, created_at, updated_at)
  VALUES 
    (gen_random_uuid(), 'MKN-ULTRA-1L', 'Susu UHT Ultra Milk Full Cream 1L', 'Susu segar UHT rasa tawar kaya nutrisi kemasan karton 1 liter.', cat_makan, 80, 16500, 21000, 15, NOW(), NOW()),
    (gen_random_uuid(), 'MKN-INDM-GRG', 'Indomie Mi Goreng (Kardus)', 'Satu karton mi instan goreng legendaris isi 40 bungkus.', cat_makan, 15, 108000, 125000, 3, NOW(), NOW()),
    (gen_random_uuid(), 'MKN-SARI-RTI', 'Roti Tawar Kupas Sari Roti', 'Roti tawar lembut tanpa kulit pinggiran kemasan isi 10 lembar.', cat_makan, 4, 14000, 18500, 5, NOW(), NOW())
  ON CONFLICT (sku) DO NOTHING;

  -- 6. Tambahan Peralatan Rumah Tangga
  INSERT INTO products (id, sku, name, description, category_id, quantity, price_buy, price_sell, low_stock_threshold, created_at, updated_at)
  VALUES 
    (gen_random_uuid(), 'ART-BLN-PHL', 'Blender Philips HR2115', 'Blender pisau stainless 5 tingkat kecepatan dengan jar plastik kapasitas 2L.', cat_alat, 9, 580000, 715000, 2, NOW(), NOW()),
    (gen_random_uuid(), 'ART-PRESTO-MX', 'Panci Presto Maxim 4 Liter', 'Panci presto aluminium kualitas tinggi untuk melunakkan daging lebih cepat.', cat_alat, 5, 230000, 329000, 2, NOW(), NOW()),
    (gen_random_uuid(), 'ART-BOX-SPT', 'Kotak Sepatu Transparan (Set isi 6)', 'Kotak box penyimpanan sepatu acrylic susun transparan model flip opening.', cat_alat, 35, 75000, 115000, 8, NOW(), NOW())
  ON CONFLICT (sku) DO NOTHING;

  RAISE NOTICE 'Produk tambahan berhasil ditambahkan!';
END $$;
