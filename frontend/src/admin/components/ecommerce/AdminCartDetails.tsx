import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useGetAdminCartByUserIdQuery } from "../../../features/cart/api/cartApi";
import type { CartItemDto } from "../../../features/cart/api/cartApi";
import { buildProductImageCandidates } from "../../../features/products/utils/productImageUrl";

const PLACEHOLDER_SRC = "/icons/ZORYA-LOGO.svg";
const API_BASE = import.meta.env.VITE_API_BASE;

function CartItemImage({ imageUrl }: { imageUrl: string | null | undefined }) {
    const candidates = buildProductImageCandidates(imageUrl ?? null);
    const [idx, setIdx] = useState(0);
    const src = candidates[idx];
    const fullSrc = src ? (src.startsWith("http") ? src : `${API_BASE}${src.startsWith("/") ? "" : "/"}${src}`) : null;
    if (!fullSrc)
        return (
            <div className="h-12 w-12 shrink-0 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <img src={PLACEHOLDER_SRC} alt="" className="h-6 w-6 opacity-50" />
            </div>
        );
    return (
        <img
            src={fullSrc}
            alt=""
            className="h-12 w-12 shrink-0 object-cover rounded-md bg-gray-100 dark:bg-gray-700"
            onError={() => setIdx((i) => (i + 1 < candidates.length ? i + 1 : i))}
        />
    );
}

export default function AdminCartDetails() {
    const { userId } = useParams<{ userId: string }>();
    const id = userId != null && /^\d+$/.test(userId) ? Number(userId) : null;
    const { data: cart, isLoading, isError, error } = useGetAdminCartByUserIdQuery(id!, { skip: id == null });
    const is404 = isError && (error as { status?: number })?.status === 404;

    if (id == null) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-8 dark:border-gray-800 dark:bg-white/[0.03]">
                <p className="text-gray-500 dark:text-gray-400">Невірний ID користувача.</p>
                <Link to="/admin/carts" className="mt-2 inline-block text-theme-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                    ← Назад до кошиків
                </Link>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-8 dark:border-gray-800 dark:bg-white/[0.03]">
                <p className="text-gray-500 dark:text-gray-400">Завантаження…</p>
            </div>
        );
    }

    if (isError || !cart) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Кошик користувача #{id}</h3>
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                    <p className="text-amber-800 dark:text-amber-200 font-medium mb-2">
                        {is404 ? "Endpoint не знайдено (404)" : "Кошик не знайдено або помилка"}
                    </p>
                    <Link
                        to="/admin/carts"
                        className="mt-3 inline-block rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:bg-gray-800 dark:text-amber-200"
                    >
                        ← Назад до кошиків
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            <div className="mb-4">
                <Link to="/admin/carts" className="text-theme-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                    ← Назад до кошиків
                </Link>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-1">
                Кошик користувача #{id}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Позицій: {cart.items.length} · Кількість: {cart.totalQuantity} · Сума: {cart.totalPrice.toLocaleString("uk-UA")} ₴
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                        <h4 className="text-theme-sm font-semibold text-gray-800 dark:text-white/90 mb-3">Товари в кошику</h4>
                        <ul className="space-y-3">
                            {(cart.items as CartItemDto[]).map((item, idx) => (
                                <li
                                    key={`${item.productId}-${idx}`}
                                    className="flex gap-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                                >
                                    <CartItemImage imageUrl={item.imageUrl} />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
                                            {item.productName}
                                        </p>
                                        <p className="text-theme-xs text-gray-500 dark:text-gray-400">
                                            {item.price.toLocaleString("uk-UA")} ₴ × {item.quantity}
                                        </p>
                                    </div>
                                    <div className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
                                        {item.lineTotal.toLocaleString("uk-UA")} ₴
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                        <h4 className="text-theme-sm font-semibold text-gray-800 dark:text-white/90 mb-3">Підсумок</h4>
                        <div className="flex justify-between text-theme-sm text-gray-600 dark:text-gray-400">
                            <span>Позицій</span>
                            <span>{cart.items.length}</span>
                        </div>
                        <div className="flex justify-between text-theme-sm text-gray-600 dark:text-gray-400 mt-1">
                            <span>Кількість товарів</span>
                            <span>{cart.totalQuantity}</span>
                        </div>
                        <div className="flex justify-between text-theme-sm font-semibold pt-3 border-t border-gray-200 dark:border-gray-700 mt-3">
                            <span className="text-gray-600 dark:text-gray-400">Сума</span>
                            <span className="text-gray-900 dark:text-white">
                                {cart.totalPrice.toLocaleString("uk-UA")} ₴
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
