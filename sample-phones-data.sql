-- Additional Sample Mobile Phone Data
-- Run this in Supabase SQL Editor to add more phones for better AI matching

-- iPhone 12 Series
INSERT INTO mobile_phones (
    brand_id, model_name, display_name, price_range,
    screen_size, screen_resolution, screen_technology,
    processor, ram_gb, storage_gb,
    main_camera_mp, front_camera_mp, camera_features,
    battery_mah, fast_charging, wireless_charging, five_g,
    colors, weight_grams, dimensions, water_resistance,
    os, release_date, key_features, target_audience,
    comparison_points
) VALUES 
-- iPhone 12
(
    (SELECT id FROM brands WHERE name = 'Apple'),
    'iPhone 12',
    'iPhone 12',
    'high',
    6.1,
    '2532 × 1170',
    'Super Retina XDR OLED',
    'A14 Bionic',
    '{6}',
    '{64, 128, 256}',
    12,
    12,
    '{"Night Mode", "Portrait", "4K Video"}',
    2815,
    true,
    true,
    true,
    '{"Black", "White", "Red", "Green", "Blue", "Purple"}',
    164,
    '146.7 × 71.5 × 7.4 mm',
    'IP68',
    'iOS 14',
    '2020-10-23',
    '{"A14 Bionic Chip", "Dual Camera System", "MagSafe", "5G"}',
    '{"mainstream", "casual users", "upgraders"}',
    '{"premium_build": true, "flagship_performance": true, "good_cameras": true}'
),

-- iPhone 12 Pro
(
    (SELECT id FROM brands WHERE name = 'Apple'),
    'iPhone 12 Pro',
    'iPhone 12 Pro',
    'high',
    6.1,
    '2532 × 1170',
    'Super Retina XDR OLED',
    'A14 Bionic',
    '{6}',
    '{128, 256, 512}',
    12,
    12,
    '{"Night Mode", "Portrait", "ProRAW", "LiDAR"}',
    2815,
    true,
    true,
    true,
    '{"Silver", "Graphite", "Gold", "Pacific Blue"}',
    189,
    '146.7 × 71.5 × 7.4 mm',
    'IP68',
    'iOS 14',
    '2020-10-23',
    '{"A14 Bionic Chip", "Pro Camera System", "LiDAR Scanner", "ProRAW"}',
    '{"professionals", "photographers", "power users"}',
    '{"premium_build": true, "flagship_performance": true, "pro_cameras": true}'
);

-- Samsung Galaxy S24 Series
INSERT INTO mobile_phones (
    brand_id, model_name, display_name, price_range,
    screen_size, screen_resolution, screen_technology,
    processor, ram_gb, storage_gb,
    main_camera_mp, front_camera_mp, camera_features,
    battery_mah, fast_charging, wireless_charging, five_g,
    colors, weight_grams, dimensions, water_resistance,
    os, release_date, key_features, target_audience,
    comparison_points
) VALUES 
-- Galaxy S24
(
    (SELECT id FROM brands WHERE name = 'Samsung'),
    'Galaxy S24',
    'Samsung Galaxy S24',
    'high',
    6.2,
    '2340 × 1080',
    'Dynamic AMOLED 2X',
    'Snapdragon 8 Gen 3',
    '{8}',
    '{128, 256}',
    50,
    12,
    '{"Night Mode", "Portrait", "8K Video", "AI Photography"}',
    4000,
    true,
    true,
    true,
    '{"Onyx Black", "Marble Gray", "Cobalt Violet", "Amber Yellow"}',
    167,
    '147.0 × 70.6 × 7.6 mm',
    'IP68',
    'Android 14',
    '2024-01-17',
    '{"Snapdragon 8 Gen 3", "Galaxy AI", "50MP Camera", "120Hz Display"}',
    '{"mainstream", "android users", "performance seekers"}',
    '{"premium_build": true, "flagship_performance": true, "good_cameras": true}'
),

-- Galaxy S24 Ultra
(
    (SELECT id FROM brands WHERE name = 'Samsung'),
    'Galaxy S24 Ultra',
    'Samsung Galaxy S24 Ultra',
    'high',
    6.8,
    '3120 × 1440',
    'Dynamic AMOLED 2X',
    'Snapdragon 8 Gen 3',
    '{12}',
    '{256, 512, 1024}',
    200,
    12,
    '{"Night Mode", "Portrait", "8K Video", "AI Photography", "S Pen"}',
    5000,
    true,
    true,
    true,
    '{"Titanium Black", "Titanium Gray", "Titanium Violet", "Titanium Yellow"}',
    232,
    '162.3 × 79.0 × 8.6 mm',
    'IP68',
    'Android 14',
    '2024-01-17',
    '{"200MP Camera", "S Pen", "Titanium Build", "Galaxy AI"}',
    '{"professionals", "power users", "content creators", "business users"}',
    '{"premium_build": true, "flagship_performance": true, "pro_cameras": true, "stylus": true}'
);

