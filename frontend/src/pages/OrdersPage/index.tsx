import { Link } from "react-router-dom";
import { useGetMyOrdersQuery } from "../../features/orders/api/ordersApi";
import { useMeQuery } from "../../features/account/apiAccount";

const STATUS_LABEL: Record<string, string> = {
    Created: "Створено",
    Paid: "Оплачено",
    Shipped: "Відправлено",
    Completed: "Виконано",
    Canceled: "Скасовано",
};

export default function OrdersPage() {
    const { data: me, isSuccess: isAuth } = useMeQuery();
    const { data: orders = [], isLoading } = useGetMyOrdersQuery(undefined, { skip: !isAuth });

    if (!isAuth && me !== undefined) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-20 text-center">
                <h1 className="text-2xl font-bold mb-4">Увійдіть в акаунт</h1>
                <p className="text-gray-500 mb-6">Щоб переглянути замовлення.</p>
                <Link to="/login" className="bg-[#F5A623] text-white px-8 py-3 rounded-full font-bold">Увійти</Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <h1 className="text-3xl font-bold mb-10 text-[#404236]">Мої замовлення</h1>

            {isLoading ? (
                <div className="text-gray-500">Завантаження...</div>
            ) : orders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <p className="text-gray-500 mb-6">У вас ще немає замовлень.</p>
                    <Link to="/" className="text-[#F5A623] font-bold hover:underline">Перейти до покупок</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="flex flex-wrap items-center gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <span className="font-bold text-[#404236]">№ {order.id}</span>
                                    <span className="text-gray-500 text-sm">
                                        {new Date(order.createdAt).toLocaleDateString("uk-UA", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-sm bg-gray-100 text-gray-700">
                                        {STATUS_LABEL[order.status] ?? order.status}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                    {order.npCityName}, {order.npWarehouseName}
                                </p>
                            </div>
                            <div className="font-bold text-lg text-[#404236]">
                                {order.totalPrice.toLocaleString("uk-UA")} ₴
                            </div>
                            <Link
                                to={`/orders/${order.id}`}
                                className="rounded-full border-2 border-[#404236] px-6 py-2 font-bold text-[#404236] hover:bg-[#404236] hover:text-white transition-colors"
                            >
                                Деталі
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
