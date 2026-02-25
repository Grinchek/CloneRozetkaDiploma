import React, { useCallback, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { LayoutGrid, List } from "lucide-react";
import { useGetCategoriesQuery } from "../../features/categories/api/categoryApi";
import { buildCategoryTree } from "../../features/categories/utils/buildTree";
import type { CategoryNode } from "../../features/categories/utils/buildTree";
import CatalogFilters from "./components/CatalogFilters";
import ProductGrid, { type DisplayMode, type SortOrder } from "../../features/products/components/ProductGrid";
import "../../styles/catalog.css";

function findCategoryPath(nodes: CategoryNode[], targetId: number, path: CategoryNode[] = []): CategoryNode[] | null {
    for (const node of nodes) {
        const next = [...path, node];
        if (node.id === targetId) return next;
        if (node.children?.length) {
            const found = findCategoryPath(node.children, targetId, next);
            if (found) return found;
        }
    }
    return null;
}

export default function CatalogPage() {
    const { id } = useParams<{ id: string }>();
    const categoryId = id != null && /^\d+$/.test(id) ? parseInt(id, 10) : null;
    const { data: categoriesFlat } = useGetCategoriesQuery();
    const categoryTree = useMemo(() => {
        if (!categoriesFlat?.length) return [];
        return buildCategoryTree(categoriesFlat);
    }, [categoriesFlat]);

    const categoryPath = useMemo(() => {
        if (categoryId == null || !categoryTree.length) return null;
        return findCategoryPath(categoryTree, categoryId);
    }, [categoryTree, categoryId]);

    const categoryName = categoryPath?.length ? categoryPath[categoryPath.length - 1].name : "Каталог";

    const [searchQuery, setSearchQuery] = useState("");
    const [priceFrom, setPriceFrom] = useState("");
    const [priceTo, setPriceTo] = useState("");
    const [sortOrder, setSortOrder] = useState<SortOrder>("default");
    const [displayMode, setDisplayMode] = useState<DisplayMode>("grid");
    const [filteredCount, setFilteredCount] = useState<number | null>(null);

    const priceMin = useMemo(() => {
        const n = parseFloat(priceFrom);
        return priceFrom === "" || Number.isNaN(n) ? undefined : n;
    }, [priceFrom]);
    const priceMax = useMemo(() => {
        const n = parseFloat(priceTo);
        return priceTo === "" || Number.isNaN(n) ? undefined : n;
    }, [priceTo]);

    const onFilteredCountChange = useCallback((count: number) => setFilteredCount(count), []);

    return (
        <div className="catalog-page bg-[#F8F8F8] min-h-screen">
            <div className="mx-auto max-w-7xl px-6 py-6">
                {/* Breadcrumb */}
                <nav className="text-[13px] text-gray-500 mb-4" aria-label="Breadcrumb">
                    <ol className="flex items-center gap-2 flex-wrap">
                        <li>
                            <Link to="/" className="hover:text-[#F5A623] transition-colors">
                                Головна
                            </Link>
                        </li>
                        {categoryPath?.map((cat, idx) => (
                            <li key={cat.id} className="flex items-center gap-2">
                                <span className="text-gray-300">/</span>
                                {idx === categoryPath.length - 1 ? (
                                    <span className="text-gray-800 font-medium">{cat.name}</span>
                                ) : (
                                    <Link to={`/category/${cat.id}`} className="hover:text-[#F5A623] transition-colors">
                                        {cat.name}
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ol>
                </nav>

                {/* Пошук по назві */}
                <div className="mb-4">
                    <input
                        type="search"
                        placeholder="Пошук по назві товару..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full max-w-md rounded-xl border border-gray-200 bg-white px-4 py-3 text-[14px] text-gray-800 placeholder-gray-400 outline-none focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623]"
                        aria-label="Пошук по назві"
                    />
                </div>

                {/* Title + count + sort + display mode */}
                <div className="flex flex-wrap items-baseline justify-between gap-4 mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-[#404236]">{categoryName}</h1>
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-[14px] text-gray-500 catalog-product-count">
                            {filteredCount !== null ? `${filteredCount} товарів` : "— товарів"}
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="text-[12px] text-gray-500 sr-only md:not-sr-only">Відображення:</span>
                            <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-white">
                                <button
                                    type="button"
                                    onClick={() => setDisplayMode("grid")}
                                    className={`p-2.5 transition-colors ${displayMode === "grid" ? "bg-[#F5A623] text-white" : "text-gray-500 hover:bg-gray-100"}`}
                                    aria-label="Сітка"
                                    title="Сітка"
                                >
                                    <LayoutGrid size={18} strokeWidth={2} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDisplayMode("list")}
                                    className={`p-2.5 transition-colors ${displayMode === "list" ? "bg-[#F5A623] text-white" : "text-gray-500 hover:bg-gray-100"}`}
                                    aria-label="Список"
                                    title="Список"
                                >
                                    <List size={18} strokeWidth={2} />
                                </button>
                            </div>
                        </div>
                        <div className="relative">
                            <select
                                className="catalog-sort appearance-none rounded-lg border border-gray-200 bg-white pl-4 pr-10 py-2.5 text-[13px] text-gray-700 outline-none focus:border-[#F5A623] cursor-pointer"
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                                aria-label="Сортування"
                            >
                                <option value="default">За замовчуванням</option>
                                <option value="price_asc">Від дешевих</option>
                                <option value="price_desc">Від дорогих</option>
                                <option value="name">За назвою</option>
                            </select>
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                ▼
                            </span>
                        </div>
                    </div>
                </div>

                {/* Фільтр по ціні + сітка товарів */}
                <div className="flex gap-6 lg:gap-8">
                    <div className="w-64 shrink-0 hidden md:block">
                        <CatalogFilters
                            priceFrom={priceFrom}
                            priceTo={priceTo}
                            onPriceFromChange={setPriceFrom}
                            onPriceToChange={setPriceTo}
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <ProductGrid
                            categoryId={categoryId}
                            categories={categoryTree}
                            hideHeader
                            searchQuery={searchQuery}
                            priceMin={priceMin}
                            priceMax={priceMax}
                            sortOrder={sortOrder}
                            displayMode={displayMode}
                            onFilteredCountChange={onFilteredCountChange}
                        />
                        <div className="mt-12 text-center">
                            <button
                                type="button"
                                className="catalog-load-more rounded-xl bg-[#404236] text-white px-12 py-4 font-bold uppercase tracking-widest text-sm hover:bg-[#2d2e24] transition-colors"
                            >
                            Дивитись ще
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
