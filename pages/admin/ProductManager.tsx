import { useEffect, useRef, useState } from 'react';
import {
    Plus,
    Pencil,
    Trash2,
    X,
    Save,
    Loader2,
    Upload,
    Image as ImageIcon,
    Grid3X3,
    Bold,
    Italic,
    Underline,
    ArrowUpDown,
} from 'lucide-react';
import {
    getProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    Product,
    isProductDisplayOrderSupported,
    updateProductsDisplayOrder,
    updateProductsCategoryBatch,
} from '../../src/api/productApi';
import { getAllNavMenuItems, addNavMenuItem, deleteNavMenuItem, updateNavMenuItem, NavMenuItem } from '../../src/api/cmsApi';
import { uploadImage } from '../../src/api/storageApi';

const SimpleEditor = ({ initialValue, onChange }: { initialValue: string; onChange: (val: string) => void }) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (contentRef.current && initialValue && contentRef.current.innerHTML !== initialValue) {
            contentRef.current.innerHTML = initialValue;
        }
    }, [initialValue]);

    const handleInput = () => {
        if (contentRef.current) onChange(contentRef.current.innerHTML);
    };

    const execCmd = (command: string, value: string | undefined = undefined) => {
        document.execCommand(command, false, value);
        handleInput();
        contentRef.current?.focus();
    };

    const handleImage = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            setUploading(true);
            try {
                const url = await uploadImage(file, 'description-images');
                execCmd('insertImage', url);
            } catch {
                alert('이미지 업로드에 실패했습니다.');
            } finally {
                setUploading(false);
            }
        };
        input.click();
    };

    return (
        <div className="h-72 overflow-hidden rounded-lg border border-slate-300 bg-white">
            <div className="flex items-center gap-1 border-b border-slate-200 bg-slate-50 p-2">
                <button type="button" onClick={() => execCmd('bold')} className="rounded p-1.5 text-slate-700 hover:bg-slate-200"><Bold size={18} /></button>
                <button type="button" onClick={() => execCmd('italic')} className="rounded p-1.5 text-slate-700 hover:bg-slate-200"><Italic size={18} /></button>
                <button type="button" onClick={() => execCmd('underline')} className="rounded p-1.5 text-slate-700 hover:bg-slate-200"><Underline size={18} /></button>
                <div className="mx-1 h-6 w-px bg-slate-300" />
                <button type="button" onClick={handleImage} disabled={uploading} className="flex items-center gap-1 rounded p-1.5 text-slate-700 hover:bg-slate-200 disabled:opacity-50">
                    {uploading ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
                    <span className="text-xs font-medium">이미지</span>
                </button>
            </div>
            <div ref={contentRef} className="prose prose-sm h-[236px] max-w-none overflow-y-auto p-4 outline-none" contentEditable onInput={handleInput} />
        </div>
    );
};

type ProductFormData = {
    name: string;
    category: string;
    price: number;
    description: string;
    short_description: string;
    image_url: string;
    stock: number;
    discount_rate: number;
    product_type: any;
    basic_components: any[];
    additional_components: any[];
    cooperative_components: any[];
    place_components: any[];
    food_components: any[];
};

const createInitialFormData = (productType: any = 'basic'): ProductFormData => ({
    name: '',
    category: '',
    price: 0,
    description: '',
    short_description: '',
    image_url: '',
    stock: 99999,
    discount_rate: 0,
    product_type: productType,
    basic_components: [],
    additional_components: [],
    cooperative_components: [],
    place_components: [],
    food_components: [],
});

const normalizeCategory = (value?: string | null): string => (value || '').trim();

const IMAGE_CROP_WIDTH = 360;
const IMAGE_CROP_HEIGHT = 270;
const IMAGE_OUTPUT_WIDTH = 1200;
const IMAGE_OUTPUT_HEIGHT = 900;
const IMAGE_MIN_ZOOM = 0.5;
const IMAGE_MAX_ZOOM = 1.5;
const CROP_SETTINGS_STORAGE_KEY = 'product-image-crop-settings-v1';

type CropPosition = { x: number; y: number };
type SavedCropSettings = { zoom: number; position: CropPosition };

