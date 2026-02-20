import { useEffect, useMemo, useState } from "react";
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

const HomeMainBanner: React.FC<Props> = ({ categoryId, categories }) => {
    const [items, setItems] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_BASE}/api/products/list`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data: Product[] = await res.json();
                setItems(data);
            } catch {
                setItems([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const firstProductImage = useMemo(() => {
        if (!categoryId || items.length === 0) return null;
        let first: Product | null = null;
        if (!categories?.length) {
            first = items.find((p) => p.categoryId === categoryId) ?? null;
        } else {
            const node = findCategoryNode(categories, categoryId);
            if (!node) {
                first = items.find((p) => p.categoryId === categoryId) ?? null;
            } else {
                const allowedIds = collectCategoryIds(node);
                first = items.find((p) => allowedIds.includes(p.categoryId)) ?? null;
            }
        }
        return first?.mainImageUrl ?? null;
    }, [items, categoryId, categories]);

    return (
        <section className="relative w-full h-full flex items-center justify-center bg-white overflow-hidden rounded-[32px]">
            {loading ? (
                <div className="w-full h-full bg-gray-100 animate-pulse" />
            ) : firstProductImage ? (
                <ProductImage
                    mainImageUrl={firstProductImage}
                    alt=""
                    className="w-full h-full object-contain"
                    fallback={<div className="w-full h-full bg-gray-50" />}
                />
            ) : (
                <div className="w-full h-full bg-gray-50" />
            )}
        </section>
    );
};

export default HomeMainBanner;
