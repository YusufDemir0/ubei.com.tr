'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { 
  ChevronRight, X, Check, Filter, RotateCcw 
} from 'lucide-react';
import type { Product } from '../types';
import { useCMSStore } from '../stores/useCMSStore';
import { useUIStore } from '../stores/useUIStore';
import ProductCard from './ProductCard';
import SearchableCheckList from './SearchableCheckList';
import { useModalDismiss } from '../lib/useModalDismiss';
import { searchFold } from '../lib/searchText';

interface CategoryPageProps {
  categorySlug: string;
  initialProducts?: Product[];
  /** Sunucunun bildiği kategori adı: store henüz dolmadan (SSR / ilk render) başlık "Koleksiyonlar" görünmesin */
  initialCategoryName?: string;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({
  categorySlug,
  initialProducts = [],
  initialCategoryName,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // CMS & UI Stores
  const firebaseProducts = useCMSStore((state) => state.products);
  const firebaseCategories = useCMSStore((state) => state.categories);
  const allProducts = firebaseProducts.length > 0 ? firebaseProducts : initialProducts;

  // --- URL-DRIVEN FILTER STATE ---
  const urlSearch = searchParams ? searchParams.get('search') : null;
  const uiSearchQuery = useUIStore((state) => state.searchQuery);
  const searchText = (urlSearch !== null && urlSearch !== undefined ? urlSearch : uiSearchQuery).trim();
  const effectiveSearch = searchFold(searchText);

  const minPriceParam = searchParams?.get('minPrice');
  const maxPriceParam = searchParams?.get('maxPrice');
  const appliedMinPrice = minPriceParam ? Number(minPriceParam) : '';
  const appliedMaxPrice = maxPriceParam ? Number(maxPriceParam) : '';

  const colorParam = searchParams?.get('color') || '';
  const selectedColors = useMemo(() => {
    return colorParam ? colorParam.split(',').map((c) => c.trim()).filter(Boolean) : [];
  }, [colorParam]);

  const materialParam = searchParams?.get('material') || '';
  const selectedMaterials = useMemo(() => {
    return materialParam ? materialParam.split(',').map((m) => m.trim()).filter(Boolean) : [];
  }, [materialParam]);

  const selectedWidthRange = searchParams?.get('width') || 'all'; // all, compact (<150), medium (150-210), large (>210)
  const inStockOnly = searchParams?.get('stock') === 'true';
  const sortBy = searchParams?.get('sort') || 'default';
  const currentPage = parseInt(searchParams?.get('page') || '1', 10);
  const itemsPerPage = 9;

  // Local Form Input States for Min/Max Price Inputs
  const [minPriceInput, setMinPriceInput] = useState<number | ''>(appliedMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState<number | ''>(appliedMaxPrice);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);
  const closeMobileFilter = React.useCallback(() => setIsMobileFilterOpen(false), []);
  useModalDismiss(isMobileFilterOpen, closeMobileFilter);

  // Synchronize local input fields whenever URL parameters change
  useEffect(() => {
    setMinPriceInput(appliedMinPrice);
    setMaxPriceInput(appliedMaxPrice);
  }, [appliedMinPrice, appliedMaxPrice]);

  // Centralized URL SearchParams Updater (URL-Based Filtering)
  const updateFilters = (newParams: Record<string, string | number | boolean | null | undefined>) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '');

    // Reset page to 1 whenever any filter changes (unless page is explicitly provided)
    if (!('page' in newParams)) {
      params.delete('page');
    }

    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === undefined || val === '' || val === 'all' || val === false) {
        params.delete(key);
      } else {
        params.set(key, String(val));
      }
    });

    const queryString = params.toString();
    const basePath = pathname === '/' ? `/kategori/${categorySlug}` : pathname;
    const targetUrl = queryString ? `${basePath}?${queryString}` : basePath;
    router.push(targetUrl, { scroll: false }); // push: geri tuşu son filtre değişikliğini geri alabilsin
  };

  // Resolve Category Name & Category List (sortOrder bazlı, alfabetik değil)
  const categoryList = firebaseCategories.length > 0 ? firebaseCategories : [];
  const sortedCategoryList = useMemo(() => {
    return [...categoryList].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [categoryList]);

  const rootCategories = useMemo(() => {
    return sortedCategoryList.filter((c) => !c.parentId);
  }, [sortedCategoryList]);

  const currentCategory = sortedCategoryList.find(c => c.slug === categorySlug || c.id === categorySlug);
  const categoryName = currentCategory 
    ? currentCategory.name 
    : (categorySlug === 'hepsi' || categorySlug === 'all' ? 'Tüm Ürünler' : initialCategoryName || 'Ürünler');

  // Geçerli kategorinin alt kategorileri veya kardeş alt kategorileri
  const currentSubcategories = useMemo(() => {
    if (!currentCategory) return [];
    const directChildren = sortedCategoryList.filter((c) => c.parentId === currentCategory.id);
    if (directChildren.length > 0) return directChildren;
    if (currentCategory.parentId) {
      return sortedCategoryList.filter((c) => c.parentId === currentCategory.parentId);
    }
    return [];
  }, [currentCategory, sortedCategoryList]);

const MATERIAL_GROUPS = [
  { id: 'silikon', label: 'Silikon / TPU', keywords: ['silikon', 'tpu'] },
  { id: 'seffaf', label: 'Polikarbonat / Şeffaf', keywords: ['polikarbonat', 'şeffaf'] },
  { id: 'deri', label: 'Deri', keywords: ['deri'] },
  { id: 'cam', label: 'Temperli cam', keywords: ['cam'] },
  { id: 'metal', label: 'Alüminyum / Metal', keywords: ['alüminyum', 'aluminyum', 'metal'] },
  { id: 'orgu', label: 'Örgü kablo', keywords: ['örgü', 'naylon'] },
];

  // Materials List - Grouped & strictly dynamic from products in this view (F-18)
  const MATERIALS_LIST = useMemo(() => {
    return MATERIAL_GROUPS.filter((group) =>
      allProducts.some((p) => {
        const mat = (p.material || '').toLowerCase();
        return group.keywords.some((kw) => mat.includes(kw));
      })
    ).map((g) => g.label);
  }, [allProducts]);

  // Colors List - Strictly dynamic from products in this view to prevent zero-result blind filters (F-17)
  const COLORS_LIST = useMemo(() => {
    const dynamicSet = new Set<string>();
    allProducts.forEach((p) => {
      const rawColors = [
        ...(Array.isArray(p.colors) ? p.colors : []),
        ...(Array.isArray(p.colorOptions) ? p.colorOptions : []),
        ...(p.color ? [p.color] : []),
      ];
      rawColors.forEach((c) => {
        if (typeof c === 'string' && c.trim()) {
          dynamicSet.add(c.trim());
        } else if (c && typeof c === 'object' && 'name' in c && typeof (c as { name: string }).name === 'string') {
          dynamicSet.add((c as { name: string }).name.trim());
        }
      });
    });
    return Array.from(dynamicSet);
  }, [allProducts]);

  // Filter products - memoized
  const filteredProducts = useMemo(() => {
    return allProducts.filter((p) => {
      // 1. Matches Category (strictly based on route categorySlug, NOT a filter state)
      const productCatSlug = typeof p.category === 'object' && p.category !== null
        ? (p.category as { slug?: string }).slug
        : String(p.category || '');
      const pCatId = p.categoryId || p.category_id;

      const matchesCategory =
        categorySlug === 'hepsi' ||
        categorySlug === 'all' ||
        productCatSlug === categorySlug ||
        pCatId === categorySlug ||
        (currentCategory && (pCatId === currentCategory.id || productCatSlug === currentCategory.slug));

      // 2. Matches search query
      const pName = searchFold(p.name);
      const pDesc = searchFold(p.description);
      const pMat = searchFold(p.material);

      const matchesSearch =
        !effectiveSearch ||
        pName.includes(effectiveSearch) ||
        pDesc.includes(effectiveSearch) ||
        pMat.includes(effectiveSearch);

      // 3. Price bounds
      const pPriceNum = typeof p.price === 'number' ? p.price : parseFloat(String(p.price || 0));
      const matchesMin = appliedMinPrice === '' || pPriceNum >= Number(appliedMinPrice);
      const matchesMax = appliedMaxPrice === '' || pPriceNum <= Number(appliedMaxPrice);

      // 4. Material filter (Keyword group matching)
      const matchesMaterial =
        selectedMaterials.length === 0 ||
        selectedMaterials.some((sel) => {
          const group = MATERIAL_GROUPS.find((g) => g.label === sel);
          if (!group) return pMat.includes(sel.toLowerCase());
          return group.keywords.some((kw) => pMat.includes(kw));
        });

      // 5. Color filter safely extracted
      const rawColorList = [
        ...(Array.isArray(p.colors) ? p.colors : []),
        ...(Array.isArray(p.colorOptions) ? p.colorOptions : []),
        ...(p.color ? [p.color] : []),
      ];
      const pColors: string[] = rawColorList
        .map((c) => {
          if (typeof c === 'string') return c.toLowerCase();
          if (c && typeof c === 'object' && 'name' in c && typeof (c as { name: unknown }).name === 'string') {
            return (c as { name: string }).name.toLowerCase();
          }
          return '';
        })
        .filter((c) => c.length > 0);

      const matchesColor =
        selectedColors.length === 0 ||
        selectedColors.some((sc) => {
          if (typeof sc !== 'string') return false;
          const scLower = sc.toLowerCase();
          return pColors.some((pc) => pc.includes(scLower) || scLower.includes(pc));
        });

      // 6. Width filter
      const width = p.widthCm || 0;
      let matchesWidth = true;
      if (selectedWidthRange === 'compact') {
        matchesWidth = width > 0 && width < 150;
      } else if (selectedWidthRange === 'medium') {
        matchesWidth = width >= 150 && width <= 210;
      } else if (selectedWidthRange === 'large') {
        matchesWidth = width > 210;
      }

      // 7. Stock filter
      const matchesStock = !inStockOnly || p.inStock;

      return (
        matchesCategory &&
        matchesSearch &&
        matchesMin &&
        matchesMax &&
        matchesMaterial &&
        matchesColor &&
        matchesWidth &&
        matchesStock
      );
    });
  }, [
    allProducts,
    categorySlug,
    currentCategory,
    effectiveSearch,
    appliedMinPrice,
    appliedMaxPrice,
    selectedMaterials,
    selectedColors,
    selectedWidthRange,
    inStockOnly
  ]);

  // Sort products - memoized
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '', 'tr');
      if (sortBy === 'name-desc') return (b.name || '').localeCompare(a.name || '', 'tr');
      if (sortBy === 'popular') return (b.salesCount || 0) - (a.salesCount || 0);
      return 0;
    });
  }, [filteredProducts, sortBy]);

  // Pagination
  const totalItems = sortedProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = useMemo(() => {
    return sortedProducts.slice(indexOfFirstItem, indexOfLastItem);
  }, [sortedProducts, indexOfFirstItem, indexOfLastItem]);

  // Filter Actions
  const handlePriceFilterSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateFilters({
      minPrice: minPriceInput !== '' ? minPriceInput : null,
      maxPrice: maxPriceInput !== '' ? maxPriceInput : null,
    });
  };

  const handleQuickPrice = (min: number | '', max: number | '') => {
    setMinPriceInput(min);
    setMaxPriceInput(max);
    updateFilters({
      minPrice: min !== '' ? min : null,
      maxPrice: max !== '' ? max : null,
    });
  };

  const toggleMaterial = (mat: string) => {
    const newMaterials = selectedMaterials.includes(mat)
      ? selectedMaterials.filter((m) => m !== mat)
      : [...selectedMaterials, mat];
    updateFilters({
      material: newMaterials.length > 0 ? newMaterials.join(',') : null,
    });
  };

  const toggleColor = (color: string) => {
    const newColors = selectedColors.includes(color)
      ? selectedColors.filter((c) => c !== color)
      : [...selectedColors, color];
    updateFilters({
      color: newColors.length > 0 ? newColors.join(',') : null,
    });
  };

  const handleResetFilters = () => {
    setMinPriceInput('');
    setMaxPriceInput('');
    const basePath = pathname === '/' ? `/kategori/${categorySlug}` : pathname;
    router.push(basePath, { scroll: false });
  };

  // True ONLY when actual filters are applied (Category is the route, never counted as a filter)
  const hasActiveFilters = 
    appliedMinPrice !== '' || 
    appliedMaxPrice !== '' || 
    selectedMaterials.length > 0 || 
    selectedColors.length > 0 || 
    selectedWidthRange !== 'all' || 
    inStockOnly ||
    Boolean(effectiveSearch);

  // Filtre blokları: masaüstü kenar çubuğunda ve mobil filtre çekmecesinde aynı bileşenler kullanılır
  const colorFilter = (
    <SearchableCheckList
      title="Renk"
      options={COLORS_LIST}
      selected={selectedColors}
      onToggle={toggleColor}
      onClear={() => updateFilters({ color: null })}
      searchPlaceholder="Renk ara (örn. ceviz)"
    />
  );
  const materialFilter = (
    <SearchableCheckList
      title="Malzeme"
      options={MATERIALS_LIST}
      selected={selectedMaterials}
      onToggle={toggleMaterial}
      onClear={() => updateFilters({ material: null })}
      searchPlaceholder="Malzeme ara"
    />
  );
  const priceFilter = (
          <div className="border-b border-line-strong pb-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-neutral-900">
                Fiyat aralığı (TL)
              </h3>
              {(appliedMinPrice !== '' || appliedMaxPrice !== '') && (
                <button 
                  onClick={() => {
                    setMinPriceInput('');
                    setMaxPriceInput('');
                    updateFilters({ minPrice: null, maxPrice: null });
                  }} 
                  className="text-xs text-wood-dark hover:underline cursor-pointer"
                >
                  Temizle
                </button>
              )}
            </div>
            
            {/* Quick Price Range Pills */}
            <div className="flex flex-wrap gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleQuickPrice('', 15000)}
                className="px-2.5 py-1 rounded-xs bg-paper border border-line-strong text-neutral-700 hover:border-wood cursor-pointer"
              >
                0 - 15.000 TL
              </button>
              <button
                type="button"
                onClick={() => handleQuickPrice(15000, 35000)}
                className="px-2.5 py-1 rounded-xs bg-paper border border-line-strong text-neutral-700 hover:border-wood cursor-pointer"
              >
                15.000 - 35.000 TL
              </button>
              <button
                type="button"
                onClick={() => handleQuickPrice(35000, '')}
                className="px-2.5 py-1 rounded-xs bg-paper border border-line-strong text-neutral-700 hover:border-wood cursor-pointer"
              >
                35.000 TL +
              </button>
            </div>

            <form onSubmit={handlePriceFilterSubmit} className="space-y-2 pt-1">
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="En az"
                  value={minPriceInput}
                  onChange={(e) => setMinPriceInput(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full text-xs border border-line-strong p-2 rounded-xs focus:ring-1 focus:ring-wood focus:outline-none bg-paper"
                />
                <span className="text-neutral-500">-</span>
                <input
                  type="number"
                  placeholder="En çok"
                  value={maxPriceInput}
                  onChange={(e) => setMaxPriceInput(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full text-xs border border-line-strong p-2 rounded-xs focus:ring-1 focus:ring-wood focus:outline-none bg-paper"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-ink hover:bg-neutral-800 text-white text-sm font-semibold h-9 rounded-xs transition-colors cursor-pointer"
              >
                Fiyatı uygula
              </button>
            </form>
          </div>
  );

  return (
    <div className="w-full bg-paper min-h-screen text-neutral-800">
      
      {/* Breadcrumbs & Header */}
      <div className="bg-white border-b border-line-strong py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-xs text-neutral-500 flex items-center gap-2 mb-1.5">
            <Link href="/anasayfa" className="hover:text-wood transition-colors">Ana Sayfa</Link>
            <span>/</span>
            <span className="text-neutral-800 font-semibold">{categoryName}</span>
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-neutral-900">
                {categoryName}
              </h1>
              <p className="text-xs text-neutral-500 mt-0.5">Aynı gün kargo · 1.000 TL üzeri ücretsiz kargo · 14 gün iade</p>
            </div>
          </div>

          {/* Hiyerarşik Alt Kategori Çipleri (Varsa) */}
          {currentSubcategories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-line mt-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 mr-1">
                Alt Kategoriler:
              </span>
              {currentSubcategories.map((sub) => {
                const isSubActive = categorySlug === sub.slug || categorySlug === sub.id;
                return (
                  <Link
                    key={sub.id}
                    href={`/kategori/${sub.slug}`}
                    className={`px-3 py-1 text-xs rounded-full font-semibold transition-all ${
                      isSubActive
                        ? 'bg-brand text-ink'
                        : 'bg-neutral-100 hover:bg-paper text-neutral-700 hover:text-wood border border-line'
                    }`}
                  >
                    ↳ {sub.name}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Left Filters + Right Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* DESKTOP SIDEBAR FILTER PANEL */}
        <aside className="hidden lg:block lg:col-span-1 bg-white p-5 rounded-xs border border-line-strong space-y-6 h-fit">
          
          <div className="flex items-center justify-between border-b border-line-strong pb-4">
            <span className="text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
              <Filter className="h-4 w-4 text-wood" />
              Filtreler
            </span>
            {hasActiveFilters && (
              <button 
                onClick={handleResetFilters}
                className="text-xs text-wood font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Filtreleri Temizle</span>
              </button>
            )}
          </div>

          {/* 1. Category Navigation (URL-Based Navigation, NOT a local filter) */}
          <div className="border-b border-line-strong pb-5">
            <h3 className="text-xs font-bold text-neutral-900 mb-3">
              Kategoriler
            </h3>
            <div className="space-y-1.5 text-xs">
              <Link
                href="/kategori"
                className={`w-full text-left py-1.5 px-2.5 rounded-xs transition-colors flex items-center justify-between cursor-pointer ${
                  categorySlug === 'hepsi' || categorySlug === 'all'
                    ? 'bg-brand text-ink font-bold'
                    : 'text-neutral-700 hover:bg-paper'
                }`}
              >
                <span>Tüm Kategoriler</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
              {rootCategories.map((rootCat) => {
                const isSelected = categorySlug === rootCat.slug || categorySlug === rootCat.id;
                const children = sortedCategoryList.filter((c) => c.parentId === rootCat.id);
                const hasSelectedChild = children.some((c) => categorySlug === c.slug || categorySlug === c.id);

                return (
                  <div key={rootCat.id} className="space-y-0.5">
                    <Link
                      href={`/kategori/${rootCat.slug}`}
                      className={`w-full text-left py-1.5 px-2.5 rounded-xs transition-colors flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-brand text-ink font-bold'
                          : hasSelectedChild
                          ? 'text-wood font-semibold bg-paper'
                          : 'text-neutral-700 hover:bg-paper'
                      }`}
                    >
                      <span>{rootCat.name}</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>

                    {children.length > 0 && (
                      <div className="pl-4 space-y-0.5 border-l border-line-strong ml-2 py-0.5">
                        {children.map((subCat) => {
                          const isSubSelected = categorySlug === subCat.slug || categorySlug === subCat.id;
                          return (
                            <Link
                              key={subCat.id}
                              href={`/kategori/${subCat.slug}`}
                              className={`w-full text-left py-1 px-2 rounded-xs transition-colors flex items-center justify-between text-xs cursor-pointer ${
                                isSubSelected
                                  ? 'bg-brand text-ink font-bold'
                                  : 'text-neutral-600 hover:text-wood hover:bg-paper'
                              }`}
                            >
                              <span>↳ {subCat.name}</span>
                              <ChevronRight className="h-3 w-3" />
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Renk: aranabilir, kaydırılabilir liste */}
          {colorFilter}

          {/* 3. Width Filter (URL Based) */}
          <div className="border-b border-line-strong pb-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-neutral-900">
                Genişlik Ölçüsü
              </h3>
              {selectedWidthRange !== 'all' && (
                <button 
                  onClick={() => updateFilters({ width: null })} 
                  className="text-xs text-wood-dark hover:underline cursor-pointer"
                >
                  Temizle
                </button>
              )}
            </div>
            <div className="space-y-1.5 text-xs">
              {[
                { id: 'all', label: 'Tüm Ölçüler' },
                { id: 'compact', label: 'Kompakt (< 150 cm)' },
                { id: 'medium', label: 'Standart (150 - 210 cm)' },
                { id: 'large', label: 'Geniş / Büyük (> 210 cm)' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => updateFilters({ width: opt.id === 'all' ? null : opt.id })}
                  className={`w-full text-left py-1.5 px-2 rounded-xs flex items-center justify-between transition-colors cursor-pointer ${
                    selectedWidthRange === opt.id ? 'bg-paper border border-wood font-bold text-wood' : 'hover:bg-paper text-neutral-700'
                  }`}
                >
                  <span>{opt.label}</span>
                  {selectedWidthRange === opt.id && <Check className="h-3.5 w-3.5 text-wood" />}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Fiyat aralığı */}
          {priceFilter}

          {/* 5. Malzeme: aranabilir liste */}
          {materialFilter}

          {/* 6. Stock Toggle (URL Based) */}
          <div>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">Sadece Stoktakiler</span>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={() => updateFilters({ stock: !inStockOnly ? 'true' : null })}
                className="h-4 w-4 accent-wood rounded-xs cursor-pointer"
              />
            </label>
          </div>

        </aside>

        {/* ---------------------------------------------------- */}
        {/* RIGHT PRODUCTS & ACTIVE FILTER BAR                    */}
        {/* ---------------------------------------------------- */}
        <main className="col-span-1 lg:col-span-3 space-y-6">
          
          {/* Mobile Filter & Quick Sort Bar */}
          <div className="lg:hidden flex items-center justify-between gap-2.5 bg-white p-3 rounded-xs border border-line-strong">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-paper border border-line-strong rounded-xs text-xs font-bold text-neutral-800 hover:bg-paper transition-colors cursor-pointer"
            >
              <Filter className="h-4 w-4 text-wood" />
              <span>Filtrele {hasActiveFilters ? `(Aktif)` : ''}</span>
            </button>
            <div className="flex-1">
              <select
                value={sortBy}
                onChange={(e) => updateFilters({ sort: e.target.value === 'default' ? null : e.target.value })}
                className="w-full text-xs border border-line-strong py-2 px-2 rounded-xs bg-white font-semibold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-wood cursor-pointer"
              >
                <option value="default">Önerilen Sıralama</option>
                <option value="price-asc">Fiyat: Artan</option>
                <option value="price-desc">Fiyat: Azalan</option>
                <option value="name-asc">İsim: A'dan Z'ye</option>
                <option value="name-desc">İsim: Z'den A'ya</option>
                <option value="popular">En Çok Satanlar</option>
              </select>
            </div>
          </div>

          {/* Mobile Slide-Over Filter Drawer */}
          {isMobileFilterOpen && (
            <div className="fixed inset-0 z-50 flex lg:hidden">
              <div 
                className="fixed inset-0 bg-neutral-950/60 transition-opacity animate-fade-in"
                onClick={() => setIsMobileFilterOpen(false)}
              />
              <div className="relative w-5/6 max-w-sm bg-white h-full shadow-2xl z-10 flex flex-col justify-between p-5 overflow-y-auto animate-slide-in">
                <div className="flex items-center justify-between border-b border-line pb-3 mb-4">
                  <span className="font-bold text-sm text-neutral-900 uppercase tracking-wider">Filtreler</span>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    aria-label="Filtreleri kapat"
                    className="h-10 w-10 -mr-2 flex items-center justify-center text-neutral-500 hover:text-ink cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-6 flex-1 overflow-y-auto pr-1 text-xs">
                  {/* Category Navigation (URL Based) */}
                  <div className="border-b border-line-strong pb-4">
                    <h3 className="font-bold text-neutral-900 mb-2">Kategoriler</h3>
                    <div className="space-y-1">
                      <Link
                        href="/kategori"
                        onClick={() => setIsMobileFilterOpen(false)}
                        className={`w-full text-left py-1.5 px-2 rounded transition-colors flex items-center justify-between text-xs ${
                          categorySlug === 'hepsi' || categorySlug === 'all' ? 'bg-brand text-ink font-bold' : 'text-neutral-700'
                        }`}
                      >
                        <span>Tüm Kategoriler</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                      {rootCategories.map((rootCat) => {
                        const isSelected = categorySlug === rootCat.slug || categorySlug === rootCat.id;
                        const children = sortedCategoryList.filter((c) => c.parentId === rootCat.id);
                        const hasSelectedChild = children.some((c) => categorySlug === c.slug || categorySlug === c.id);

                        return (
                          <div key={rootCat.id} className="space-y-0.5">
                            <Link
                              key={rootCat.id}
                              href={`/kategori/${rootCat.slug}`}
                              onClick={() => setIsMobileFilterOpen(false)}
                              className={`w-full text-left py-1.5 px-2 rounded transition-colors flex items-center justify-between text-xs ${
                                isSelected 
                                  ? 'bg-brand text-ink font-bold' 
                                  : hasSelectedChild
                                  ? 'text-wood font-semibold bg-paper'
                                  : 'text-neutral-700'
                              }`}
                            >
                              <span>{rootCat.name}</span>
                              <ChevronRight className="h-3.5 w-3.5" />
                            </Link>

                            {children.length > 0 && (
                              <div className="pl-4 space-y-0.5 border-l border-line-strong ml-2 py-0.5">
                                {children.map((subCat) => {
                                  const isSubSelected = categorySlug === subCat.slug || categorySlug === subCat.id;
                                  return (
                                    <Link
                                      key={subCat.id}
                                      href={`/kategori/${subCat.slug}`}
                                      onClick={() => setIsMobileFilterOpen(false)}
                                      className={`w-full text-left py-1 px-2 rounded transition-colors flex items-center justify-between text-xs ${
                                        isSubSelected
                                          ? 'bg-brand text-ink font-bold'
                                          : 'text-neutral-600 hover:text-wood'
                                      }`}
                                    >
                                      <span>↳ {subCat.name}</span>
                                      <ChevronRight className="h-3 w-3" />
                                    </Link>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Fiyat, renk ve malzeme (masaüstüyle aynı) */}
                  {priceFilter}
                  {colorFilter}
                  {materialFilter}

                  {/* Dimension (Width) Filter */}
                  <div className="border-b border-line-strong pb-4 space-y-2">
                    <h3 className="font-bold text-neutral-900">Genişlik Ölçüsü</h3>
                    <div className="space-y-1">
                      {[
                        { id: 'all', label: 'Tüm Ölçüler' },
                        { id: 'compact', label: 'Kompakt (< 150 cm)' },
                        { id: 'medium', label: 'Standart (150 - 210 cm)' },
                        { id: 'large', label: 'Geniş / Büyük (> 210 cm)' },
                      ].map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            updateFilters({ width: opt.id === 'all' ? null : opt.id });
                            setIsMobileFilterOpen(false);
                          }}
                          className={`w-full text-left py-1.5 px-2 rounded flex items-center justify-between ${
                            selectedWidthRange === opt.id ? 'bg-paper border border-wood font-bold text-wood' : 'text-neutral-700'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {selectedWidthRange === opt.id && <Check className="h-3.5 w-3.5 text-wood" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Stock Toggle */}
                  <div>
                    <label className="flex items-center justify-between cursor-pointer py-1">
                      <span className="font-bold uppercase tracking-wider text-neutral-800">Sadece Stoktakiler</span>
                      <input
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={() => {
                          updateFilters({ stock: !inStockOnly ? 'true' : null });
                        }}
                        className="h-4 w-4 accent-wood rounded"
                      />
                    </label>
                  </div>
                </div>
                <div className="pt-4 border-t border-line mt-4">
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="w-full h-12 bg-brand hover:bg-brand-dark text-ink font-semibold text-sm rounded-xs transition-colors cursor-pointer"
                  >
                    {totalItems} ürünü göster
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Top Sort & Active Filter Bar */}
          <div className="hidden lg:flex bg-white p-4 rounded-xs border border-line-strong items-center justify-between gap-4">
            
            <div className="text-left">
              <span className="text-xs text-neutral-500 block">Sonuçlar</span>
              <p className="text-sm font-bold text-neutral-900 mt-0.5">{totalItems} Ürün Bulundu</p>
            </div>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 whitespace-nowrap">Sıralama:</span>
              <select
                value={sortBy}
                onChange={(e) => updateFilters({ sort: e.target.value === 'default' ? null : e.target.value })}
                className="text-xs border border-line-strong p-2.5 rounded-xs focus:ring-1 focus:ring-wood focus:outline-none bg-white font-semibold text-neutral-800 cursor-pointer"
              >
                <option value="default">Önerilen Sıralama</option>
                <option value="price-asc">Fiyata Göre: Artan</option>
                <option value="price-desc">Fiyata Göre: Azalan</option>
                <option value="name-asc">İsim: A'dan Z'ye</option>
                <option value="name-desc">İsim: Z'den A'ya</option>
                <option value="popular">En Çok Satanlar</option>
              </select>
            </div>

          </div>

          {/* Active Filter Pills Bar (Category is NEVER a filter pill) */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 bg-paper p-3 rounded-xs border border-line-strong">
              <span className="text-xs font-bold text-neutral-500 uppercase mr-1">Aktif Filtreler:</span>

              {/* Price Range Pill */}
              {(appliedMinPrice !== '' || appliedMaxPrice !== '') && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-wood text-wood-dark px-2.5 py-1 rounded-xs">
                  <span>{appliedMinPrice || 0} TL - {appliedMaxPrice || '∞'} TL</span>
                  <button
                    onClick={() => {
                      setMinPriceInput('');
                      setMaxPriceInput('');
                      updateFilters({ minPrice: null, maxPrice: null });
                    }}
                    className="hover:text-signal cursor-pointer"
                    title="Fiyat filtresini kaldır"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {/* Color Pills */}
              {selectedColors.map(col => (
                <span key={col} className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-line text-wood-dark px-2.5 py-1 rounded-xs">
                  <span>Renk: {col}</span>
                  <button
                    onClick={() => toggleColor(col)}
                    className="hover:text-signal cursor-pointer"
                    title={`${col} filtresini kaldır`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}

              {/* Width Pill */}
              {selectedWidthRange !== 'all' && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-line text-wood-dark px-2.5 py-1 rounded-xs">
                  <span>Genişlik: {selectedWidthRange === 'compact' ? '< 150 cm' : selectedWidthRange === 'medium' ? '150-210 cm' : '> 210 cm'}</span>
                  <button
                    onClick={() => updateFilters({ width: null })}
                    className="hover:text-signal cursor-pointer"
                    title="Genişlik filtresini kaldır"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {/* Material Pills */}
              {selectedMaterials.map(mat => (
                <span key={mat} className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-wood text-wood-dark px-2.5 py-1 rounded-xs">
                  <span>{mat}</span>
                  <button
                    onClick={() => toggleMaterial(mat)}
                    className="hover:text-signal cursor-pointer"
                    title={`${mat} filtresini kaldır`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}

              {/* Stock Pill */}
              {inStockOnly && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-wood text-wood-dark px-2.5 py-1 rounded-xs">
                  <span>Sadece Stoktakiler</span>
                  <button
                    onClick={() => updateFilters({ stock: null })}
                    className="hover:text-signal cursor-pointer"
                    title="Stok filtresini kaldır"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {/* Search Pill */}
              {effectiveSearch && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-neutral-400 text-neutral-800 px-2.5 py-1 rounded-xs">
                  <span>Arama: &quot;{searchText}&quot;</span>
                  <button
                    onClick={() => updateFilters({ search: null })}
                    className="hover:text-signal cursor-pointer"
                    title="Arama filtresini kaldır"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {/* Reset All Filters Button */}
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-signal hover:underline ml-auto cursor-pointer"
              >
                Tümünü Temizle
              </button>
            </div>
          )}

          {/* Product Grid */}
          {currentProducts.length === 0 ? (
            <div className="bg-white rounded-xs border border-line-strong p-12 text-center space-y-4">
              <Filter className="h-12 w-12 text-neutral-300 mx-auto" />
              <h3 className="text-base font-semibold text-ink">Bu filtrelere uyan ürün yok</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Filtre parametrelerini değiştirebilir veya temizleyerek tüm ürünleri inceleyebilirsiniz.
              </p>
              <button
                onClick={handleResetFilters}
                className="inline-block bg-ink hover:bg-neutral-800 text-white text-sm font-semibold py-3 px-5 rounded-xs transition-colors cursor-pointer"
              >
                Filtreleri temizle
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentProducts.map((product, idx) => (
                <ProductCard key={product.id} product={product} showWhatsapp priority={idx < 3} />
              ))}
            </div>
          )}

          {/* Pagination (URL Based) */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => updateFilters({ page: page > 1 ? page : null })}
                  className={`w-9 h-9 rounded-xs text-xs font-bold transition-all cursor-pointer ${
                    currentPage === page
                      ? 'bg-brand text-ink'
                      : 'bg-white text-neutral-700 border border-line-strong hover:bg-paper'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}

        </main>

      </div>
    </div>
  );
};

export default CategoryPage;
