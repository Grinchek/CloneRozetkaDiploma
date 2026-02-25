import { useParams, Link } from "react-router-dom";
import { useGetProductByIdQuery } from "../api/productApi";
import { useState, useMemo } from "react";
import { Heart } from "lucide-react";
import { useAddCartItemMutation } from "../../../features/cart/api/cartApi";
import {
    useGetFavoriteIdsQuery,
    useAddFavoriteMutation,
    useRemoveFavoriteMutation,
} from "../../../features/favorites/api/favoritesApi";
import {
    useGetCompareIdsQuery,
    useAddToCompareMutation,
    useRemoveFromCompareMutation,
} from "../../../features/compare/api/compareApi";
import {
    useGetProductAttributesQuery,
    useGetCategoryAttributesQuery,
    type CategoryAttributeItemDto,
    type ProductAttributeValueDto,
} from "../api/productAttributesApi";

const API_BASE = import.meta.env.VITE_API_BASE;

function formatAttributeDisplayValue(
    pav: ProductAttributeValueDto,
    attr: CategoryAttributeItemDto | undefined
): string {
    if (pav.valueString != null && pav.valueString !== "") return pav.valueString;
    if (pav.valueNumber != null) {
        const unit = attr?.unit ? ` ${attr.unit}` : "";
        return `${pav.valueNumber}${unit}`;
    }
    if (pav.valueBool != null) return pav.valueBool ? "Так" : "Ні";
    if (pav.optionId != null && attr?.options?.length) {
        const opt = attr.options.find((o) => o.id === pav.optionId);
        return opt?.value ?? String(pav.optionId);
    }
    return "—";
}

/** Сервер зберігає зображення з префіксом розміру (200_xxx.webp, 800_xxx.webp). */
function buildImageSrc(value?: string | null, size: number = 800): string {
    if (!value) return "/icons/ZORYA-LOGO.svg";
    if (value.startsWith("http")) return value;
    const name = value.startsWith("/") ? value.slice(1) : value;
    const hasSizePrefix = /^\d+_/.test(name);
    const fileName = hasSizePrefix ? name : `${size}_${name}`;
    return `${API_BASE}/Images/${fileName}`;
}

