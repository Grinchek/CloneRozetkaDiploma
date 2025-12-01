import { useEffect, useMemo, useState } from "react";

import "../../../styles/products.css";
import type { CategoryNode } from "../../categories/utils/buildTree";
const API_BASE = import.meta.env.VITE_API_BASE ?? "https://localhost:5001";
const PAGE_SIZE = 16;

export type ProductGridProps = {
    categoryId?: number | null;
    categories?: CategoryNode[];
};

type Product = {
    id: number;
    name: string;
    price: number;
    mainImageUrl?: string | null;
    categoryId: number;
};

type CategoryTree = {
    id: number;
    parentId: number | null;
    children?: CategoryTree[];
};

const buildProductImageSrc = (value?: string | null): string | null => {
    if (!value) return null;

    if (value.startsWith("http://") || value.startsWith("https://")) {
        return value;
    }

    if (value.startsWith("/")) {
        return `${API_BASE}${value}`;
    }

    return `${API_BASE}/Images/200_${value}`;
};

// ⭐ хелпери для дерева
function findCategoryNode(
    categories: CategoryNode[],
    id: number
): CategoryNode | null {
    for (const c of categories) {
        if (c.id === id) return c;
        if (c.children && c.children.length) {
            const found = findCategoryNode(c.children, id);
            if (found) return found;
        }
    }
    return null;
}

function collectCategoryIds(
    category: CategoryNode,
    acc: number[] = []
): number[] {
    acc.push(category.id);

    if (category.children && category.children.length) {
        for (const child of category.children) {
            collectCategoryIds(child, acc);
        }
    }

    return acc;
}

export default function ProductGrid({ categoryId, categories }: ProductGridProps) {
    const [items, setItems] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await fetch(`${API_BASE}/api/products`);
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }

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

    // при зміні категорії — повертаємося на першу сторінку
    useEffect(() => {
        setPage(1);
    }, [categoryId]);

    const filtered = useMemo(() => {
        if (!categoryId) return items;

        if (!categories || categories.length === 0) {
            // fallback: тільки прямі товари
            return items.filter((p) => p.categoryId === categoryId);
        }

        const root = findCategoryNode(categories, categoryId);

        if (!root) {
            return items.filter((p) => p.categoryId === categoryId);
        }

        const allowedIds = collectCategoryIds(root);

        return items.filter((p) => allowedIds.includes(p.categoryId));
    }, [items, categoryId, categories]);
    // ⭐ додали categories в залежності

    const totalPages = useMemo(
        () => (filtered.length === 0 ? 1 : Math.ceil(filtered.length / PAGE_SIZE)),
        [filtered.length]
    );

    const safePage = Math.min(Math.max(page, 1), totalPages);

    const pageItems = useMemo(() => {
        const start = (safePage - 1) * PAGE_SIZE;
        return filtered.slice(start, start + PAGE_SIZE);
    }, [filtered, safePage]);

    const handlePageChange = (next: number) => {
        if (next < 1 || next > totalPages) return;
        setPage(next);
    };

    if (loading) {
        return (
            <section className="products">
                <div className="products-header">Товари</div>
                <div className="products-muted">Завантаження товарів…</div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="products">
                <div className="products-header">Товари</div>
                <div className="products-error">Помилка: {error}</div>
            </section>
        );
    }

    if (filtered.length === 0) {
        return (
            <section className="products">
                <div className="products-header">Товари</div>
                <div className="products-muted">
                    Для цієї категорії товарів поки немає
                </div>
            </section>
        );
    }

    return (
        <section className="products">
            <div className="products-header">Товари</div>

            <div className="products-grid">
                {pageItems.map((p) => {
                    const imgSrc = buildProductImageSrc(p.mainImageUrl);

                    return (
                        <article key={p.id} className="product-card text-black">
                            <div className="product-card-image-wrap">
                                {imgSrc ? (
                                    <img
                                        src={imgSrc}
                                        alt={p.name}
                                        className="product-card-image"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="product-card-image-fallback">
                                        Без фото
                                    </div>
                                )}
                            </div>

                            <div className="product-card-body">
                                <h3 className="product-card-title text-black" title={p.name}>
                                    {p.name}
                                </h3>

                                <div className="product-card-bottom">
                                    <div className="product-card-price">
                                        {p.price.toLocaleString("uk-UA")} ₴
                                    </div>

                                    <button
                                        type="button"
                                        className="product-card-btn"
                                    >
                                        До товару
                                    </button>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>

            <div className="products-pagination">
                <button
                    type="button"
                    className="products-page-btn"
                    disabled={safePage === 1}
                    onClick={() => handlePageChange(safePage - 1)}
                >
                    ‹
                </button>

                {Array.from({ length: totalPages }, (_, idx) => {
                    const num = idx + 1;
                    return (
                        <button
                            key={num}
                            type="button"
                            className={
                                "products-page-btn" +
                                (num === safePage ? " is-active" : "")
                            }
                            onClick={() => handlePageChange(num)}
                        >
                            {num}
                        </button>
                    );
                })}

                <button
                    type="button"
                    className="products-page-btn"
                    disabled={safePage === totalPages}
                    onClick={() => handlePageChange(safePage + 1)}
                >
                    ›
                </button>
            </div>
        </section>
    );
}