-- Google Pixel 8 Series
INSERT INTO mobile_phones (
    brand_id, model_name, display_name, price_range,
    screen_size, screen_resolution, screen_technology,
    processor, ram_gb, storage_gb,
    main_camera_mp, front_camera_mp, camera_features,
    battery_mah, fast_charging, wireless_charging, five_g,
    colors, weight_grams, dimensions, water_resistance,
    os, release_date, key_features, target_audience,
    comparison_points
) VALUES 
-- Pixel 8
(
    (SELECT id FROM brands WHERE name = 'Google'),
    'Pixel 8',
    'Google Pixel 8',
    'high',
    6.2,
    '2400 × 1080',
    'OLED',
    'Google Tensor G3',
    '{8}',
    '{128, 256}',
    50,
    10,
    '{"Night Sight", "Portrait", "Magic Eraser", "AI Photography"}',
    4575,
    true,
    true,
    true,
    '{"Obsidian", "Hazel", "Rose"}',
    187,
    '150.5 × 70.8 × 8.9 mm',
    'IP68',
    'Android 14',
    '2023-10-04',
    '{"Google Tensor G3", "AI Photography", "Pure Android", "Magic Eraser"}',
    '{"photography enthusiasts", "android purists", "google fans"}',
    '{"premium_build": true, "ai_photography": true, "clean_android": true}'
),

-- Pixel 8 Pro
(
    (SELECT id FROM brands WHERE name = 'Google'),
    'Pixel 8 Pro',
    'Google Pixel 8 Pro',
    'high',
    6.7,
    '2992 × 1344',
    'LTPO OLED',
    'Google Tensor G3',
    '{12}',
    '{128, 256, 512}',
    50,
    10,
    '{"Night Sight", "Portrait", "Magic Eraser", "AI Photography", "Temperature Sensor"}',
    5050,
    true,
    true,
    true,
    '{"Obsidian", "Porcelain", "Bay"}',
    213,
    '162.6 × 76.5 × 8.8 mm',
    'IP68',
    'Android 14',
    '2023-10-04',
    '{"Google Tensor G3", "Pro Camera Bar", "Temperature Sensor", "Magic Eraser"}',
    '{"professionals", "photography enthusiasts", "tech enthusiasts"}',
    '{"premium_build": true, "ai_photography": true, "pro_cameras": true, "unique_features": true}'
);

-- OnePlus Series
INSERT INTO mobile_phones (
    brand_id, model_name, display_name, price_range,
    screen_size, screen_resolution, screen_technology,
    processor, ram_gb, storage_gb,
    main_camera_mp, front_camera_mp, camera_features,
    battery_mah, fast_charging, wireless_charging, five_g,
    colors, weight_grams, dimensions, water_resistance,
    os, release_date, key_features, target_audience,
    comparison_points
) VALUES 
-- OnePlus 12
(
    (SELECT id FROM brands WHERE name = 'OnePlus'),
    'OnePlus 12',
    'OnePlus 12',
    'high',
    6.82,
    '3168 × 1440',
    'LTPO AMOLED',
    'Snapdragon 8 Gen 3',
    '{12, 16}',
    '{256, 512}',
    50,
    32,
    '{"Night Mode", "Portrait", "Hasselblad Colors", "8K Video"}',
    5400,
    true,
    true,
    true,
    '{"Silky Black", "Flowy Emerald", "Pale Green"}',
    220,
    '164.3 × 75.8 × 9.15 mm',
    'IP65',
    'Android 14',
    '2024-01-23',
    '{"Snapdragon 8 Gen 3", "Hasselblad Camera", "100W Fast Charging", "Oxygen OS"}',
    '{"performance enthusiasts", "gamers", "fast charging lovers"}',
    '{"flagship_performance": true, "fast_charging": true, "good_cameras": true}'
);

-- Xiaomi Series
INSERT INTO mobile_phones (
    brand_id, model_name, display_name, price_range,
    screen_size, screen_resolution, screen_technology,
    processor, ram_gb, storage_gb,
    main_camera_mp, front_camera_mp, camera_features,
    battery_mah, fast_charging, wireless_charging, five_g,
    colors, weight_grams, dimensions, water_resistance,
    os, release_date, key_features, target_audience,
    comparison_points
) VALUES 
-- Xiaomi 14
(
    (SELECT id FROM brands WHERE name = 'Xiaomi'),
    'Xiaomi 14',
    'Xiaomi 14',
    'high',
    6.36,
    '2670 × 1200',
    'LTPO AMOLED',
    'Snapdragon 8 Gen 3',
    '{8, 12}',
    '{256, 512}',
    50,
    32,
    '{"Night Mode", "Portrait", "Leica Colors", "8K Video"}',
    4610,
    true,
    true,
    true,
    '{"Black", "White", "Green", "Pink"}',
    193,
    '152.8 × 71.5 × 8.2 mm',
    'IP68',
    'Android 14',
    '2023-10-26',
    '{"Snapdragon 8 Gen 3", "Leica Camera", "120W Fast Charging", "MIUI"}',
    '{"value seekers", "performance enthusiasts", "camera lovers"}',
    '{"value_for_money": true, "flagship_performance": true, "fast_charging": true}'
);