import { useParams, Link } from "react-router-dom";
import { useGetOrderByIdQuery } from "../../features/orders/api/ordersApi";
import { useMeQuery } from "../../features/account/apiAccount";

const API_BASE = import.meta.env.VITE_API_BASE;

const STATUS_LABEL: Record<string, string> = {
    Created: "Створено",
    Paid: "Оплачено",
    Shipped: "Відправлено",
    Completed: "Виконано",
    Canceled: "Скасовано",
};

function buildImageSrc(value?: string | null): string {
    if (!value) return "/icons/ZORYA-LOGO.svg";
    if (value.startsWith("http")) return value;
    return `${API_BASE}${value.startsWith("/") ? "" : "/"}${value}`;
}

export default function OrderDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const orderId = id != null && /^\d+$/.test(id) ? Number(id) : null;
    const { data: me, isSuccess: isAuth } = useMeQuery();
    const { data: order, isLoading, isError } = useGetOrderByIdQuery(orderId!, { skip: !isAuth || orderId == null });

    if (!isAuth && me !== undefined) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-20 text-center">
                <h1 className="text-2xl font-bold mb-4">Увійдіть в акаунт</h1>
                <Link to="/login" className="bg-[#F5A623] text-white px-8 py-3 rounded-full font-bold">Увійти</Link>
            </div>
        );
    }

    if (orderId == null || isError || (!isLoading && !order)) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-20 text-center">
                <h1 className="text-2xl font-bold mb-4">Замовлення не знайдено</h1>
                <Link to="/orders" className="text-[#F5A623] font-bold hover:underline">До списку замовлень</Link>
            </div>
        );
    }

    if (isLoading || !order) {
        return <div className="max-w-7xl mx-auto px-6 py-10">Завантаження...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="mb-8">
                <Link to="/orders" className="text-[#F5A623] font-medium hover:underline">← Мої замовлення</Link>
            </div>
            <h1 className="text-3xl font-bold mb-2 text-[#404236]">Замовлення № {order.id}</h1>
            <p className="text-gray-500 mb-8">
                {new Date(order.createdAt).toLocaleDateString("uk-UA", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                })}
                {" · "}
                <span className="px-2 py-0.5 rounded-full text-sm bg-gray-100 text-gray-700">
                    {STATUS_LABEL[order.status] ?? order.status}
                </span>
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                        <h2 className="text-lg font-bold mb-4 text-[#404236]">Доставка (Нова Пошта)</h2>
                        <p className="text-gray-700">{order.npCityName}</p>
                        <p className="text-gray-700">{order.npWarehouseName}</p>
                        <p className="text-sm text-gray-500 mt-2">
                            Отримувач: {order.recipientName}, {order.recipientPhone}
                        </p>
                        {order.comment && (
                            <p className="text-sm text-gray-500 mt-1">Коментар: {order.comment}</p>
                        )}
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                        <h2 className="text-lg font-bold mb-4 text-[#404236]">Товари</h2>
                        <ul className="space-y-4">
                            {order.items.map((item, idx) => (
                                <li key={idx} className="flex gap-4 py-3 border-b border-gray-100 last:border-0">
                                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                                        <img
                                            src={buildImageSrc(item.imageUrl)}
                                            alt={item.productName}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-[#1a1a1a]">{item.productName}</p>
                                        <p className="text-sm text-gray-500">
                                            {item.price.toLocaleString("uk-UA")} ₴ × {item.quantity}
                                        </p>
                                    </div>
                                    <div className="font-bold text-[#404236]">
                                        {item.lineTotal.toLocaleString("uk-UA")} ₴
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <div className="bg-[#404236] text-white p-8 rounded-2xl shadow-xl sticky top-6">
                        <h2 className="text-xl font-bold mb-6">Підсумок</h2>
                        <div className="flex justify-between text-lg font-bold pt-4 border-t border-white/10">
                            <span>До сплати:</span>
                            <span className="text-[#F5A623]">{order.totalPrice.toLocaleString("uk-UA")} ₴</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
