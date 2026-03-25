-- Human Partner Rental (Micepartner) Database Schema
-- Run this script in the Supabase SQL Editor to create all tables with correct types

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Categories
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    level INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Sections
CREATE TABLE IF NOT EXISTS public.sections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    layout_mode TEXT DEFAULT 'grid-4',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Section Categories (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.section_categories (
    section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE,
    category_id TEXT, -- Might be UUID depending on old schema, using TEXT for safety if old DB used string
    PRIMARY KEY (section_id, category_id)
);

-- 4. Products
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    _parent_category TEXT,
    price NUMERIC DEFAULT 0,
    description TEXT,
    short_description TEXT,
    image_url TEXT,
    stock INTEGER DEFAULT 0,
    discount_rate NUMERIC DEFAULT 0,
    product_type TEXT DEFAULT 'basic',
    basic_components JSONB,
    additional_components JSONB,
    cooperative_components JSONB,
    place_components JSONB,
    food_components JSONB,
    product_code TEXT UNIQUE,
    review_count INTEGER DEFAULT 0,
    rating NUMERIC DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Product Sections (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.product_sections (
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    PRIMARY KEY (product_id, section_id)
);

-- 6. Banners
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    image_url TEXT,
    link TEXT,
    button_text TEXT,
    brand_text TEXT,
    banner_type TEXT DEFAULT 'hero',
    tab_id TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    target_product_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Popups
CREATE TABLE IF NOT EXISTS public.popups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    image_url TEXT,
    link TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    target_product_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Quick Menu Items
CREATE TABLE IF NOT EXISTS public.quick_menu_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT,
    image_url TEXT,
    link TEXT,
    category TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Tab Menu Items
CREATE TABLE IF NOT EXISTS public.tab_menu_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    link TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Nav Menu Items
CREATE TABLE IF NOT EXISTS public.nav_menu_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    link TEXT,
    category TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Alliance Members
CREATE TABLE IF NOT EXISTS public.alliance_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    category1 TEXT,
    category2 TEXT,
    address TEXT,
    phone TEXT,
    logo_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Bookings
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    product_options JSONB,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    total_price NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Turn off RLS temporarily for easy import
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE sections DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE banners DISABLE ROW LEVEL SECURITY;
ALTER TABLE alliance_members DISABLE ROW LEVEL SECURITY;
