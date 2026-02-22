import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useGetAdminOrderByIdQuery } from "../../../features/orders/api/ordersApi";
import { buildProductImageCandidates } from "../../../features/products/utils/productImageUrl";

const STATUS_LABEL: Record<string, string> = {
    Created: "Створено",
    Paid: "Оплачено",
    Shipped: "Відправлено",
    Completed: "Виконано",
    Canceled: "Скасовано",
};

const PLACEHOLDER_SRC = "/icons/ZORYA-LOGO.svg";

function OrderItemImage({ imageName }: { imageName: string | null | undefined }) {
    const candidates = buildProductImageCandidates(imageName ?? null);
    const [idx, setIdx] = useState(0);
    const src = candidates[idx] ?? null;
    if (!src)
        return (
            <div className="h-12 w-12 shrink-0 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <img src={PLACEHOLDER_SRC} alt="" className="h-6 w-6 opacity-50" />
            </div>
        );
    return (
        <img
            src={src}
            alt=""
            className="h-12 w-12 shrink-0 object-cover rounded-md bg-gray-100 dark:bg-gray-700"
            onError={() => setIdx((i) => (i + 1 < candidates.length ? i + 1 : i))}
        />
    );
}

const ADMIN_ORDER_DETAIL_TODO = `
Backend не надає endpoint для перегляду деталей замовлення адміном.

Потрібно додати:
• GET /api/admin/orders/{id} — деталі замовлення (OrderDetailsDto).
  Поля: id, createdAt, status, totalPrice, recipientName, recipientPhone,
  npCityName, npWarehouseName, comment, items[] (productName, price, quantity, imageUrl, lineTotal).
  Опційно: userId, userEmail для відображення клієнта.
`.trim();

export default function AdminOrderDetails() {
    const { id } = useParams<{ id: string }>();
    const orderId = id != null && /^\d+$/.test(id) ? Number(id) : null;
    const { data: order, isLoading, isError, error } = useGetAdminOrderByIdQuery(orderId!, {
        skip: orderId == null,
    });
    const is404 = isError && (error as { status?: number })?.status === 404;

    if (orderId == null) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-8 dark:border-gray-800 dark:bg-white/[0.03]">
                <p className="text-gray-500 dark:text-gray-400">Invalid order id.</p>
                <Link to="/admin/orders" className="mt-2 inline-block text-theme-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                    ← Back to Orders
                </Link>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-8 dark:border-gray-800 dark:bg-white/[0.03]">
                <p className="text-gray-500 dark:text-gray-400">Loading...</p>
            </div>
        );
    }

    if (isError || !order) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Order #{orderId}</h3>
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                    <p className="text-amber-800 dark:text-amber-200 font-medium mb-2">
                        {is404 ? "Endpoint не знайдено (404)" : "Замовлення не знайдено або помилка"}
                    </p>
                    {is404 && (
                        <pre className="text-theme-xs text-amber-700 dark:text-amber-300 whitespace-pre-wrap font-sans mt-2">
                            {ADMIN_ORDER_DETAIL_TODO}
                        </pre>
                    )}
                    <Link
                        to="/admin/orders"
                        className="mt-3 inline-block rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:bg-gray-800 dark:text-amber-200"
                    >
                        ← Back to Orders
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            <div className="mb-4">
                <Link
                    to="/admin/orders"
                    className="text-theme-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                    ← Back to Orders
                </Link>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-1">
                Order #{order.id}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                {new Date(order.createdAt).toLocaleDateString("uk-UA", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                })}
                {" · "}
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-theme-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                    {STATUS_LABEL[order.status] ?? order.status}
                </span>
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                        <h4 className="text-theme-sm font-semibold text-gray-800 dark:text-white/90 mb-2">
                            Delivery (Nova Poshta)
                        </h4>
                        <p className="text-theme-sm text-gray-600 dark:text-gray-300">{order.npCityName}</p>
                        <p className="text-theme-sm text-gray-600 dark:text-gray-300">{order.npWarehouseName}</p>
                        <p className="text-theme-xs text-gray-500 dark:text-gray-400 mt-2">
                            {order.recipientName}, {order.recipientPhone}
                        </p>
                        {order.comment && (
                            <p className="text-theme-xs text-gray-500 dark:text-gray-400 mt-1">Comment: {order.comment}</p>
                        )}
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                        <h4 className="text-theme-sm font-semibold text-gray-800 dark:text-white/90 mb-3">Items</h4>
                        <ul className="space-y-3">
                            {order.items.map((item, idx) => (
                                <li
                                    key={idx}
                                    className="flex gap-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                                >
                                    <OrderItemImage imageName={item.imageUrl} />
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
                        <h4 className="text-theme-sm font-semibold text-gray-800 dark:text-white/90 mb-3">Summary</h4>
                        <div className="flex justify-between text-theme-sm font-semibold pt-3 border-t border-gray-200 dark:border-gray-700">
                            <span className="text-gray-600 dark:text-gray-400">Total</span>
                            <span className="text-gray-900 dark:text-white">
                                {order.totalPrice.toLocaleString("uk-UA")} ₴
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
