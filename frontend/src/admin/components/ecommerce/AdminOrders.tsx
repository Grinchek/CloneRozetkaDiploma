import { useState } from "react";
import { Link } from "react-router-dom";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Badge from "../ui/badge/Badge";
import { useGetAdminOrdersQuery } from "../../../features/orders/api/ordersApi";

const STATUS_LABEL: Record<string, string> = {
    Created: "Створено",
    Paid: "Оплачено",
    Shipped: "Відправлено",
    Completed: "Виконано",
    Canceled: "Скасовано",
};

function formatDate(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("uk-UA", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatPrice(value: number): string {
    return `${value.toLocaleString("uk-UA")} ₴`;
}

const ADMIN_ORDERS_TODO = `
Backend не надає адмін-ендпоінтів для замовлень.

Потрібно додати:
• GET /api/admin/orders — список усіх замовлень (опційно з пагінацією: page, pageSize).
  Відповідь: масив OrderListItemDto або SearchResult<OrderListItemDto>.
  Поля: id, createdAt, status, totalPrice, npCityName, npWarehouseName (опційно: userId, userEmail).
• GET /api/admin/orders/{id} — деталі замовлення (OrderDetailsDto + опційно дані клієнта).
`.trim();

export type OrdersDateFilter = "today" | "week" | "month" | "all";

const DATE_FILTER_OPTIONS: { value: OrdersDateFilter; label: string }[] = [
    { value: "today", label: "Сьогодні" },
    { value: "week", label: "За тиждень" },
    { value: "month", label: "За місяць" },
    { value: "all", label: "Всі" },
];

export default function AdminOrders() {
    const [page, setPage] = useState(1);
    const [dateFilter, setDateFilter] = useState<OrdersDateFilter>("all");
    const pageSize = 20;
    const { data, isLoading, isError, error, refetch } = useGetAdminOrdersQuery({
        page,
        pageSize,
        dateFilter,
    });

    const orders = data?.items ?? [];
    const pagination = data?.pagination;
    const is404 = isError && (error as { status?: number })?.status === 404;

    if (isLoading) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Orders</h3>
                <div className="py-8 text-gray-500 dark:text-gray-400">Loading...</div>
            </div>
        );
    }

    if (isError) {
        const errorStatus = (error as { status?: number })?.status;
        const is404 = errorStatus === 404;
        return (
            <div className="rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Orders</h3>
                <div className={`rounded-lg border p-4 ${is404 ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20" : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"}`}>
                    <p className={`font-medium mb-2 ${is404 ? "text-amber-800 dark:text-amber-200" : "text-red-800 dark:text-red-200"}`}>
                        {is404 ? "Endpoint не знайдено (404)" : `Помилка завантаження${errorStatus ? ` (${errorStatus})` : ""}`}
                    </p>
                    {is404 && (
                        <pre className="text-theme-xs text-amber-700 dark:text-amber-300 whitespace-pre-wrap font-sans mt-2">
                            {ADMIN_ORDERS_TODO}
                        </pre>
                    )}
                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="mt-3 rounded-lg border border-current px-3 py-2 text-sm font-medium opacity-90 hover:opacity-100"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            <div className="mb-4 flex flex-col gap-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Orders</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {pagination ? `Total: ${pagination.totalCount}` : `Total: ${orders.length}`}
                        </p>
                    </div>
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
                        onClick={() => refetch()}
                    >
                        Refresh
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {DATE_FILTER_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                                setDateFilter(opt.value);
                                setPage(1);
                            }}
                            className={`rounded-lg border px-3 py-2 text-theme-sm font-medium transition-colors ${
                                dateFilter === opt.value
                                    ? "border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500 dark:text-white"
                                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-full overflow-x-auto">
                <Table>
                    <TableHeader className="border-y border-gray-100 dark:border-gray-800">
                        <TableRow>
                            <TableCell isHeader className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                                Order #
                            </TableCell>
                            <TableCell isHeader className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                                Date
                            </TableCell>
                            <TableCell isHeader className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                                Status
                            </TableCell>
                            <TableCell isHeader className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                                Total
                            </TableCell>
                            <TableCell isHeader className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                                Delivery (Nova Poshta)
                            </TableCell>
                            <TableCell isHeader className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {orders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="py-3 text-theme-sm font-medium text-gray-800 dark:text-white/90">
                                    #{order.id}
                                </TableCell>
                                <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                                    {formatDate(order.createdAt)}
                                </TableCell>
                                <TableCell className="py-3">
                                    <Badge size="sm" color="default">
                                        {STATUS_LABEL[order.status] ?? order.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="py-3 text-theme-sm font-medium text-gray-800 dark:text-white/90">
                                    {formatPrice(order.totalPrice)}
                                </TableCell>
                                <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                                    {order.npCityName && order.npWarehouseName
                                        ? `${order.npCityName}, ${order.npWarehouseName}`
                                        : order.npCityName || order.npWarehouseName || "—"}
                                </TableCell>
                                <TableCell className="py-3">
                                    <Link
                                        to={`/admin/orders/${order.id}`}
                                        className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-theme-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-white/[0.03]"
                                    >
                                        Details
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                        {orders.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                                    No orders found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {pagination && pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                    <button
                        type="button"
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                    >
                        Prev
                    </button>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        Page {pagination.currentPage} / {pagination.totalPages}
                    </span>
                    <button
                        type="button"
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                        disabled={page >= pagination.totalPages}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
