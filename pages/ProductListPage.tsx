import React, { useState, useEffect, useCallback } from 'react';
import { Container } from '../components/ui/Container';
import { Loader2 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { getProducts, Product } from '../src/api/productApi';
import { getAllNavMenuItems } from '../src/api/cmsApi';
import { supabase } from '../src/lib/supabase';
import { MainCategoryTabs } from '../components/MainCategoryTabs';

const ALL_CATEGORY = '전체';
const PRODUCTS_PER_PAGE = 16;

export const ProductListPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const urlCategory = searchParams.get('category');
    const urlTitle = searchParams.get('title');

    const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [displayedCategories, setDisplayedCategories] = useState<string[]>([ALL_CATEGORY]);
    const [currentPage, setCurrentPage] = useState(1);

    // Grouping State
    const [parentToChildMap, setParentToChildMap] = useState<Record<string, string[]>>({});
    const [currentGroup, setCurrentGroup] = useState<string | null>(null);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const [productData, navItems] = await Promise.all([
                getProducts(),
                getAllNavMenuItems()
            ]);

            // Build category maps from nav_menu_items FIRST
            const pMap: Record<string, string[]> = {};
            const cMap: Record<string, string> = {};
            const topCategories: string[] = [];
            const categoryIndexMap: Record<string, number> = {};

            const sortedNavItems = navItems
                .filter(item => item.is_active !== false)
                .sort((a, b) => {
                    const orderA = typeof a.display_order === 'number' ? a.display_order : 999;
                    const orderB = typeof b.display_order === 'number' ? b.display_order : 999;
                    return orderA - orderB;
                });

            // 1. Build hierarchy mapping
            sortedNavItems.forEach((item) => {
                const name = item.name?.trim();
                const parent = item.category?.trim();
                if (!name) return;

                if (!parent) {
                    if (!topCategories.includes(name)) {
                        topCategories.push(name);
                    }
                    return;
                }

                if (!pMap[parent]) pMap[parent] = [];
                if (!pMap[parent].includes(name)) {
                    pMap[parent].push(name);
                }
                cMap[name] = parent;
            });

            // 2. Assign absolute sequence index (Top level Category first, then all its children)
            let absoluteIndex = 0;
            topCategories.forEach(parentName => {
                categoryIndexMap[parentName] = absoluteIndex++;
                if (pMap[parentName]) {
                    pMap[parentName].forEach(childName => {
                        categoryIndexMap[childName] = absoluteIndex++;
                    });
                }
            });

            // Filter basic products
            const basicProducts = productData.filter((p) => {
                const category = p.category || '';
                return (
                    p.product_type === 'basic' ||
                    (!p.product_type && !category.includes('추가') && !category.includes('장소') && !category.includes('음식'))
                );
            });

            setProducts(
                [...basicProducts].sort((a, b) => {
                    const catA = a.category ? a.category.trim() : '';
                    const catB = b.category ? b.category.trim() : '';

                    // Lookup parent to ensure we sort by parent block first
                    let rootA = catA;
                    while (cMap[rootA]) rootA = cMap[rootA];
                    
                    let rootB = catB;
                    while (cMap[rootB]) rootB = cMap[rootB];

                    const rootIndexA = categoryIndexMap[rootA] ?? 9999;
                    const rootIndexB = categoryIndexMap[rootB] ?? 9999;

                    // 1. Sort by top-level category chunk
                    if (rootIndexA !== rootIndexB) {
                        return rootIndexA - rootIndexB;
                    }

                    // 2. Sort by exact subcategory index inside the chunk
                    const exactIndexA = categoryIndexMap[catA] ?? 9999;
                    const exactIndexB = categoryIndexMap[catB] ?? 9999;
                    if (exactIndexA !== exactIndexB) {
                        return exactIndexA - exactIndexB;
                    }

                    // Fallback to display_order / created_at within same exact category
                    const aOrder = typeof a.display_order === 'number' ? a.display_order : Number.MAX_SAFE_INTEGER;
                    const bOrder = typeof b.display_order === 'number' ? b.display_order : Number.MAX_SAFE_INTEGER;
                    if (aOrder !== bOrder) return aOrder - bOrder;
                    const aCreated = a.created_at ? new Date(a.created_at).getTime() : 0;
                    const bCreated = b.created_at ? new Date(b.created_at).getTime() : 0;
                    return bCreated - aCreated;
                })
            );

            setParentToChildMap(pMap);
            const defaultDisplayed = [ALL_CATEGORY, ...topCategories];

            // Determine Group & Active Category
            let targetGroup: string | null = null;
            let targetActive = ALL_CATEGORY;
            let targetDisplayed = defaultDisplayed;

            if (urlCategory) {
                const normalizedCategory = urlCategory.trim();

                if (pMap[normalizedCategory] && pMap[normalizedCategory].length > 0) {
                    targetGroup = normalizedCategory;
                    targetActive = ALL_CATEGORY;
                    targetDisplayed = [ALL_CATEGORY, ...pMap[normalizedCategory]];
                } else if (cMap[normalizedCategory]) {
                    const parent = cMap[normalizedCategory];
                    targetGroup = parent;
                    targetActive = normalizedCategory;
                    targetDisplayed = [ALL_CATEGORY, ...(pMap[parent] || [])];
                } else {
                    targetActive = normalizedCategory;
                    targetDisplayed = defaultDisplayed;

                    if (normalizedCategory.includes(',')) {
                        const selected = normalizedCategory
                            .split(',')
                            .map(s => s.trim())
                            .filter(Boolean);
                        targetDisplayed = [ALL_CATEGORY, ...selected];
                    }
                }
            }

            setCurrentGroup(targetGroup);
            setActiveCategory(targetActive);
            setDisplayedCategories(Array.from(new Set(targetDisplayed.filter(Boolean))));
        } catch (error) {
            console.error("Error getting products: ", error);
        } finally {
            setLoading(false);
        }
    }, [urlCategory]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    useEffect(() => {
        const channel = supabase
            .channel('product-list-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'nav_menu_items' },
                () => {
                    fetchProducts();
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'products' },
                () => {
                    fetchProducts();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchProducts]);

    // Enhanced Filter Logic
    const filteredProducts = products.filter(p => {
        const productCategory = p.category || '';

        // 1. If Active is "전체"
        if (activeCategory === ALL_CATEGORY) {
            // If we are in a group context, "전체" means "Any product belonging to this group's children"
            if (currentGroup && parentToChildMap[currentGroup]) {
                const children = parentToChildMap[currentGroup];
                if (children.length > 0) {
                    return children.includes(productCategory);
                }
                return productCategory === currentGroup;
            }
            // Otherwise, it means EVERYTHING
            return true;
        }

        // 1-2. Parent category click in default tab list
        if (parentToChildMap[activeCategory]?.length > 0) {
            return parentToChildMap[activeCategory].includes(productCategory);
        }

        // 2. Direct Match
        if (productCategory === activeCategory) return true;

        // 3. Comma-separated list Match
        if (activeCategory.includes(',')) {
            return activeCategory.split(',').includes(productCategory);
        }

        return false;
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [activeCategory, currentGroup, urlCategory]);

    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const startIndex = (safeCurrentPage - 1) * PRODUCTS_PER_PAGE;
    const pagedProducts = filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    return (
        <main className="bg-slate-50 min-h-screen pb-24 pt-0">
            {/* Main Category Navigation Bar */}
            <MainCategoryTabs variant="compact" />
            
            <Container>
                {/* Header Section */}
                <div className="mb-10 mt-10 flex flex-col items-start text-left">
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
                        {currentGroup || urlTitle || (activeCategory !== ALL_CATEGORY ? activeCategory : "모든 상품")}
                    </h1>
                    <p className="mt-4 text-slate-500">
                        기업 환경에 필요한 최적의 장비와 가구를 찾아보세요.
                    </p>
                </div>

                {/* Category Filter */}
                {displayedCategories.length > 0 && (
                    <div className="mb-12 overflow-x-auto">
                        <div className="flex min-w-max items-center gap-2 md:gap-3">
                            {displayedCategories.map((cat, idx) => {
                                if (!cat || cat.trim() === '') return null;
                                const isActive = activeCategory === cat;
                                return (
                                    <button
                                        key={`${cat}-${idx}`}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-300
                                            ${isActive
                                                ? 'bg-[#001e45] text-white shadow-md border border-[#001e45]'
                                                : 'bg-white text-slate-600 border border-slate-200 hover:border-[#001e45] hover:text-[#001e45]'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Product Grid */}
                {loading ? (
                    <div className="flex min-h-[400px] items-center justify-center">
                        <Loader2 className="animate-spin text-[#001e45]" size={40} />
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white text-center">
                        <p className="text-lg font-medium text-slate-500">등록된 상품이 없습니다.</p>
                        <Link to="/admin/products" className="mt-4 text-sm font-bold text-[#001e45] hover:underline">
                            관리자 페이지에서 상품 추가하기
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:gap-x-8 lg:gap-y-12 xl:grid-cols-4">
                            {pagedProducts.map((product) => (
                                <Link to={`/products/${product.id}`} key={product.id} className="group flex flex-col">
                                    {/* Image Container */}
                                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[20px] bg-white shadow-sm ring-1 ring-slate-900/5 transition-all duration-300 group-hover:shadow-md">
                                        <img
                                            src={product.image_url || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'}
                                            alt={product.name}
                                            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5" />
                                        
                                        {product.stock === 0 && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
                                                <span className="rounded-full border border-slate-200 bg-white/90 px-4 py-1.5 text-sm font-extrabold text-[#001e45] shadow-sm">품절</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="mt-5 flex flex-col px-1">
                                        <span className="mb-2 text-[11px] font-extrabold tracking-wider text-slate-400 uppercase">
                                            {product.category || '기본 상품'}
                                        </span>
                                         
                                        <h3 className="line-clamp-2 text-[16px] font-bold leading-snug text-slate-900 transition-colors group-hover:text-[#001e45]">
                                            {product.name}
                                        </h3>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-12 flex items-center justify-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                    disabled={safeCurrentPage === 1}
                                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    이전
                                </button>

                                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                                    <button
                                        key={page}
                                        type="button"
                                        onClick={() => setCurrentPage(page)}
                                        className={`h-10 min-w-10 rounded-lg border px-3 text-sm font-bold transition-colors ${
                                            safeCurrentPage === page
                                                ? 'border-[#001e45] bg-[#001e45] text-white'
                                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                    disabled={safeCurrentPage === totalPages}
                                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    다음
                                </button>
                            </div>
                        )}
                    </>
                )}
            </Container>
        </main>
    );
};