export default function ProductDetails() {
    const { id } = useParams<{ id: string }>();
    const productId = Number(id);
    const { data: product, isLoading, error } = useGetProductByIdQuery(productId);
    const { data: productAttributes = [] } = useGetProductAttributesQuery(productId, {
        skip: !product || productId <= 0,
    });
    const { data: categoryAttributes = [] } = useGetCategoryAttributesQuery(product?.categoryId ?? 0, {
        skip: !product || (product?.categoryId ?? 0) <= 0,
    });
    const attributeDisplayList = useMemo(() => {
        const byId = new Map(categoryAttributes.map((a) => [a.attributeId, a]));
        return productAttributes
            .map((pav) => {
                const attr = byId.get(pav.attributeId);
                const name = attr?.name ?? `Атрибут ${pav.attributeId}`;
                const value = formatAttributeDisplayValue(pav, attr);
                const sortOrder = attr?.sortOrder ?? 999;
                return { attributeId: pav.attributeId, name, value, sortOrder };
            })
            .sort((a, b) => a.sortOrder - b.sortOrder);
    }, [productAttributes, categoryAttributes]);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const [mainImageIdx, setMainImageIdx] = useState(0);
    const [addToCart, { isLoading: isAdding }] = useAddCartItemMutation();
    const [addFavorite] = useAddFavoriteMutation();
    const [removeFavorite] = useRemoveFavoriteMutation();
    const { data: favoriteIds = [] } = useGetFavoriteIdsQuery(undefined, { skip: !token });
    const { data: compareIds = [] } = useGetCompareIdsQuery(undefined, { skip: !token });
    const [addToCompare, { isLoading: isAddingCompare }] = useAddToCompareMutation();
    const [removeFromCompare] = useRemoveFromCompareMutation();
    const [compareMessage, setCompareMessage] = useState<string | null>(null);
    const isInFavorites = productId > 0 && favoriteIds.includes(productId);
    const isInCompare = productId > 0 && compareIds.includes(productId);

    const handleAddToCart = () => {
        if (!product) return;
        addToCart({ productId: product.id, quantity: 1 });
    };

    const handleToggleFavorite = () => {
        if (!token) return;
        if (isInFavorites) removeFavorite(productId);
        else addFavorite(productId);
    };

    const handleToggleCompare = () => {
        if (!token) return;
        setCompareMessage(null);
        if (isInCompare) {
            removeFromCompare(productId);
        } else {
            addToCompare(productId)
                .unwrap()
                .then(() => {
                    setCompareMessage("Додано до порівняння");
                    setTimeout(() => setCompareMessage(null), 3000);
                })
                .catch(() => {
                    setCompareMessage("Максимум 4 товари в порівнянні");
                    setTimeout(() => setCompareMessage(null), 3000);
                });
        }
    };

    if (isLoading) return <div className="p-8 text-center">Завантаження...</div>;
    if (error || !product) return <div className="p-8 text-center text-red-500">Товар не знайдено</div>;

    const images = product.imageUrls?.length
        ? product.imageUrls
        : [];

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4">
                    <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
                        <img
                            src={buildImageSrc(images[mainImageIdx] ?? null, 800)}
                            alt={product.name}
                            className="w-full h-full object-contain"
                        />
                    </div>
                    {images.length > 1 && (
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setMainImageIdx(idx)}
                                    className={`w-20 h-20 border-2 rounded-lg overflow-hidden flex-shrink-0 ${mainImageIdx === idx ? 'border-[#F5A623]' : 'border-gray-200'}`}
                                >
                                    <img src={buildImageSrc(img, 200)} className="w-full h-full object-cover" alt="" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-6">
                    <h1 className="text-3xl font-bold text-[#404236]">{product.name}</h1>

                    <div className="flex items-center gap-4">
                        <span className="text-4xl font-bold text-[#1a1a1a]">
                            {product.price.toLocaleString("uk-UA")} ₴
                        </span>
                        <span className="text-green-600 font-medium">В наявності</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={handleAddToCart}
                            disabled={isAdding}
                            className="bg-[#F5A623] hover:bg-[#e6951d] text-white font-bold py-4 px-8 rounded-full transition-colors text-lg shadow-lg active:scale-95 duration-75 disabled:opacity-70"
                        >
                            {isAdding ? "Додаємо…" : "Купити"}
                        </button>
                        {token ? (
                            <button
                                type="button"
                                onClick={handleToggleFavorite}
                                className={`inline-flex items-center gap-2 rounded-full border-2 px-6 py-4 font-bold text-lg transition-colors ${
                                    isInFavorites
                                        ? "border-red-500 bg-red-50 text-red-600 fill-red-500 hover:bg-red-100"
                                        : "border-gray-300 bg-white text-gray-700 hover:border-[#F5A623] hover:text-[#F5A623]"
                                }`}
                            >
                                <Heart size={22} strokeWidth={2} />
                                {isInFavorites ? "В обраному" : "В обране"}
                            </button>
                        ) : (
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 rounded-full border-2 border-gray-300 bg-white px-6 py-4 font-bold text-lg text-gray-700 hover:border-[#F5A623] hover:text-[#F5A623] transition-colors"
                            >
                                <Heart size={22} strokeWidth={2} />
                                Увійдіть, щоб додати в обране
                            </Link>
                        )}
                        {token && (
                            <>
                                <button
                                    type="button"
                                    onClick={handleToggleCompare}
                                    disabled={isAddingCompare}
                                    className={`inline-flex items-center gap-2 rounded-full border-2 px-6 py-4 font-bold text-lg transition-colors ${
                                        isInCompare
                                            ? "border-[#F5A623] bg-[#F5A623]/10 text-[#F5A623] hover:bg-[#F5A623]/20"
                                            : "border-gray-300 bg-white text-gray-700 hover:border-[#F5A623] hover:text-[#F5A623] disabled:opacity-70"
                                    }`}
                                >
                                    {isInCompare ? "В порівнянні" : "Додати до порівняння"}
                                </button>
                                {compareMessage && (
                                    <span className="text-sm text-[#404236] animate-pulse">{compareMessage}</span>
                                )}
                            </>
                        )}
                    </div>

                    {attributeDisplayList.length > 0 && (
                        <div className="mt-8">
                            <h2 className="text-xl font-semibold mb-3 border-b pb-2">Характеристики</h2>
                            <dl className="space-y-2">
                                {attributeDisplayList.map((item) => (
                                    <div
                                        key={item.attributeId}
                                        className="flex justify-between gap-4 py-2 border-b border-gray-100 last:border-0"
                                    >
                                        <dt className="text-gray-600 font-medium shrink-0">{item.name}</dt>
                                        <dd className="text-[#1a1a1a] text-right">{item.value}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    )}

                    <div className="mt-8">
                        <h2 className="text-xl font-semibold mb-3 border-b pb-2">Опис</h2>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                            {product.description || "Опис для цього товару поки що відсутній."}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <h3 className="text-sm text-gray-400 font-medium uppercase">Доставка</h3>
                            <p className="text-sm font-medium mt-1">Нова Пошта, Самовивіз</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <h3 className="text-sm text-gray-400 font-medium uppercase">Оплата</h3>
                            <p className="text-sm font-medium mt-1">Готівка, Картка, Кредит</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
