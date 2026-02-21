import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useGetCartQuery } from "../../features/cart/api/cartApi";
import { useCreateOrderMutation } from "../../features/orders/api/ordersApi";
import { useLazyGetNpCitiesQuery, useLazyGetNpWarehousesQuery } from "../../features/shipping/api/shippingApi";
import { useMeQuery } from "../../features/account/apiAccount";
import type { NpCity, NpWarehouse } from "../../features/shipping/api/shippingApi";

const DEBOUNCE_MS = 400;

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debouncedValue;
}

export default function CheckoutPage() {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const { data: cart, isLoading: cartLoading } = useGetCartQuery(undefined, { skip: !token });
    const navigate = useNavigate();
    const [createOrder, { isLoading: isSubmitting }] = useCreateOrderMutation();
    const [fetchCities, { data: cities = [], isFetching: citiesLoading }] = useLazyGetNpCitiesQuery();
    const [fetchWarehouses, { data: warehouses = [], isFetching: warehousesLoading }] = useLazyGetNpWarehousesQuery();

    const { data: me, isSuccess: isAuth } = useMeQuery();
    const items = cart?.items ?? [];
    const totalPrice = cart?.totalPrice ?? 0;

    const [recipientName, setRecipientName] = useState("");
    const [recipientPhone, setRecipientPhone] = useState("");
    const [cityQuery, setCityQuery] = useState("");
    const [selectedCity, setSelectedCity] = useState<NpCity | null>(null);
    const [selectedWarehouse, setSelectedWarehouse] = useState<NpWarehouse | null>(null);
    const [comment, setComment] = useState("");
    const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
    const [warehouseDropdownOpen, setWarehouseDropdownOpen] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const debouncedCityQuery = useDebounce(cityQuery, DEBOUNCE_MS);

    useEffect(() => {
        if (!isAuth) return;
        if (!cartLoading && cart && items.length === 0) {
            navigate("/cart", { replace: true });
            return;
        }
    }, [isAuth, cartLoading, cart, items.length, navigate]);

    useEffect(() => {
        if (debouncedCityQuery.trim().length >= 2) fetchCities(debouncedCityQuery.trim());
        else setSelectedCity(null);
    }, [debouncedCityQuery, fetchCities]);

    useEffect(() => {
        if (selectedCity?.ref) fetchWarehouses(selectedCity.ref);
        else setSelectedWarehouse(null);
    }, [selectedCity?.ref, fetchWarehouses]);

    const validate = useCallback((): boolean => {
        const e: Record<string, string> = {};
        if (!recipientName.trim()) e.recipientName = "Вкажіть ім'я отримувача";
        if (!recipientPhone.trim()) e.recipientPhone = "Вкажіть телефон";
        if (!selectedCity) e.city = "Оберіть місто";
        if (!selectedWarehouse) e.warehouse = "Оберіть відділення";
        setErrors(e);
        return Object.keys(e).length === 0;
    }, [recipientName, recipientPhone, selectedCity, selectedWarehouse]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuth || items.length === 0) return;
        if (!validate()) return;
        if (!selectedCity || !selectedWarehouse) return;

        try {
            const res = await createOrder({
                recipientName: recipientName.trim(),
                recipientPhone: recipientPhone.trim(),
                npCityRef: selectedCity.ref,
                npCityName: selectedCity.name,
                npWarehouseRef: selectedWarehouse.ref,
                npWarehouseName: selectedWarehouse.name,
                comment: comment.trim() || undefined,
            }).unwrap();
            navigate(`/orders/${res.orderId}`, { replace: true });
        } catch (err: unknown) {
            const msg = err && typeof err === "object" && "data" in err
                ? (err as { data?: { errors?: string[] } }).data?.errors?.join(", ")
                : "Не вдалося створити замовлення";
            setErrors({ submit: msg ?? "Помилка" });
        }
    };

    if (!isAuth && me !== undefined) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-20 text-center">
                <h1 className="text-2xl font-bold mb-4">Увійдіть в акаунт</h1>
                <p className="text-gray-500 mb-6">Щоб оформити замовлення, потрібно авторизуватися.</p>
                <Link to="/login" className="bg-[#F5A623] text-white px-8 py-3 rounded-full font-bold">Увійти</Link>
            </div>
        );
    }

    if (cartLoading || (isAuth && items.length === 0 && cart)) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-20 text-center text-gray-500">
                Завантаження…
            </div>
        );
    }

    if (items.length === 0 && isAuth) {
        return null;
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <h1 className="text-3xl font-bold mb-10 text-[#404236]">Оформлення замовлення</h1>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ім'я отримувача *</label>
                        <input
                            type="text"
                            value={recipientName}
                            onChange={(e) => setRecipientName(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-[#F5A623] focus:border-[#F5A623]"
                            placeholder="ПІБ"
                        />
                        {errors.recipientName && <p className="text-red-500 text-sm mt-1">{errors.recipientName}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Телефон *</label>
                        <input
                            type="tel"
                            value={recipientPhone}
                            onChange={(e) => setRecipientPhone(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-[#F5A623] focus:border-[#F5A623]"
                            placeholder="+380..."
                        />
                        {errors.recipientPhone && <p className="text-red-500 text-sm mt-1">{errors.recipientPhone}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Доставка: Нова Пошта</label>
                        <div className="space-y-4">
                            <div className="relative">
                                <label className="block text-xs text-gray-500 mb-1">Місто *</label>
                                <input
                                    type="text"
                                    value={cityQuery}
                                    onChange={(e) => {
                                        setCityQuery(e.target.value);
                                        setCityDropdownOpen(true);
                                        if (!e.target.value) setSelectedCity(null);
                                    }}
                                    onFocus={() => setCityDropdownOpen(true)}
                                    placeholder="Почніть вводити назву міста"
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3"
                                />
                                {cityDropdownOpen && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                                        {citiesLoading ? (
                                            <div className="p-4 text-gray-500">Завантаження...</div>
                                        ) : cities.length === 0 ? (
                                            <div className="p-4 text-gray-500">Введіть місто (мінімум 2 символи)</div>
                                        ) : (
                                            cities.map((c) => (
                                                <button
                                                    key={c.ref}
                                                    type="button"
                                                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                                                    onClick={() => {
                                                        setSelectedCity(c);
                                                        setCityQuery(c.name);
                                                        setCityDropdownOpen(false);
                                                    }}
                                                >
                                                    {c.name}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}
                                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                            </div>
                            <div className="relative">
                                <label className="block text-xs text-gray-500 mb-1">Відділення *</label>
                                <input
                                    type="text"
                                    readOnly
                                    value={selectedWarehouse?.name ?? ""}
                                    onFocus={() => setWarehouseDropdownOpen(true)}
                                    placeholder={selectedCity ? "Оберіть відділення" : "Спочатку оберіть місто"}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-gray-50"
                                />
                                {warehouseDropdownOpen && selectedCity && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                                        {warehousesLoading ? (
                                            <div className="p-4 text-gray-500">Завантаження...</div>
                                        ) : warehouses.length === 0 ? (
                                            <div className="p-4 text-gray-500">Немає відділень</div>
                                        ) : (
                                            warehouses.map((w) => (
                                                <button
                                                    key={w.ref}
                                                    type="button"
                                                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                                                    onClick={() => {
                                                        setSelectedWarehouse(w);
                                                        setWarehouseDropdownOpen(false);
                                                    }}
                                                >
                                                    {w.name}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}
                                {errors.warehouse && <p className="text-red-500 text-sm mt-1">{errors.warehouse}</p>}
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Коментар</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={2}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3"
                            placeholder="Необов'язково"
                        />
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-[#404236] text-white p-8 rounded-2xl shadow-xl sticky top-6">
                        <h2 className="text-xl font-bold mb-6">Ваше замовлення</h2>
                        <ul className="space-y-3 mb-6 max-h-48 overflow-auto">
                            {items.map((item) => (
                                <li key={item.productId} className="flex justify-between text-sm">
                                    <span className="truncate max-w-[140px]">{item.productName}</span>
                                    <span>{item.quantity} × {item.price.toLocaleString("uk-UA")} ₴</span>
                                </li>
                            ))}
                        </ul>
                        <div className="border-t border-white/10 pt-4 flex justify-between text-lg font-bold">
                            <span>До сплати:</span>
                            <span className="text-[#F5A623]">{totalPrice.toLocaleString("uk-UA")} ₴</span>
                        </div>
                        {errors.submit && <p className="text-red-300 text-sm mt-2">{errors.submit}</p>}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-[#f5a623] text-white font-bold py-4 rounded-full mt-6 hover:bg-[#ffb945] transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? "Створення..." : "Підтвердити замовлення"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
