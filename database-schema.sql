-- Sales AI Database Schema
-- Mobile Phone Product Database and User Management

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Stores table
CREATE TABLE public.stores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    owner_id UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Users table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT,
    email TEXT,
    role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'store_owner', 'admin')),
    store_id UUID REFERENCES stores(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Mobile phone brands
CREATE TABLE public.brands (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Mobile phone models
CREATE TABLE public.mobile_phones (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    brand_id UUID REFERENCES brands(id) NOT NULL,
    model_name TEXT NOT NULL,
    display_name TEXT NOT NULL, -- "iPhone 15 Pro Max"
    price_range TEXT, -- "high", "mid", "low"
    
    -- Technical specifications
    screen_size DECIMAL(3,1), -- 6.7
    screen_resolution TEXT, -- "2796 x 1290"
    screen_technology TEXT, -- "OLED", "LCD", "AMOLED"
    
    processor TEXT, -- "A17 Pro", "Snapdragon 8 Gen 3"
    ram_gb INTEGER[], -- [8, 12, 16] for available variants
    storage_gb INTEGER[], -- [128, 256, 512, 1024]
    
    -- Camera specs
    main_camera_mp INTEGER,
    front_camera_mp INTEGER,
    camera_features TEXT[], -- ["Night Mode", "Portrait", "4K Video"]
    
    -- Battery and connectivity
    battery_mah INTEGER,
    fast_charging BOOLEAN DEFAULT false,
    wireless_charging BOOLEAN DEFAULT false,
    five_g BOOLEAN DEFAULT false,
    
    -- Physical attributes
    colors TEXT[], -- ["Black", "White", "Blue", "Gold"]
    weight_grams INTEGER,
    dimensions TEXT, -- "159.9 × 76.7 × 8.25 mm"
    water_resistance TEXT, -- "IP68"
    
    -- Operating system
    os TEXT, -- "iOS 17", "Android 14"
    
    -- Availability
    release_date DATE,
    is_available BOOLEAN DEFAULT true,
    
    -- AI training data
    key_features TEXT[], -- For AI to highlight
    target_audience TEXT[], -- ["professionals", "gamers", "photographers"]
    comparison_points JSONB, -- For AI comparisons
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Store inventory
CREATE TABLE public.store_inventory (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    store_id UUID REFERENCES stores(id) NOT NULL,
    phone_id UUID REFERENCES mobile_phones(id) NOT NULL,
    variant_ram INTEGER NOT NULL,
    variant_storage INTEGER NOT NULL,
    variant_color TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    is_display_model BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(store_id, phone_id, variant_ram, variant_storage, variant_color)
);

-- Customer interactions/chat sessions
CREATE TABLE public.chat_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    store_id UUID REFERENCES stores(id),
    session_token TEXT UNIQUE, -- For anonymous users
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    customer_requirements JSONB, -- Budget, preferences, use cases
    recommended_phones UUID[], -- Array of phone IDs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Individual messages in chat
CREATE TABLE public.chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES chat_sessions(id) NOT NULL,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'ai', 'system')),
    message_text TEXT NOT NULL,
    message_data JSONB, -- For structured data like phone comparisons
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Product recognition history
CREATE TABLE public.recognition_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES chat_sessions(id),
    image_url TEXT,
    recognized_phone_id UUID REFERENCES mobile_phones(id),
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    ai_analysis JSONB, -- Detailed analysis from vision AI
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS) Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE recognition_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Store owners can view their store" ON stores
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Store owners can update their store" ON stores
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Public can view active stores" ON stores
    FOR SELECT USING (is_active = true);

-- Public access to product data (phones, brands)
CREATE POLICY "Public can view brands" ON brands
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view mobile phones" ON mobile_phones
    FOR SELECT USING (is_available = true);

CREATE POLICY "Public can view store inventory" ON store_inventory
    FOR SELECT USING (stock_quantity > 0);

-- Chat sessions and messages
CREATE POLICY "Users can access own chat sessions" ON chat_sessions
    FOR ALL USING (auth.uid() = user_id OR session_token IS NOT NULL);

CREATE POLICY "Users can access own chat messages" ON chat_messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM chat_sessions 
            WHERE chat_sessions.id = chat_messages.session_id 
            AND (chat_sessions.user_id = auth.uid() OR chat_sessions.session_token IS NOT NULL)
        )
    );

-- Insert sample data
INSERT INTO brands (name, description) VALUES 
    ('Apple', 'Premium smartphones with iOS'),
    ('Samsung', 'Android smartphones with Galaxy series'),
    ('Google', 'Pure Android experience with Pixel phones'),
    ('OnePlus', 'High-performance Android phones'),
    ('Xiaomi', 'Value-for-money smartphones');

-- Sample mobile phone data (iPhone 15 Pro Max as example)
INSERT INTO mobile_phones (
    brand_id, model_name, display_name, price_range,
    screen_size, screen_resolution, screen_technology,
    processor, ram_gb, storage_gb,
    main_camera_mp, front_camera_mp, camera_features,
    battery_mah, fast_charging, wireless_charging, five_g,
    colors, weight_grams, dimensions, water_resistance,
    os, release_date, key_features, target_audience,
    comparison_points
) VALUES (
    (SELECT id FROM brands WHERE name = 'Apple'),
    'iPhone 15 Pro Max',
    'iPhone 15 Pro Max',
    'high',
    6.7,
    '2796 × 1290',
    'Super Retina XDR OLED',
    'A17 Pro',
    '{8}',
    '{256, 512, 1024}',
    48,
    12,
    '{"Night Mode", "Portrait", "Cinematic Mode", "Action Mode", "4K ProRes"}',
    4441,
    true,
    true,
    true,
    '{"Natural Titanium", "Blue Titanium", "White Titanium", "Black Titanium"}',
    221,
    '159.9 × 76.7 × 8.25 mm',
    'IP68',
    'iOS 17',
    '2023-09-22',
    '{"Titanium Design", "A17 Pro Chip", "Pro Camera System", "Action Button", "USB-C"}',
    '{"professionals", "content creators", "power users"}',
    '{"premium_build": true, "flagship_performance": true, "pro_cameras": true}'
);