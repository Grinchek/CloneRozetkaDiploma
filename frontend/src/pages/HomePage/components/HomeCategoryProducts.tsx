import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import { useAddCartItemMutation } from "../../../features/cart/api/cartApi";
import {
    useGetFavoriteIdsQuery,
    useAddFavoriteMutation,
    useRemoveFavoriteMutation,
} from "../../../features/favorites/api/favoritesApi";
import ProductImage from "../../../features/products/components/ProductImage";
import type { CategoryNode } from "../../../features/categories/utils/buildTree";

const API_BASE = import.meta.env.VITE_API_BASE;

type Product = {
    id: number;
    name: string;
    price: number;
    mainImageUrl?: string | null;
    categoryId: number;
};

function findCategoryNode(categories: CategoryNode[], id: number): CategoryNode | null {
    for (const c of categories) {
        if (c.id === id) return c;
        if (c.children?.length) {
            const found = findCategoryNode(c.children, id);
            if (found) return found;
        }
    }
    return null;
}

function collectCategoryIds(category: CategoryNode, acc: number[] = []): number[] {
    acc.push(category.id);
    for (const child of category.children || []) {
        collectCategoryIds(child, acc);
    }
    return acc;
}

type Props = {
    categoryId: number | null;
    categories: CategoryNode[];
};

export default function HomeCategoryProducts({ categoryId, categories }: Props) {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const [addCartItem] = useAddCartItemMutation();
    const [addFavorite] = useAddFavoriteMutation();
    const [removeFavorite] = useRemoveFavoriteMutation();
    const { data: favoriteIds = [] } = useGetFavoriteIdsQuery(undefined, { skip: !token });
    const [items, setItems] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch(`${API_BASE}/api/products/list`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data: Product[] = await res.json();
                setItems(data);
            } catch (e: unknown) {
                setError(e instanceof Error ? e.message : "Помилка завантаження");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const filtered = useMemo(() => {
        if (!categoryId) return [];
        if (!categories?.length) return items.filter((p) => p.categoryId === categoryId);
        const node = findCategoryNode(categories, categoryId);
        if (!node) return items.filter((p) => p.categoryId === categoryId);
        const allowedIds = collectCategoryIds(node);
        return items.filter((p) => allowedIds.includes(p.categoryId));
    }, [items, categoryId, categories]);

    const handleAddToCart = (p: Product) => {
        addCartItem({ productId: p.id, quantity: 1 });
    };

    const handleToggleFavorite = (e: React.MouseEvent, productId: number) => {
        e.preventDefault();
        if (!token) return;
        if (favoriteIds.includes(productId)) removeFavorite(productId);
        else addFavorite(productId);
    };

    if (!categoryId) {
        return (
            <div id="products-section" className="mx-auto max-w-7xl px-6 py-12 scroll-mt-8">
                <p className="text-gray-500 text-center py-12">Оберіть категорію вище</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div id="products-section" className="mx-auto max-w-7xl px-6 py-12 scroll-mt-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-80" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div id="products-section" className="mx-auto max-w-7xl px-6 py-12 scroll-mt-8">
                <p className="text-red-600 text-center py-12">Помилка: {error}</p>
            </div>
        );
    }

    if (filtered.length === 0) {
        return (
            <div id="products-section" className="mx-auto max-w-7xl px-6 py-12 scroll-mt-8">
                <p className="text-gray-500 text-center py-12">У цій категорії товарів немає</p>
            </div>
        );
    }

    return (
        <div id="products-section" className="mx-auto max-w-7xl px-6 py-12 scroll-mt-8">
            <div className="overflow-x-auto overflow-y-visible pb-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 min-w-0 items-stretch">
                    {filtered.map((p) => (
                        <article
                            key={p.id}
                            className="group flex h-full flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300"
                        >
                            <Link to={`/product/${p.id}`} className="relative block aspect-square w-full bg-gray-50 flex-shrink-0 overflow-hidden">
                                <ProductImage
                                    mainImageUrl={p.mainImageUrl}
                                    alt={p.name}
                                    className="w-full h-full object-contain"
                                    loading="lazy"
                                    fallback={
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-4xl">
                                            📦
                                        </div>
                                    }
                                />
                                <button
                                    type="button"
                                    onClick={(e) => handleToggleFavorite(e, p.id)}
                                    className={`absolute top-2 left-2 p-2 rounded-full bg-white/90 shadow-sm transition-colors ${
                                        favoriteIds.includes(p.id)
                                            ? "text-red-500 fill-red-500 hover:bg-red-50"
                                            : "text-gray-500 hover:text-red-500 hover:bg-white"
                                    }`}
                                    aria-label={favoriteIds.includes(p.id) ? "Прибрати з обраного" : "В обране"}
                                >
                                    <Heart size={18} strokeWidth={2} />
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleAddToCart(p);
                                    }}
                                    className="absolute top-2 right-2 p-2 rounded-full bg-white/90 shadow-sm text-gray-500 hover:text-[#F5A623] hover:bg-white transition-colors"
                                    aria-label="В кошик"
                                >
                                    <ShoppingCart size={18} strokeWidth={2} />
                                </button>
                            </Link>

                            <div className="flex min-h-0 flex-1 flex-col p-3 md:p-4">
                                <span className="inline-block w-fit text-[10px] font-bold uppercase tracking-wide bg-[#F5A623] text-white px-2 py-0.5 rounded mb-2 shrink-0">
                                    БК Доставка
                                </span>
                                <div className="flex items-baseline gap-2 mb-1 shrink-0">
                                    <span className="text-lg font-bold text-[#F5A623]">
                                        {p.price.toLocaleString("uk-UA")} ₴
                                    </span>
                                    <span className="text-sm text-gray-400 line-through">
                                        {Math.round(p.price * 1.2).toLocaleString("uk-UA")} ₴
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-500 mb-2 shrink-0">
                                    <span className="text-amber-400">★★★★★</span>
                                    <span className="text-xs">(—)</span>
                                </div>
                                <Link
                                    to={`/product/${p.id}`}
                                    className="mt-auto min-h-[2.5rem] text-[13px] font-medium text-gray-800 hover:text-[#F5A623] line-clamp-2 leading-snug"
                                >
                                    {p.name}
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </div>
    );
}
