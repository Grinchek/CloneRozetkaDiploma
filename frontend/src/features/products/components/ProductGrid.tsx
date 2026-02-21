import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAddCartItemMutation } from "../../../features/cart/api/cartApi";
import ProductImage from "./ProductImage";
import "../../../styles/products.css";
import type { CategoryNode } from "../../categories/utils/buildTree";

const API_BASE = import.meta.env.VITE_API_BASE;
const PAGE_SIZE = 16;

export type ProductGridProps = {
    categoryId?: number | null;
    categories?: CategoryNode[];
    /** При true не показує заголовок "Товари" (для блоку на головній) */
    hideHeader?: boolean;
};

type Product = {
    id: number;
    name: string;
    price: number;
    mainImageUrl?: string | null;
    categoryId: number;
};

// ⭐ хелпери для дерева
function findCategoryNode(categories: CategoryNode[], id: number): CategoryNode | null {
    for (const c of categories) {
        if (c.id === id) return c;
        if (c.children && c.children.length) {
            const found = findCategoryNode(c.children, id);
            if (found) return found;
        }
    }
    return null;
}

function collectCategoryIds(category: CategoryNode, acc: number[] = []): number[] {
    acc.push(category.id);
    if (category.children && category.children.length) {
        for (const child of category.children) {
            collectCategoryIds(child, acc);
        }
    }
    return acc;
}

export default function ProductGrid({ categoryId, categories, hideHeader }: ProductGridProps) {
    const [addCartItem] = useAddCartItemMutation();
    const [items, setItems] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);

    const handleAddToCart = (p: Product) => {
        addCartItem({ productId: p.id, quantity: 1 });
    };

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch(`${API_BASE}/api/products/list`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data: Product[] = await res.json();
                setItems(data);
            } catch (e: any) {
                setError(e.message ?? "Помилка завантаження товарів");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    useEffect(() => {
        setPage(1);
    }, [categoryId]);

    const filtered = useMemo(() => {
        if (!categoryId) return items;
        if (!categories || categories.length === 0) return items.filter((p) => p.categoryId === categoryId);
        const root = findCategoryNode(categories, categoryId);
        if (!root) return items.filter((p) => p.categoryId === categoryId);
        const allowedIds = collectCategoryIds(root);
        return items.filter((p) => allowedIds.includes(p.categoryId));
    }, [items, categoryId, categories]);

    const totalPages = useMemo(() => (filtered.length === 0 ? 1 : Math.ceil(filtered.length / PAGE_SIZE)), [filtered.length]);
    const safePage = Math.min(Math.max(page, 1), totalPages);
    const pageItems = useMemo(() => {
        const start = (safePage - 1) * PAGE_SIZE;
        return filtered.slice(start, start + PAGE_SIZE);
    }, [filtered, safePage]);

    const handlePageChange = (next: number) => {
        if (next < 1 || next > totalPages) return;
        setPage(next);
    };

    const headerFragment = !hideHeader && (
        <div className="products-header">Товари</div>
    );

    if (loading) return <section className="products">{headerFragment}<div className="products-muted">Завантаження товарів…</div></section>;
    if (error) return <section className="products">{headerFragment}<div className="products-error">Помилка: {error}</div></section>;
    if (filtered.length === 0) return <section className="products">{headerFragment}<div className="products-muted">Для цієї категорії товарів поки немає</div></section>;

    return (
        <section className="products">
            {headerFragment}
            <div className="products-grid">
                {pageItems.map((p) => (
                        <article key={p.id} className="group product-card bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-lg flex flex-col">
                            <Link to={`/product/${p.id}`} className="relative aspect-square overflow-hidden bg-gray-50 flex-shrink-0">
                                <ProductImage
                                    mainImageUrl={p.mainImageUrl}
                                    alt={p.name}
                                    className="h-full w-full object-contain"
                                    loading="lazy"
                                    fallback={<div className="flex h-full items-center justify-center text-gray-300 text-sm italic">Немає зображення</div>}
                                />
                            </Link>
                            <div className="flex flex-col flex-1 p-4">
                                <Link
                                    to={`/product/${p.id}`}
                                    className="text-[14px] font-medium text-gray-800 hover:text-[#F5A623] transition-colors line-clamp-2 leading-tight mb-2"
                                >
                                    {p.name}
                                </Link>
                                <div className="mt-auto flex items-center justify-between gap-2 flex-wrap">
                                    <span className="text-lg font-bold text-[#404236]">
                                        {p.price.toLocaleString("uk-UA")} ₴
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleAddToCart(p)}
                                        className="rounded-xl bg-[#404236] text-white px-4 py-2 text-sm font-medium hover:bg-[#F5A623] transition-colors shrink-0"
                                    >
                                        Купити
                                    </button>
                                </div>
                            </div>
                        </article>
                ))}
            </div>
            <div className="products-pagination">
                <button type="button" className="products-page-btn" disabled={safePage === 1} onClick={() => handlePageChange(safePage - 1)}>‹</button>
                {Array.from({ length: totalPages }, (_, idx) => {
                    const num = idx + 1;
                    return <button key={num} type="button" className={"products-page-btn" + (num === safePage ? " is-active" : "")} onClick={() => handlePageChange(num)}>{num}</button>;
                })}
                <button type="button" className="products-page-btn" disabled={safePage === totalPages} onClick={() => handlePageChange(safePage + 1)}>›</button>
            </div>
        </section>
    );
}