export const ProductManager = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [menuItems, setMenuItems] = useState<NavMenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [saving, setSaving] = useState(false);

    const [isOrdering, setIsOrdering] = useState(false);
    const [isSavingOrder, setIsSavingOrder] = useState(false);
    const [draggingProductId, setDraggingProductId] = useState<string | null>(null);
    const [dragOverProductId, setDragOverProductId] = useState<string | null>(null);
    const autoScrollRafRef = useRef<number | null>(null);
    const autoScrollDeltaRef = useRef(0);
    const dragOriginalProductsRef = useRef<Product[] | null>(null);
    const dragDidDropRef = useRef(false);
    const dragLastTargetRef = useRef<string | null>(null);

    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showImageCropper, setShowImageCropper] = useState(false);
    const [cropImageSrc, setCropImageSrc] = useState('');
    const [cropFileName, setCropFileName] = useState('');
    const [cropImageNaturalSize, setCropImageNaturalSize] = useState({ width: 0, height: 0 });
    const [cropZoom, setCropZoom] = useState(1);
    const [cropPosition, setCropPosition] = useState<CropPosition>({ x: 0, y: 0 });
    const [lastCropZoomPercent, setLastCropZoomPercent] = useState<number | null>(null);
    const [isCropDragging, setIsCropDragging] = useState(false);
    const cropDragStartRef = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null);
    const pendingCropSettingsRef = useRef<SavedCropSettings | null>(null);
    const latestAppliedCropSettingsRef = useRef<SavedCropSettings | null>(null);

    const [newCategoryName, setNewCategoryName] = useState('');
    const [addingCategory, setAddingCategory] = useState(false);
    const [newSubCategoryName, setNewSubCategoryName] = useState('');
    const [selectedParentForSubCategory, setSelectedParentForSubCategory] = useState('');
    const [addingSubCategory, setAddingSubCategory] = useState(false);

    const [formData, setFormData] = useState<ProductFormData>(createInitialFormData());
    const [selectedParentCategoryFilter, setSelectedParentCategoryFilter] = useState<string | null>(null);
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
    const [selectedParentCategory, setSelectedParentCategory] = useState('');
    const [useCooperative, setUseCooperative] = useState(false);
    const [useAdditional, setUseAdditional] = useState(false);

    const parentMenuItems = menuItems
        .filter((item) => !normalizeCategory(item.category))
        .sort((a, b) => a.display_order - b.display_order);

    const getChildMenuItems = (parentName: string) => menuItems
        .filter((item) => normalizeCategory(item.category) === parentName)
        .sort((a, b) => a.display_order - b.display_order);

    const loadData = async () => {
        try {
            setLoading(true);
            const [productData, navData, orderingSupported] = await Promise.all([
                getProducts(),
                getAllNavMenuItems(),
                isProductDisplayOrderSupported(),
            ]);
            setProducts(productData);
            setMenuItems(navData);
            setIsOrdering(orderingSupported);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadData();
    }, []);

    useEffect(() => {
        if (parentMenuItems.length === 0) {
            setSelectedParentForSubCategory('');
            return;
        }
        if (!parentMenuItems.some((item) => item.name === selectedParentForSubCategory)) {
            setSelectedParentForSubCategory(parentMenuItems[0].name);
        }
    }, [menuItems, selectedParentForSubCategory]);

    const getActiveProductKey = () => (editingProduct?.id ? `product:${editingProduct.id}` : null);

    const loadSavedCropSettings = (productKey: string): SavedCropSettings | null => {
        if (typeof window === 'undefined') return null;
        try {
            const raw = window.localStorage.getItem(CROP_SETTINGS_STORAGE_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw) as Record<string, SavedCropSettings>;
            const saved = parsed?.[productKey];
            if (!saved) return null;
            return {
                zoom: Math.min(IMAGE_MAX_ZOOM, Math.max(IMAGE_MIN_ZOOM, Number(saved.zoom || 1))),
                position: { x: Number(saved.position?.x || 0), y: Number(saved.position?.y || 0) },
            };
        } catch {
            return null;
        }
    };

    const saveCropSettings = (productKey: string, settings: SavedCropSettings) => {
        if (typeof window === 'undefined') return;
        try {
            const raw = window.localStorage.getItem(CROP_SETTINGS_STORAGE_KEY);
            const parsed = raw ? (JSON.parse(raw) as Record<string, SavedCropSettings>) : {};
            parsed[productKey] = settings;
            window.localStorage.setItem(CROP_SETTINGS_STORAGE_KEY, JSON.stringify(parsed));
        } catch (error) {
            console.error('Failed to save crop settings:', error);
        }
    };

    const getCropMetrics = () => {
        const { width, height } = cropImageNaturalSize;
        if (!width || !height) return null;
        const baseScale = Math.max(IMAGE_CROP_WIDTH / width, IMAGE_CROP_HEIGHT / height);
        const scale = baseScale * cropZoom;
        const renderedWidth = width * scale;
        const renderedHeight = height * scale;
        const maxX = Math.max(0, (renderedWidth - IMAGE_CROP_WIDTH) / 2);
        const maxY = Math.max(0, (renderedHeight - IMAGE_CROP_HEIGHT) / 2);
        return { scale, maxX, maxY };
    };

    const clampCropPosition = (next: CropPosition) => {
        const metrics = getCropMetrics();
        if (!metrics) return next;
        return {
            x: Math.min(metrics.maxX, Math.max(-metrics.maxX, next.x)),
            y: Math.min(metrics.maxY, Math.max(-metrics.maxY, next.y)),
        };
    };

    useEffect(() => {
        setCropPosition((prev) => clampCropPosition(prev));
    }, [cropZoom, cropImageNaturalSize.width, cropImageNaturalSize.height]);

    const resetCropper = () => {
        if (cropImageSrc.startsWith('blob:')) URL.revokeObjectURL(cropImageSrc);
        setShowImageCropper(false);
        setCropImageSrc('');
        setCropFileName('');
        setCropImageNaturalSize({ width: 0, height: 0 });
        setCropZoom(1);
        setCropPosition({ x: 0, y: 0 });
        setIsCropDragging(false);
        cropDragStartRef.current = null;
        pendingCropSettingsRef.current = null;
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const resetForm = () => {
        if (showImageCropper || cropImageSrc) resetCropper();
        setFormData(createInitialFormData());
        setLastCropZoomPercent(null);
        latestAppliedCropSettingsRef.current = null;
        setEditingProduct(null);
        setUseCooperative(false);
        setUseAdditional(false);
        setSelectedParentCategory('');
        setShowForm(false);
    };

    const openImageCropper = (imageSrc: string, fileName: string, initialSettings: SavedCropSettings | null = null) => {
        if (cropImageSrc.startsWith('blob:')) URL.revokeObjectURL(cropImageSrc);
        pendingCropSettingsRef.current = initialSettings;
        setCropImageSrc(imageSrc);
        setCropFileName(fileName || 'product-image.jpg');
        setCropImageNaturalSize({ width: 0, height: 0 });
        setCropZoom(initialSettings?.zoom ?? 1);
        setCropPosition(initialSettings?.position ?? { x: 0, y: 0 });
        setShowImageCropper(true);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        openImageCropper(URL.createObjectURL(file), file.name || 'product-image.jpg');
    };

    const handleOpenExistingImageCropper = () => {
        if (!formData.image_url) {
            alert('편집할 이미지가 없습니다.');
            return;
        }
        const productKey = getActiveProductKey();
        const saved = productKey ? loadSavedCropSettings(productKey) : null;
        openImageCropper(formData.image_url, 'current-image.jpg', saved);
    };

    const handleCropImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const target = e.currentTarget;
        setCropImageNaturalSize({ width: target.naturalWidth || 0, height: target.naturalHeight || 0 });
        const pending = pendingCropSettingsRef.current;
        if (pending) {
            setCropZoom(Math.min(IMAGE_MAX_ZOOM, Math.max(IMAGE_MIN_ZOOM, pending.zoom)));
            setCropPosition({ x: pending.position?.x || 0, y: pending.position?.y || 0 });
        } else {
            setCropZoom(1);
            setCropPosition({ x: 0, y: 0 });
        }
        pendingCropSettingsRef.current = null;
    };

    const handleApplyImageCrop = async () => {
        if (!cropImageSrc || !cropImageNaturalSize.width || !cropImageNaturalSize.height) return;
        const metrics = getCropMetrics();
        if (!metrics) return;

        setUploading(true);
        try {
            const image = new Image();
            image.crossOrigin = 'anonymous';
            image.src = cropImageSrc;
            await new Promise<void>((resolve, reject) => {
                image.onload = () => resolve();
                image.onerror = () => reject(new Error('Image load failed'));
            });

            const canvas = document.createElement('canvas');
            canvas.width = IMAGE_OUTPUT_WIDTH;
            canvas.height = IMAGE_OUTPUT_HEIGHT;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Canvas unavailable');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Fill background first to avoid black bars when zoom is below 100%.
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, IMAGE_OUTPUT_WIDTH, IMAGE_OUTPUT_HEIGHT);

            // Render exactly like the preview viewport (WYSIWYG export).
            const outputScaleX = IMAGE_OUTPUT_WIDTH / IMAGE_CROP_WIDTH;
            const outputScaleY = IMAGE_OUTPUT_HEIGHT / IMAGE_CROP_HEIGHT;
            const previewRenderedWidth = cropImageNaturalSize.width * metrics.scale;
            const previewRenderedHeight = cropImageNaturalSize.height * metrics.scale;
            const drawWidth = previewRenderedWidth * outputScaleX;
            const drawHeight = previewRenderedHeight * outputScaleY;
            const drawX = IMAGE_OUTPUT_WIDTH / 2 - drawWidth / 2 + cropPosition.x * outputScaleX;
            const drawY = IMAGE_OUTPUT_HEIGHT / 2 - drawHeight / 2 + cropPosition.y * outputScaleY;

            ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);

            const blob = await new Promise<Blob>((resolve, reject) => {
                canvas.toBlob((result) => {
                    if (!result) reject(new Error('Blob convert failed'));
                    else resolve(result);
                }, 'image/jpeg', 0.95);
            });

            const file = new File([blob], cropFileName || 'product-image.jpg', { type: 'image/jpeg' });
            const imageUrl = await uploadImage(file, 'product-images');
            setFormData((prev) => ({ ...prev, image_url: imageUrl }));

            const appliedSettings = { zoom: cropZoom, position: cropPosition };
            latestAppliedCropSettingsRef.current = appliedSettings;
            setLastCropZoomPercent(Math.round(cropZoom * 100));
            const productKey = getActiveProductKey();
            if (productKey) saveCropSettings(productKey, appliedSettings);

            resetCropper();
        } catch (error) {
            console.error(error);
            alert('이미지 편집 적용에 실패했습니다.');
        } finally {
            setUploading(false);
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        const normalized = normalizeCategory(product.category);
        const matchedChild = menuItems.find((item) => normalizeCategory(item.name) === normalized && !!normalizeCategory(item.category));
        const matchedParent = parentMenuItems.find((item) => normalizeCategory(item.name) === normalized);
        if (matchedChild?.category) setSelectedParentCategory(normalizeCategory(matchedChild.category));
        else if (matchedParent?.name) setSelectedParentCategory(matchedParent.name);
        else setSelectedParentCategory('');

        setFormData({
            ...createInitialFormData('basic'),
            name: product.name,
            category: normalized,
            price: Number(product.price || 0),
            description: product.description || '',
            short_description: product.short_description || '',
            image_url: product.image_url || '',
            stock: Number(product.stock ?? 99999),
            discount_rate: Number(product.discount_rate || 0),
            product_type: 'basic',
            basic_components: product.basic_components || [],
            additional_components: product.additional_components || [],
            cooperative_components: product.cooperative_components || [],
            place_components: product.place_components || [],
            food_components: product.food_components || [],
        });

        setUseCooperative((product.cooperative_components || []).length > 0);
        setUseAdditional((product.additional_components || []).length > 0);
        const productKey = product.id ? `product:${product.id}` : null;
        const saved = productKey ? loadSavedCropSettings(productKey) : null;
        setLastCropZoomPercent(saved ? Math.round(saved.zoom * 100) : null);
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const normalizedCategory = normalizeCategory(formData.category);
        if (!normalizedCategory) {
            alert('카테고리를 선택해주세요.');
            return;
        }

        if (selectedParentCategory) {
            const children = getChildMenuItems(selectedParentCategory);
            if (children.length > 0 && !children.some((child) => child.name === normalizedCategory)) {
                alert('선택한 대분류의 중분류를 선택해주세요.');
                return;
            }
        }

        setSaving(true);
        try {
            const clean = (arr: any[]) => (arr || []).filter((i) => i.name).map(({ _category, ...rest }) => rest);
            const data = {
                ...formData,
                category: normalizedCategory,
                product_type: 'basic',
                basic_components: clean(formData.basic_components),
                cooperative_components: clean(formData.cooperative_components),
                additional_components: clean(formData.additional_components),
                place_components: clean(formData.place_components),
                food_components: clean(formData.food_components),
            };

            if (editingProduct?.id) {
                await updateProduct(editingProduct.id, data);
            } else {
                const created = await addProduct(data);
                if (created.id && latestAppliedCropSettingsRef.current) saveCropSettings(`product:${created.id}`, latestAppliedCropSettingsRef.current);
            }

            await loadData();
            resetForm();
            alert('저장되었습니다.');
        } catch (error: any) {
            alert(`저장 실패: ${error?.message || '알 수 없는 오류'}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        try {
            await deleteProduct(id);
            await loadData();
        } catch (error) {
            console.error(error);
            alert('삭제에 실패했습니다.');
        }
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        const parentName = newCategoryName.trim();
        if (!parentName) return;
        if (parentMenuItems.some((item) => item.name === parentName)) {
            alert('이미 존재하는 대분류입니다.');
            return;
        }
        setAddingCategory(true);
        try {
            const maxOrder = parentMenuItems.length > 0 ? Math.max(...parentMenuItems.map((item) => item.display_order)) : 0;
            await addNavMenuItem({
                name: parentName,
                link: `/products?category=${encodeURIComponent(parentName)}&title=${encodeURIComponent(parentName)}`,
                display_order: maxOrder + 1,
                is_active: true,
            });
            setNewCategoryName('');
            setSelectedParentForSubCategory((prev) => prev || parentName);
            await loadData();
        } catch (error) {
            console.error(error);
            alert('대분류 추가에 실패했습니다.');
        } finally {
            setAddingCategory(false);
        }
    };

    const handleAddSubCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        const childName = newSubCategoryName.trim();
        const parentName = selectedParentForSubCategory;
        if (!parentName) {
            alert('대분류를 먼저 선택해주세요.');
            return;
        }
        if (!childName) return;
        const siblings = getChildMenuItems(parentName);
        if (siblings.some((item) => item.name === childName)) {
            alert('현재 대분류 내에 이미 동일한 이름의 중분류가 존재합니다.');
            return;
        }
        setAddingSubCategory(true);
        try {
            const maxOrder = siblings.length > 0 ? Math.max(...siblings.map((item) => item.display_order)) : 0;
            await addNavMenuItem({
                name: childName,
                category: parentName,
                link: `/products?category=${encodeURIComponent(childName)}&title=${encodeURIComponent(parentName)}`,
                display_order: maxOrder + 1,
                is_active: true,
            });
            setNewSubCategoryName('');
            await loadData();
        } catch (error) {
            console.error(error);
            alert('중분류 추가에 실패했습니다.');
        } finally {
            setAddingSubCategory(false);
        }
    };

    const handleDeleteCategory = async (id: string | undefined, name: string) => {
        const children = getChildMenuItems(name);
        const names = [name, ...children.map((child) => child.name)];
        const usedCount = products.filter((product) => names.includes(normalizeCategory(product.category))).length;
        if (usedCount > 0) {
            alert(`해당 분류를 사용하는 상품이 ${usedCount}개 있습니다.`);
            return;
        }
        if (!confirm(`'${name}' 대분류를 삭제하시겠습니까?`)) return;
        const targetId = id || parentMenuItems.find((item) => item.name === name)?.id;
        if (!targetId) return;
        try {
            for (const child of children) if (child.id) await deleteNavMenuItem(child.id);
            await deleteNavMenuItem(targetId);
            await loadData();
            if (selectedParentCategoryFilter === name) {
                setSelectedParentCategoryFilter(null);
                setSelectedCategoryFilter(null);
            }
        } catch (error) {
            console.error(error);
            alert('삭제에 실패했습니다.');
        }
    };

    const handleDeleteSubCategory = async (id: string | undefined, name: string) => {
        const usedCount = products.filter((product) => normalizeCategory(product.category) === name).length;
        if (usedCount > 0) {
            alert(`'${name}' 중분류를 사용하는 상품이 ${usedCount}개 있습니다.`);
            return;
        }
        if (!confirm(`'${name}' 중분류를 삭제하시겠습니까?`)) return;
        if (!id) return;
        try {
            await deleteNavMenuItem(id);
            await loadData();
            if (selectedCategoryFilter === name) {
                setSelectedCategoryFilter(null);
            }
        } catch (error) {
            console.error(error);
            alert('삭제에 실패했습니다.');
        }
    };

    const getCategoryPathLabel = (categoryName?: string | null) => {
        const normalized = normalizeCategory(categoryName);
        if (!normalized) return '-';
        const matchedChild = menuItems.find((item) => normalizeCategory(item.name) === normalized && !!normalizeCategory(item.category));
        if (matchedChild?.category) return `${normalizeCategory(matchedChild.category)} > ${normalized}`;
        return normalized;
    };

    const isMainProduct = (product: Product) => product.product_type === 'basic' || !product.product_type;
    const matchesCategoryFilter = (product: Product) => {
        if (selectedCategoryFilter) return product.category === selectedCategoryFilter;
        if (selectedParentCategoryFilter) {
            const childCategories = getChildMenuItems(selectedParentCategoryFilter).map((m) => m.name);
            if (childCategories.length === 0) return product.category === selectedParentCategoryFilter;
            return childCategories.includes(product.category || '') || product.category === selectedParentCategoryFilter;
        }
        return true;
    };

    const mainProducts = (() => {
        const filtered = products.filter(isMainProduct);

        // Build hierarchy index maps from menuItems (same logic as ProductListPage)
        const pMap: Record<string, string[]> = {};
        const cMap: Record<string, string> = {};
        const topCats: string[] = [];
        const catIdx: Record<string, number> = {};

        const sorted = [...menuItems]
            .filter(item => item.is_active !== false)
            .sort((a, b) => {
                const oA = typeof a.display_order === 'number' ? a.display_order : 999;
                const oB = typeof b.display_order === 'number' ? b.display_order : 999;
                return oA - oB;
            });

        sorted.forEach((item) => {
            const name = item.name?.trim();
            const parent = item.category?.trim();
            if (!name) return;
            if (!parent) {
                if (!topCats.includes(name)) topCats.push(name);
                return;
            }
            if (!pMap[parent]) pMap[parent] = [];
            if (!pMap[parent].includes(name)) pMap[parent].push(name);
            cMap[name] = parent;
        });

        let idx = 0;
        topCats.forEach(p => {
            catIdx[p] = idx++;
            if (pMap[p]) pMap[p].forEach(c => { catIdx[c] = idx++; });
        });

        return [...filtered].sort((a, b) => {
            const catA = a.category ? a.category.trim() : '';
            const catB = b.category ? b.category.trim() : '';

            let rootA = catA;
            while (cMap[rootA]) rootA = cMap[rootA];
            let rootB = catB;
            while (cMap[rootB]) rootB = cMap[rootB];

            const rA = catIdx[rootA] ?? 9999;
            const rB = catIdx[rootB] ?? 9999;
            if (rA !== rB) return rA - rB;

            const eA = catIdx[catA] ?? 9999;
            const eB = catIdx[catB] ?? 9999;
            if (eA !== eB) return eA - eB;

            const aOrd = typeof a.display_order === 'number' ? a.display_order : Number.MAX_SAFE_INTEGER;
            const bOrd = typeof b.display_order === 'number' ? b.display_order : Number.MAX_SAFE_INTEGER;
            if (aOrd !== bOrd) return aOrd - bOrd;

            const aC = a.created_at ? new Date(a.created_at).getTime() : 0;
            const bC = b.created_at ? new Date(b.created_at).getTime() : 0;
            return bC - aC;
        });
    })();
    const filteredMainProducts = mainProducts.filter(matchesCategoryFilter);

    const buildReorderedState = (sourceProducts: Product[], draggedId: string, targetId: string) => {
        if (draggedId === targetId) return null;

        const sourceMainProducts = sourceProducts.filter(isMainProduct);
        const sourceFilteredMainProducts = sourceMainProducts.filter(matchesCategoryFilter);
        const visibleIds = sourceFilteredMainProducts
            .map((item) => item.id)
            .filter((id): id is string => Boolean(id));

        if (!visibleIds.includes(draggedId) || !visibleIds.includes(targetId)) return null;

        const dragIndex = visibleIds.indexOf(draggedId);
        const targetIndex = visibleIds.indexOf(targetId);
        if (dragIndex < 0 || targetIndex < 0) return null;

        const nextVisible = [...visibleIds];
        const [movedId] = nextVisible.splice(dragIndex, 1);
        nextVisible.splice(targetIndex, 0, movedId);

        const allMainIds = sourceMainProducts
            .map((item) => item.id)
            .filter((id): id is string => Boolean(id));
        const visibleSet = new Set(visibleIds);
        let cursor = 0;
        const nextAllMainIds = allMainIds.map((id) => (visibleSet.has(id) ? nextVisible[cursor++] : id));

        const byId = new Map(sourceProducts.map((item) => [item.id, item]));
        const reorderedMain = nextAllMainIds
            .map((id, index) => {
                const item = byId.get(id);
                return item ? { ...item, display_order: index + 1 } : null;
            })
            .filter((item): item is Product => Boolean(item));
        const preserved = sourceProducts.filter((item) => !item.id || !nextAllMainIds.includes(item.id));

        return {
            nextProducts: [...reorderedMain, ...preserved],
            nextAllMainIds,
        };
    };

    const clearDragState = () => {
        setDraggingProductId(null);
        setDragOverProductId(null);
        if (autoScrollRafRef.current !== null) {
            cancelAnimationFrame(autoScrollRafRef.current);
            autoScrollRafRef.current = null;
        }
        autoScrollDeltaRef.current = 0;
    };

    const handleProductDragStart = (e: React.DragEvent<HTMLButtonElement>, productId: string) => {
        if (!isOrdering || isSavingOrder) {
            e.preventDefault();
            return;
        }
        dragOriginalProductsRef.current = products;
        dragDidDropRef.current = false;
        dragLastTargetRef.current = null;
        setDraggingProductId(productId);
        setDragOverProductId(null);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', productId);
    };

    const handleProductDragOver = (e: React.DragEvent<HTMLTableRowElement>, productId: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        if (!draggingProductId || draggingProductId === productId || isSavingOrder) return;
        
        setDragOverProductId(productId);
        if (dragLastTargetRef.current === productId) return;
        dragLastTargetRef.current = productId;

        setProducts((prev) => {
            const built = buildReorderedState(prev, draggingProductId, productId);
            return built ? built.nextProducts : prev;
        });
    };

    const handleProductDrop = async (e: React.DragEvent<HTMLTableRowElement>, targetProductId: string) => {
        e.preventDefault();
        const draggedId = draggingProductId || e.dataTransfer.getData('text/plain');
        if (!draggedId) {
            clearDragState();
            return;
        }
        dragDidDropRef.current = true;
        dragLastTargetRef.current = null;

        const built = buildReorderedState(products, draggedId, targetProductId);
        const nextProducts = built ? built.nextProducts : products;
        const nextAllMainIds = built
            ? built.nextAllMainIds
            : nextProducts.filter(isMainProduct).map((item) => item.id).filter((id): id is string => Boolean(id));

        if (built) {
            setProducts(nextProducts);
        }

        setIsSavingOrder(true);
        try {
            await updateProductsDisplayOrder(nextAllMainIds);
        } catch (error) {
            console.error(error);
            alert('순서 저장에 실패했습니다. SQL 컬럼 적용 여부를 확인해주세요.');
            if (dragOriginalProductsRef.current) {
                setProducts(dragOriginalProductsRef.current);
            } else {
                await loadData();
            }
        } finally {
            setIsSavingOrder(false);
        }
        clearDragState();
        dragOriginalProductsRef.current = null;
        dragDidDropRef.current = false;
    };

    const handleProductDragEnd = () => {
        if (!dragDidDropRef.current && dragOriginalProductsRef.current) {
            setProducts(dragOriginalProductsRef.current);
        }
        clearDragState();
        dragOriginalProductsRef.current = null;
        dragDidDropRef.current = false;
        dragLastTargetRef.current = null;
    };

    useEffect(() => {
        if (!draggingProductId) {
            if (autoScrollRafRef.current !== null) {
                cancelAnimationFrame(autoScrollRafRef.current);
                autoScrollRafRef.current = null;
            }
            autoScrollDeltaRef.current = 0;
            return;
        }

        const EDGE_THRESHOLD = 120;
        const MIN_SPEED = 6;
        const MAX_SPEED = 24;

        const stopAutoScroll = () => {
            autoScrollDeltaRef.current = 0;
            if (autoScrollRafRef.current !== null) {
                cancelAnimationFrame(autoScrollRafRef.current);
                autoScrollRafRef.current = null;
            }
        };

        const startAutoScroll = () => {
            if (autoScrollRafRef.current !== null) return;
            const tick = () => {
                const delta = autoScrollDeltaRef.current;
                if (delta === 0) {
                    autoScrollRafRef.current = null;
                    return;
                }
                window.scrollBy({ top: delta, left: 0, behavior: 'auto' });
                autoScrollRafRef.current = requestAnimationFrame(tick);
            };
            autoScrollRafRef.current = requestAnimationFrame(tick);
        };

        const handleWindowDragOver = (event: DragEvent) => {
            const viewportHeight = window.innerHeight;
            let delta = 0;

            if (event.clientY < EDGE_THRESHOLD) {
                const ratio = 1 - event.clientY / EDGE_THRESHOLD;
                delta = -(MIN_SPEED + (MAX_SPEED - MIN_SPEED) * ratio);
            } else if (event.clientY > viewportHeight - EDGE_THRESHOLD) {
                const ratio = 1 - (viewportHeight - event.clientY) / EDGE_THRESHOLD;
                delta = MIN_SPEED + (MAX_SPEED - MIN_SPEED) * ratio;
            }

            autoScrollDeltaRef.current = Math.round(delta);
            if (autoScrollDeltaRef.current === 0) {
                stopAutoScroll();
                return;
            }
            startAutoScroll();
        };

        window.addEventListener('dragover', handleWindowDragOver);
        window.addEventListener('drop', stopAutoScroll);
        document.addEventListener('dragend', stopAutoScroll);

        return () => {
            window.removeEventListener('dragover', handleWindowDragOver);
            window.removeEventListener('drop', stopAutoScroll);
            document.removeEventListener('dragend', stopAutoScroll);
            stopAutoScroll();
        };
    }, [draggingProductId]);

    const cropMetrics = getCropMetrics();
    const productCategories = new Set(mainProducts.map((p) => p.category).filter(Boolean) as string[]);
    const parentMenusForFilter = parentMenuItems.filter((parent) => {
        const children = getChildMenuItems(parent.name);
        if (children.length === 0) return productCategories.has(parent.name);
        return children.some((child) => productCategories.has(child.name)) || productCategories.has(parent.name);
    });
    const childMenusForFilter = selectedParentCategoryFilter ? getChildMenuItems(selectedParentCategoryFilter) : [];
    const [editingSubCategoryId, setEditingSubCategoryId] = useState<string | null>(null);
    const [editSubCategoryName, setEditSubCategoryName] = useState('');

    const handleEditSubCategoryStart = (id: string, currentName: string) => {
        setEditingSubCategoryId(id);
        setEditSubCategoryName(currentName);
    };

    const handleEditSubCategorySave = async (id: string, originalName: string) => {
        const newName = editSubCategoryName.trim();
        if (!newName || newName === originalName) {
            setEditingSubCategoryId(null);
            return;
        }

        const siblings = getChildMenuItems(selectedParentForSubCategory);
        if (siblings.some((item) => item.id !== id && item.name === newName)) {
            alert('현재 대분류 내에 이미 동일한 이름의 중분류가 존재합니다.');
            return;
        }

        try {
            await updateNavMenuItem(id, { name: newName });
            
            // Update all products holding this category name to the new name
            await updateProductsCategoryBatch(originalName, newName);
            
            setEditingSubCategoryId(null);
            await loadData();
            
            // If the filtered category was renamed, update the filter
            if (selectedCategoryFilter === originalName) {
                setSelectedCategoryFilter(newName);
            }
        } catch (error) {
            console.error(error);
            alert('중분류 수정에 실패했습니다.');
        }
    };

    const currentOrderScopeLabel = selectedCategoryFilter
        ? `${selectedParentCategoryFilter || ''} > ${selectedCategoryFilter}`
        : selectedParentCategoryFilter || '전체';

    if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-[#001e45]" size={40} /></div>;

    return (
        <div className="mx-auto max-w-7xl p-6">
            <div className="mb-6 border-b pb-3"><h2 className="text-lg font-bold text-[#001e45]">상품 관리</h2></div>

            <div className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="mb-4 text-lg font-bold text-slate-800">상품 카테고리 관리</h3>
                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <h4 className="mb-3 text-sm font-bold text-slate-700">대분류</h4>
                        <form onSubmit={handleAddCategory} className="mb-4 flex gap-2">
                            <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="새 대분류" className="flex-1 rounded-lg border px-4 py-2 outline-none focus:ring-2 focus:ring-[#001e45]" />
                            <button type="submit" disabled={addingCategory || !newCategoryName.trim()} className="flex items-center gap-2 rounded-lg bg-[#001e45] px-4 py-2 text-white disabled:bg-slate-300">{addingCategory ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}추가</button>
                        </form>
                        <div className="flex flex-wrap gap-2">
                            {parentMenuItems.map((cat) => (
                                <div key={cat.id} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5">
                                    <span className="font-semibold text-slate-700">{cat.name}</span>
                                    <button type="button" onClick={() => void handleDeleteCategory(cat.id, cat.name)} className="rounded-md p-1 text-slate-300 hover:bg-red-50 hover:text-red-500"><Trash2 size={14} /></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <h4 className="mb-3 text-sm font-bold text-slate-700">중분류</h4>
                        <form onSubmit={handleAddSubCategory} className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
                            <select value={selectedParentForSubCategory} onChange={(e) => setSelectedParentForSubCategory(e.target.value)} className="rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-[#001e45]">
                                {parentMenuItems.map((parent) => <option key={parent.id} value={parent.name}>{parent.name}</option>)}
                            </select>
                            <input type="text" value={newSubCategoryName} onChange={(e) => setNewSubCategoryName(e.target.value)} placeholder="새 중분류" className="rounded-lg border px-4 py-2 outline-none focus:ring-2 focus:ring-[#001e45]" />
                            <button type="submit" disabled={addingSubCategory || !selectedParentForSubCategory || !newSubCategoryName.trim()} className="flex items-center justify-center gap-2 rounded-lg bg-[#001e45] px-4 py-2 text-white disabled:bg-slate-300">{addingSubCategory ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}추가</button>
                        </form>
                        <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                            {selectedParentForSubCategory && getChildMenuItems(selectedParentForSubCategory).map((child) => (
                                <div key={child.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 group">
                                    {editingSubCategoryId === child.id ? (
                                        <div className="flex flex-1 items-center gap-2">
                                            <input 
                                                type="text" 
                                                value={editSubCategoryName} 
                                                onChange={(e) => setEditSubCategoryName(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') void handleEditSubCategorySave(child.id!, child.name);
                                                    if (e.key === 'Escape') setEditingSubCategoryId(null);
                                                }}
                                                autoFocus
                                                className="flex-1 rounded border border-[#001e45] px-2 py-1 text-sm outline-none"
                                            />
                                            <button onClick={() => void handleEditSubCategorySave(child.id!, child.name)} className="rounded bg-[#001e45] px-2 py-1 text-xs text-white hover:bg-[#001e45]/80">저장</button>
                                            <button onClick={() => setEditingSubCategoryId(null)} className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-600 hover:bg-slate-100">취소</button>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="text-sm font-semibold text-slate-700">{selectedParentForSubCategory} &gt; {child.name}</span>
                                            <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                <button type="button" onClick={() => handleEditSubCategoryStart(child.id!, child.name)} className="rounded-md p-1.5 text-blue-400 hover:bg-blue-50 hover:text-blue-500"><Pencil size={14} /></button>
                                                <button type="button" onClick={() => void handleDeleteSubCategory(child.id, child.name)} className="rounded-md p-1.5 text-slate-300 hover:bg-red-50 hover:text-red-500"><Trash2 size={14} /></button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">상품 목록</h2>
                <button onClick={() => { setEditingProduct(null); setSelectedParentCategory(''); setLastCropZoomPercent(null); latestAppliedCropSettingsRef.current = null; setFormData(createInitialFormData('basic')); setShowForm(true); }} className="flex items-center gap-2 rounded-lg bg-[#001e45] px-4 py-2 text-white"><Plus size={20} />새 상품 추가</button>
            </div>

            {!isOrdering && <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">드래그 순서 저장을 사용하려면 `products.display_order` 컬럼이 필요합니다. `add_products_display_order.sql`을 Supabase SQL Editor에서 1회 실행해주세요.</div>}
            {isOrdering && <div className="mb-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">행 왼쪽 핸들을 드래그해서 상품 노출 순서를 변경할 수 있습니다. <span className="ml-1 font-semibold text-[#001e45]">현재 범위: {currentOrderScopeLabel}</span> {isSavingOrder && <span className="ml-2 font-semibold text-[#001e45]">순서 저장 중...</span>}</div>}

            {parentMenusForFilter.length > 0 && (
                <div className="mb-6 space-y-3">
                    <div className="flex gap-2 rounded-lg bg-slate-100 p-1 w-fit">
                        <button
                            onClick={() => {
                                setSelectedParentCategoryFilter(null);
                                setSelectedCategoryFilter(null);
                            }}
                            className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${selectedParentCategoryFilter === null ? 'bg-white text-[#001e45] shadow-sm' : 'text-slate-500'}`}
                        >
                            전체 ({mainProducts.length})
                        </button>
                        {parentMenusForFilter.map((parent) => {
                            const children = getChildMenuItems(parent.name);
                            const count = children.length > 0
                                ? mainProducts.filter((p) => children.some((c) => c.name === p.category) || p.category === parent.name).length
                                : mainProducts.filter((p) => p.category === parent.name).length;
                            return (
                                <button
                                    key={parent.id}
                                    onClick={() => {
                                        setSelectedParentCategoryFilter(parent.name);
                                        setSelectedCategoryFilter(null);
                                    }}
                                    className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${selectedParentCategoryFilter === parent.name ? 'bg-white text-[#001e45] shadow-sm' : 'text-slate-500'}`}
                                >
                                    {parent.name} ({count})
                                </button>
                            );
                        })}
                    </div>

                    {selectedParentCategoryFilter && childMenusForFilter.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedCategoryFilter(null)}
                                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${selectedCategoryFilter === null ? 'bg-[#001e45] text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}
                            >
                                전체 ({mainProducts.filter((p) => childMenusForFilter.some((c) => c.name === p.category) || p.category === selectedParentCategoryFilter).length})
                            </button>
                            {childMenusForFilter.map((child) => {
                                const count = mainProducts.filter((p) => p.category === child.name).length;
                                return (
                                    <button
                                        key={child.id}
                                        onClick={() => setSelectedCategoryFilter(child.name)}
                                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${selectedCategoryFilter === child.name ? 'bg-[#001e45] text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}
                                    >
                                        {child.name} ({count})
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="flex max-h-[90vh] w-full max-w-[1000px] flex-col rounded-xl bg-white shadow-2xl">
                        <div className="flex justify-between border-b bg-slate-50 p-4"><h3 className="text-lg font-bold">{editingProduct ? '상품 수정' : '새 상품 등록'}</h3><button onClick={resetForm} className="text-slate-400 hover:text-red-500"><X size={24} /></button></div>

                        <form onSubmit={handleSubmit} className="flex-1 space-y-6 overflow-y-auto p-6">
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                <div className="space-y-4">
                                    <div><label className="mb-1 block text-sm font-bold text-slate-700">상품명 *</label><input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-lg border px-4 py-2 outline-none focus:ring-2 focus:ring-[#001e45]" /></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="mb-1 block text-sm font-bold text-slate-700">1차 메뉴 (대분류)</label>
                                            <select value={selectedParentCategory} onChange={(e) => { const nextParent = e.target.value; setSelectedParentCategory(nextParent); const child = nextParent ? getChildMenuItems(nextParent) : []; if (!nextParent) setFormData((prev) => ({ ...prev, category: '' })); else if (child.length === 0) setFormData((prev) => ({ ...prev, category: nextParent })); else setFormData((prev) => ({ ...prev, category: child.some((x) => x.name === prev.category) ? prev.category : '' })); }} className="w-full rounded-lg border bg-slate-50 px-4 py-2 outline-none">
                                                <option value="">대분류 선택</option>
                                                {parentMenuItems.map((parent) => <option key={parent.id} value={parent.name}>{parent.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-bold text-slate-700">2차 메뉴 (중분류)</label>
                                            {(() => {
                                                const child = selectedParentCategory ? getChildMenuItems(selectedParentCategory) : [];
                                                const parentOnly = !!selectedParentCategory && child.length === 0;
                                                return (
                                                    <select value={parentOnly ? selectedParentCategory : formData.category} onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))} disabled={!selectedParentCategory || parentOnly} className="w-full rounded-lg border px-4 py-2 outline-none">
                                                        <option value="">{!selectedParentCategory ? '대분류를 먼저 선택하세요' : parentOnly ? '중분류 없음' : '중분류 선택'}</option>
                                                        {child.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
                                                    </select>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-slate-700">대표 이미지</label>
                                    <div onClick={() => fileInputRef.current?.click()} className="relative flex h-48 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 hover:bg-slate-50">
                                        {formData.image_url ? <img src={formData.image_url} alt="대표 이미지" className="h-full w-full object-cover" /> : <div className="text-center text-slate-400"><Upload size={40} className="mx-auto mb-2" /><span className="text-sm">클릭하여 업로드</span></div>}
                                        {uploading && <div className="absolute inset-0 flex items-center justify-center bg-white/80"><Loader2 className="animate-spin text-[#001e45]" /></div>}
                                    </div>
                                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
                                    <div className="flex gap-2"><button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">새 이미지 선택</button><button type="button" onClick={handleOpenExistingImageCropper} disabled={!formData.image_url} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400">현재 이미지 재편집</button></div>
                                    {lastCropZoomPercent !== null && <p className="text-xs text-slate-500">최근 적용 배율: {lastCropZoomPercent}%</p>}
                                    <input type="url" placeholder="또는 이미지 URL 입력" value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} className="w-full rounded-lg border px-4 py-2 text-sm outline-none" />
                                </div>
                            </div>

                            <div><label className="mb-2 block text-sm font-bold text-slate-700">상세 설명</label><SimpleEditor initialValue={formData.description} onChange={(value) => setFormData({ ...formData, description: value })} /></div>

                            <div className="space-y-4 border-t pt-6">
                                <h4 className="flex items-center gap-2 text-lg font-bold"><Grid3X3 size={22} className="text-[#001e45]" />상품 구성 옵션</h4>
                                {[{ id: 'cooperative', label: '협력 업체 옵션 활성화', state: useCooperative, setState: setUseCooperative, key: 'cooperative_components' }, { id: 'additional', label: '추가 물품 옵션 활성화', state: useAdditional, setState: setUseAdditional, key: 'additional_components' }].map((opt) => (
                                    <div key={opt.id} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                                        <div className="flex items-center gap-3"><input type="checkbox" id={`toggle-${opt.id}`} checked={opt.state} onChange={(e) => { opt.setState(e.target.checked); if (e.target.checked) setFormData({ ...formData, [opt.key]: [{ name: '__ALL__', price: 0 }] }); else setFormData({ ...formData, [opt.key]: [] }); }} className="h-5 w-5 accent-[#001e45]" /><label htmlFor={`toggle-${opt.id}`} className="cursor-pointer font-bold text-slate-800">{opt.label}</label></div>
                                    </div>
                                ))}
                            </div>
                        </form>

                        <div className="flex gap-4 border-t bg-slate-50 p-4"><button type="button" onClick={resetForm} className="flex-1 rounded-xl border border-slate-300 bg-white py-3 font-bold hover:bg-slate-100">취소</button><button type="button" onClick={(e) => void handleSubmit(e as any)} disabled={saving} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#001e45] py-3 font-bold text-white hover:bg-slate-800 disabled:bg-slate-300">{saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}<span>{editingProduct ? '수정사항 저장' : '등록하기'}</span></button></div>
                    </div>
                </div>
            )}

            {showImageCropper && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 p-4">
                    <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b px-5 py-4"><h4 className="text-base font-bold text-slate-800">대표 이미지 편집</h4><button type="button" onClick={resetCropper} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><X size={20} /></button></div>
                        <div className="space-y-4 px-5 py-5">
                            <p className="text-sm text-slate-500">이미지를 드래그해서 위치를 옮기고, 슬라이더로 확대/축소를 조정하세요.</p>
                            <div className={`relative mx-auto overflow-hidden rounded-xl border border-slate-300 bg-white ${isCropDragging ? 'cursor-grabbing' : 'cursor-grab'}`} style={{ width: IMAGE_CROP_WIDTH, height: IMAGE_CROP_HEIGHT }} onMouseDown={(e) => { e.preventDefault(); setIsCropDragging(true); cropDragStartRef.current = { x: e.clientX, y: e.clientY, startX: cropPosition.x, startY: cropPosition.y }; }} onMouseMove={(e) => { if (!isCropDragging || !cropDragStartRef.current) return; const { x, y, startX, startY } = cropDragStartRef.current; setCropPosition(clampCropPosition({ x: startX + (e.clientX - x), y: startY + (e.clientY - y) })); }} onMouseUp={() => { setIsCropDragging(false); cropDragStartRef.current = null; }} onMouseLeave={() => { setIsCropDragging(false); cropDragStartRef.current = null; }}>
                                {cropImageSrc && <img src={cropImageSrc} onLoad={handleCropImageLoad} draggable={false} alt="크롭 미리보기" className="absolute left-1/2 top-1/2 max-w-none select-none" style={{ width: cropImageNaturalSize.width ? `${cropImageNaturalSize.width}px` : 'auto', height: cropImageNaturalSize.height ? `${cropImageNaturalSize.height}px` : 'auto', transform: cropMetrics ? `translate(-50%, -50%) translate(${cropPosition.x}px, ${cropPosition.y}px) scale(${cropMetrics.scale})` : 'translate(-50%, -50%)', transformOrigin: 'center center' }} />}
                            </div>
                            <div><div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-500"><span>확대/축소</span><span>{Math.round(cropZoom * 100)}%</span></div><input type="range" min={IMAGE_MIN_ZOOM} max={IMAGE_MAX_ZOOM} step={0.01} value={cropZoom} onChange={(e) => setCropZoom(Number(e.target.value))} className="w-full accent-[#001e45]" /></div>
                        </div>
                        <div className="flex gap-3 border-t bg-slate-50 px-5 py-4"><button type="button" onClick={resetCropper} className="flex-1 rounded-xl border border-slate-300 bg-white py-2.5 font-bold text-slate-700 hover:bg-slate-100">취소</button><button type="button" onClick={() => void handleApplyImageCrop()} disabled={uploading || !cropMetrics} className="flex-1 rounded-xl bg-[#001e45] py-2.5 font-bold text-white hover:bg-slate-800 disabled:bg-slate-300">{uploading ? '적용 중...' : '적용'}</button></div>
                    </div>
                </div>
            )}

            <div className="mt-8 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl">
                <table className="w-full">
                    <thead className="bg-[#001e45] text-white">
                        <tr><th className="w-16 px-3 py-4 text-center text-sm font-bold uppercase tracking-wider">순서</th><th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">상품 정보</th><th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">메뉴(카테고리)</th><th className="px-6 py-4 text-right text-sm font-bold uppercase tracking-wider">가격</th><th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider">관리</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredMainProducts.map((p) => {
                            const isDraggingRow = draggingProductId === p.id;
                            const isDropTargetRow = !!draggingProductId && dragOverProductId === p.id && !isDraggingRow;
                            const rowClassName = [
                                'transition-[background-color,box-shadow,opacity] duration-150 ease-out',
                                !draggingProductId ? 'hover:bg-slate-50/80' : '',
                                isDraggingRow ? 'bg-white opacity-65' : '',
                                isDropTargetRow ? 'bg-[#001e45]/[0.04] ring-1 ring-inset ring-[#001e45]/20' : '',
                            ].filter(Boolean).join(' ');
                            const dragHandleClassName = [
                                'inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 transition-colors duration-150',
                                isOrdering ? 'cursor-grab text-slate-500 hover:bg-slate-100 active:cursor-grabbing' : 'cursor-not-allowed text-slate-300',
                                isDraggingRow ? 'bg-slate-100 text-[#001e45]' : '',
                            ].filter(Boolean).join(' ');

                            return (
                                <tr key={p.id} className={rowClassName} onDragOver={(e) => p.id && handleProductDragOver(e, p.id)} onDrop={(e) => p.id && void handleProductDrop(e, p.id)}>
                                    <td className="px-3 py-4 text-center"><button type="button" draggable={isOrdering && !isSavingOrder} onDragStart={(e) => p.id && handleProductDragStart(e, p.id)} onDragEnd={handleProductDragEnd} disabled={!isOrdering || isSavingOrder} className={dragHandleClassName}><ArrowUpDown size={15} /></button></td>
                                    <td className="px-6 py-4"><div className="flex items-center gap-4">{p.image_url ? <img src={p.image_url} className="h-12 w-12 rounded-xl object-cover shadow-sm" alt={p.name} /> : <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-300"><ImageIcon size={20} /></div>}<div className="font-bold text-slate-800">{p.name}</div></div></td>
                                    <td className="px-6 py-4 font-medium text-slate-600">{getCategoryPathLabel(p.category)}</td>
                                    <td className="px-6 py-4 text-right font-bold text-slate-900">{p.price.toLocaleString()}원</td>
                                    <td className="px-6 py-4"><div className="flex justify-center gap-2"><button onClick={() => handleEdit(p)} className="rounded-lg p-2 text-blue-500 hover:bg-blue-50"><Pencil size={18} /></button><button onClick={() => p.id && void handleDelete(p.id)} className="rounded-lg p-2 text-red-400 hover:bg-red-50"><Trash2 size={18} /></button></div></td>
                                </tr>
                            );
                        })}
                        {filteredMainProducts.length === 0 && <tr><td colSpan={5} className="px-6 py-10 text-center text-sm font-medium text-slate-400">조건에 맞는 상품이 없습니다.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

