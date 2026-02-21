import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../../../store/cartSlice";
import type { CategoryNode } from "../../../features/categories/utils/buildTree";
import ProductImage from "../../../features/products/components/ProductImage";

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

export default function FeaturedFirstProduct({ categoryId, categories }: Props) {
    const dispatch = useDispatch();
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

    const firstProduct = useMemo(() => {
        if (!categoryId) return null;
        if (!categories?.length) {
            return items.find((p) => p.categoryId === categoryId) ?? null;
        }
        const node = findCategoryNode(categories, categoryId);
        if (!node) return items.find((p) => p.categoryId === categoryId) ?? null;
        const allowedIds = collectCategoryIds(node);
        return items.find((p) => allowedIds.includes(p.categoryId)) ?? null;
    }, [items, categoryId, categories]);

    const handleAddToCart = (p: Product) => {
        dispatch(addToCart({
            id: p.id,
            name: p.name,
            price: p.price,
            mainImageUrl: p.mainImageUrl,
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center rounded-2xl bg-gray-50 py-16 text-gray-500">
                Завантаження…
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-2xl bg-red-50 py-8 text-center text-red-600">
                Помилка: {error}
            </div>
        );
    }

    if (!categoryId) {
        return (
            <div className="flex items-center justify-center rounded-2xl bg-gray-50 py-16 text-gray-500">
                Оберіть категорію зліва
            </div>
        );
    }

    if (!firstProduct) {
        return (
            <div className="flex items-center justify-center rounded-2xl bg-gray-50 py-16 text-gray-600">
                У цій категорії товарів немає
            </div>
        );
    }

    return (
        <article className="group product-card bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-lg flex flex-col max-w-sm mx-auto">
            <Link to={`/product/${firstProduct.id}`} className="relative aspect-square overflow-hidden bg-gray-50 flex-shrink-0 block">
                <ProductImage
                    mainImageUrl={firstProduct.mainImageUrl}
                    alt={firstProduct.name}
                    className="h-full w-full object-contain"
                    loading="lazy"
                    fallback={<div className="flex h-full items-center justify-center text-gray-300 text-sm italic">Немає зображення</div>}
                />
            </Link>
            <div className="flex flex-col flex-1 p-4">
                <Link
                    to={`/product/${firstProduct.id}`}
                    className="text-[14px] font-medium text-gray-800 hover:text-[#F5A623] transition-colors line-clamp-2 leading-tight mb-2"
                >
                    {firstProduct.name}
                </Link>
                <div className="mt-auto flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-lg font-bold text-[#404236]">
                        {firstProduct.price.toLocaleString("uk-UA")} ₴
                    </span>
                    <button
                        type="button"
                        onClick={() => handleAddToCart(firstProduct)}
                        className="rounded-xl bg-[#404236] text-white px-4 py-2 text-sm font-medium hover:bg-[#F5A623] transition-colors shrink-0"
                    >
                        Купити
                    </button>
                </div>
            </div>
        </article>
    );
}
