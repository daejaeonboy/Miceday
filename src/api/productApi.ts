import { supabase } from '../lib/supabase';

export interface Product {
    id?: string;
    name: string;
    category?: string;
    _parent_category?: string;
    display_order?: number;
    price: number;
    description?: string;
    short_description?: string;
    image_url?: string;
    stock: number;
    discount_rate?: number;
    rating?: number;
    review_count?: number;
    created_at?: string;
    product_type?: 'basic' | 'essential' | 'additional' | 'cooperative' | 'place' | 'food';
    basic_components?: { name: string; model_name?: string; quantity: number }[];
    additional_components?: { name: string; model_name?: string; price: number; _category?: string }[];
    cooperative_components?: { name: string; model_name?: string; price: number; _category?: string }[];
    place_components?: { name: string; price: number }[];
    food_components?: { name: string; price: number }[];
}

let productDisplayOrderSupportedCache: boolean | null = null;

const isDisplayOrderMissingError = (error: any): boolean => {
    const code = String(error?.code || '');
    const message = String(error?.message || '');
    return code === '42703' || message.includes('products.display_order');
};

const sortProductsByDisplayOrder = (items: Product[]): Product[] => {
    return [...items].sort((a, b) => {
        const aOrder = typeof a.display_order === 'number' ? a.display_order : Number.MAX_SAFE_INTEGER;
        const bOrder = typeof b.display_order === 'number' ? b.display_order : Number.MAX_SAFE_INTEGER;
        if (aOrder !== bOrder) return aOrder - bOrder;

        const aCreated = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bCreated = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bCreated - aCreated;
    });
};

export const isProductDisplayOrderSupported = async (): Promise<boolean> => {
    if (productDisplayOrderSupportedCache !== null) {
        return productDisplayOrderSupportedCache;
    }

    const { error } = await supabase
        .from('products')
        .select('id,display_order')
        .limit(1);

    if (error) {
        if (isDisplayOrderMissingError(error)) {
            productDisplayOrderSupportedCache = false;
            return false;
        }
        throw error;
    }

    productDisplayOrderSupportedCache = true;
    return true;
};

// All products
export const getProducts = async (): Promise<Product[]> => {
    const supportsDisplayOrder = await isProductDisplayOrderSupported();
    const query = supabase.from('products').select('*');

    const { data, error } = supportsDisplayOrder
        ? await query
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false })
        : await query.order('created_at', { ascending: false });

    if (error) throw error;
    return sortProductsByDisplayOrder(data || []);
};

// Products by category
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
    const query = supabase.from('products').select('*');

    if (category && category !== 'all') {
        query.eq('category', category);
    }

    const supportsDisplayOrder = await isProductDisplayOrderSupported();
    const { data, error } = supportsDisplayOrder
        ? await query
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false })
        : await query.order('created_at', { ascending: false });

    if (error) throw error;
    return sortProductsByDisplayOrder(data || []);
};

// Products by type (basic, essential, additional, cooperative, place, food)
export const getProductsByType = async (type: string): Promise<Product[]> => {
    let query = supabase.from('products').select('*');

    if (type === 'additional' || type === 'essential') {
        query = query.in('product_type', ['essential', 'additional']);
    } else {
        query = query.eq('product_type', type);
    }

    if (type === 'basic') {
        const supportsDisplayOrder = await isProductDisplayOrderSupported();
        const { data, error } = supportsDisplayOrder
            ? await query
                .order('display_order', { ascending: true })
                .order('created_at', { ascending: false })
            : await query.order('created_at', { ascending: false });

        if (error) throw error;
        return sortProductsByDisplayOrder(data || []);
    }

    const { data, error } = await query.order('name', { ascending: true });
    if (error) throw error;
    return data || [];
};

// Search products
export const searchProducts = async (keyword: string): Promise<Product[]> => {
    if (!keyword) return [];

    const supportsDisplayOrder = await isProductDisplayOrderSupported();
    const query = supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${keyword}%,description.ilike.%${keyword}%,short_description.ilike.%${keyword}%`)
        .eq('product_type', 'basic');

    const { data, error } = supportsDisplayOrder
        ? await query
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false })
        : await query.order('created_at', { ascending: false });

    if (error) throw error;
    return sortProductsByDisplayOrder(data || []);
};

// Single product
export const getProductById = async (id: string): Promise<Product | null> => {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
};

// Add product
export const addProduct = async (product: Omit<Product, 'id' | 'created_at'>): Promise<Product> => {
    const userData = { ...product };
    const supportsDisplayOrder = await isProductDisplayOrderSupported();

    if (supportsDisplayOrder && typeof userData.display_order !== 'number') {
        const { data: firstByOrder, error: firstByOrderError } = await supabase
            .from('products')
            .select('display_order')
            .order('display_order', { ascending: true })
            .limit(1);

        if (firstByOrderError) throw firstByOrderError;
        userData.display_order = (firstByOrder?.[0]?.display_order || 0) - 1;
    }

    const { data, error } = await supabase
        .from('products')
        .insert([userData])
        .select()
        .single();

    if (error) throw error;
    return data;
};

// Update product
export const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product> => {
    const supportsDisplayOrder = await isProductDisplayOrderSupported();
    const safeUpdates = { ...updates };

    if (!supportsDisplayOrder) {
        delete safeUpdates.display_order;
    }

    if (Object.keys(safeUpdates).length === 0) {
        const existing = await getProductById(id);
        if (!existing) throw new Error('Product not found');
        return existing;
    }

    const { data, error } = await supabase
        .from('products')
        .update(safeUpdates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

// Save drag order
export const updateProductsDisplayOrder = async (orderedProductIds: string[]): Promise<void> => {
    if (orderedProductIds.length === 0) return;

    const supportsDisplayOrder = await isProductDisplayOrderSupported();
    if (!supportsDisplayOrder) {
        throw new Error('DISPLAY_ORDER_NOT_SUPPORTED');
    }

    const updates = orderedProductIds.map((id, index) =>
        supabase
            .from('products')
            .update({ display_order: index + 1 })
            .eq('id', id)
    );

    const results = await Promise.all(updates);
    const failed = results.find((result) => result.error);
    if (failed?.error) throw failed.error;
};

// Update products category in batch
export const updateProductsCategoryBatch = async (oldCategory: string, newCategory: string): Promise<void> => {
    const { error } = await supabase
        .from('products')
        .update({ category: newCategory })
        .eq('category', oldCategory);

    if (error) throw error;
};

// Delete product
export const deleteProduct = async (id: string): Promise<void> => {
    await supabase.from('product_sections').delete().eq('product_id', id);
    await supabase.from('bookings').delete().eq('product_id', id);

    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

// Product by code
export const getProductByCode = async (code: string): Promise<Product | null> => {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('product_code', code)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
    }
    return data;
};
