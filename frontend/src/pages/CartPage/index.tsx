import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
    useGetCartQuery,
    useUpdateCartItemQtyMutation,
    useRemoveCartItemMutation,
    useAddCartItemMutation,
    type CartItemDto,
} from "../../features/cart/api/cartApi";

const API_BASE = import.meta.env.VITE_API_BASE;
const LEGACY_CART_KEY = "cart";
const MIGRATED_KEY = "cart_migrated";

export default function CartPage() {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const { data: cart, isLoading, isError, refetch } = useGetCartQuery(undefined, { skip: !token });
    const [updateQty, { isLoading: isUpdating }] = useUpdateCartItemQtyMutation();
    const [removeItem, { isLoading: isRemoving }] = useRemoveCartItemMutation();
    const [addCartItem] = useAddCartItemMutation();
    const migrationDone = useRef(false);

    // One-time migration from localStorage (legacy client-side cart) to server cart
    useEffect(() => {
        if (!token || migrationDone.current || typeof window === "undefined") return;
        if (sessionStorage.getItem(MIGRATED_KEY)) {
            migrationDone.current = true;
            return;
        }
        let cancelled = false;
        const run = async () => {
            try {
                const raw = localStorage.getItem(LEGACY_CART_KEY);
                if (!raw) {
                    sessionStorage.setItem(MIGRATED_KEY, "1");
                    return;
                }
                const parsed = JSON.parse(raw) as unknown;
                if (!Array.isArray(parsed) || parsed.length === 0) {
                    sessionStorage.setItem(MIGRATED_KEY, "1");
                    localStorage.removeItem(LEGACY_CART_KEY);
                    return;
                }
                for (const item of parsed) {
                    if (cancelled) return;
                    const productId = item?.id ?? item?.productId;
                    const qty = item?.quantity ?? 1;
                    if (typeof productId !== "number" || productId <= 0 || typeof qty !== "number" || qty <= 0) continue;
                    try {
                        await addCartItem({ productId, quantity: qty }).unwrap();
                    } catch (err: unknown) {
                        const status = err && typeof err === "object" && "status" in err ? (err as { status: number }).status : 0;
                        if (status === 401) return;
                        throw err;
                    }
                }
                sessionStorage.setItem(MIGRATED_KEY, "1");
                localStorage.removeItem(LEGACY_CART_KEY);
                refetch();
            } catch {
                // Keep legacy cart on any error
            } finally {
                if (!cancelled) migrationDone.current = true;
            }
        };
        run();
        return () => {
            cancelled = true;
        };
    }, [token, addCartItem, refetch]);

    const items = cart?.items ?? [];
    const totalPrice = cart?.totalPrice ?? 0;

    const buildImageSrc = (value?: string | null): string => {
        if (!value) return "/icons/ZORYA-LOGO.svg";
        if (value.startsWith("http")) return value;
        return `${API_BASE}${value.startsWith("/") ? "" : "/"}${value}`;
    };

    if (!token) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-20 text-center">
                <h1 className="text-3xl font-bold mb-6">Увійдіть в акаунт</h1>
                <p className="text-gray-500 mb-8">Щоб переглянути кошик, потрібно авторизуватися.</p>
                <Link to="/login" className="bg-[#F5A623] text-white px-8 py-3 rounded-full font-bold hover:bg-[#e6951d] transition-colors shadow-md">
                    Увійти
                </Link>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-20 text-center text-gray-500">
                Завантаження кошика…
            </div>
        );
    }

    if (items.length === 0 && !isError) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-20 text-center">
                <h1 className="text-3xl font-bold mb-6">Ваш кошик порожній</h1>
                <p className="text-gray-500 mb-8">Схоже, ви ще нічого не додали до кошика.</p>
                <Link to="/" className="bg-[#F5A623] text-white px-8 py-3 rounded-full font-bold hover:bg-[#e6951d] transition-colors shadow-md">
                    Перейти до покупок
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <h1 className="text-3xl font-bold mb-10 text-[#404236]">Кошик</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-6">
                    {items.map((item: CartItemDto) => (
                        <div key={item.productId} className="flex gap-6 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-24 h-24 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border">
                                <img src={buildImageSrc(item.imageUrl)} alt={item.productName} className="w-full h-full object-contain" />
                            </div>

                            <div className="flex-grow flex flex-col justify-between">
                                <div>
                                    <h3 className="font-semibold text-lg text-[#1a1a1a]">{item.productName}</h3>
                                    <p className="text-[#F5A623] font-bold mt-1">{item.price.toLocaleString("uk-UA")} ₴</p>
                                </div>

                                <div className="flex items-center gap-4 mt-2">
                                    <div className="flex items-center border rounded-full px-2 py-1 bg-gray-50">
                                        <button
                                            onClick={() => updateQty({ productId: item.productId, quantity: Math.max(0, item.quantity - 1) })}
                                            disabled={isUpdating}
                                            className="w-8 h-8 flex items-center justify-center font-bold hover:text-[#F5A623] disabled:opacity-50"
                                        >
                                            -
                                        </button>
                                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQty({ productId: item.productId, quantity: item.quantity + 1 })}
                                            disabled={isUpdating}
                                            className="w-8 h-8 flex items-center justify-center font-bold hover:text-[#F5A623] disabled:opacity-50"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => removeItem(item.productId)}
                                        disabled={isRemoving}
                                        className="text-gray-400 hover:text-red-500 text-sm font-medium transition-colors disabled:opacity-50"
                                    >
                                        Видалити
                                    </button>
                                </div>
                            </div>

                            <div className="text-right flex flex-col justify-center">
                                <p className="font-bold text-xl">{item.lineTotal.toLocaleString("uk-UA")} ₴</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-[#404236] text-white p-8 rounded-2xl shadow-xl sticky top-6">
                        <h2 className="text-xl font-bold mb-6">Разом</h2>
                        <div className="space-y-4 text-[#FFD89F]/80">
                            <div className="flex justify-between">
                                <span>Кількість товарів:</span>
                                <span>{cart?.totalQuantity ?? 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Доставка:</span>
                                <span className="text-green-400">Безкоштовно</span>
                            </div>
                            <div className="border-t border-white/10 pt-4 mt-4 flex justify-between text-white">
                                <span className="text-lg font-bold">До сплати:</span>
                                <span className="text-2xl font-bold text-[#F5A623]">{totalPrice.toLocaleString("uk-UA")} ₴</span>
                            </div>
                        </div>
                        <Link to="/checkout" className="block w-full bg-[#f5a623] text-white font-bold py-4 rounded-full mt-8 hover:bg-[#ffb945] transition-colors shadow-lg active:scale-95 duration-75 text-center">
                            Оформити замовлення
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
