import { useState } from "react";
import { Link } from "react-router-dom";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import { useGetAdminCartsQuery } from "../../../features/cart/api/cartApi";

export type CartsDateFilter = "today" | "week" | "month" | "all";

const DATE_FILTER_OPTIONS: { value: CartsDateFilter; label: string }[] = [
    { value: "today", label: "Сьогодні" },
    { value: "week", label: "За тиждень" },
    { value: "month", label: "За місяць" },
    { value: "all", label: "Всі" },
];

function formatDate(iso: string | null | undefined): string {
    if (!iso) return "—";
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

export default function AdminCarts() {
    const [page, setPage] = useState(1);
    const [dateFilter, setDateFilter] = useState<CartsDateFilter>("all");
    const pageSize = 20;
    const { data, isLoading, isError, error, refetch } = useGetAdminCartsQuery({
        page,
        pageSize,
        dateFilter,
    });

    const carts = data?.items ?? [];
    const pagination = data?.pagination;

    if (isLoading) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Кошики користувачів</h3>
                <div className="py-8 text-gray-500 dark:text-gray-400">Завантаження…</div>
            </div>
        );
    }

    if (isError) {
        const errorStatus = (error as { status?: number })?.status;
        const is404 = errorStatus === 404;
        return (
            <div className="rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Кошики користувачів</h3>
                <div className={`rounded-lg border p-4 ${is404 ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20" : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"}`}>
                    <p className={`font-medium mb-2 ${is404 ? "text-amber-800 dark:text-amber-200" : "text-red-800 dark:text-red-200"}`}>
                        {is404 ? "Endpoint не знайдено (404)" : `Помилка завантаження${errorStatus ? ` (${errorStatus})` : ""}`}
                    </p>
                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="mt-3 rounded-lg border border-current px-3 py-2 text-sm font-medium opacity-90 hover:opacity-100"
                    >
                        Повторити
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
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Кошики користувачів</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {pagination ? `Всього: ${pagination.totalCount}` : `Всього: ${carts.length}`}
                        </p>
                    </div>
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
                        onClick={() => refetch()}
                    >
                        Оновити
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
                                Користувач (ID)
                            </TableCell>
                            <TableCell isHeader className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                                Email
                            </TableCell>
                            <TableCell isHeader className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                                Позицій
                            </TableCell>
                            <TableCell isHeader className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                                Кількість
                            </TableCell>
                            <TableCell isHeader className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                                Сума
                            </TableCell>
                            <TableCell isHeader className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                                Оновлено
                            </TableCell>
                            <TableCell isHeader className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                                Дії
                            </TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {carts.map((cart) => (
                            <TableRow key={cart.userId}>
                                <TableCell className="py-3 text-theme-sm font-medium text-gray-800 dark:text-white/90">
                                    {cart.userName ?? "—"} (#{cart.userId})
                                </TableCell>
                                <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                                    {cart.userEmail ?? "—"}
                                </TableCell>
                                <TableCell className="py-3 text-theme-sm text-gray-800 dark:text-white/90">
                                    {cart.itemsCount}
                                </TableCell>
                                <TableCell className="py-3 text-theme-sm text-gray-800 dark:text-white/90">
                                    {cart.totalQuantity}
                                </TableCell>
                                <TableCell className="py-3 text-theme-sm font-medium text-gray-800 dark:text-white/90">
                                    {formatPrice(cart.totalPrice)}
                                </TableCell>
                                <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                                    {formatDate(cart.lastUpdatedAt)}
                                </TableCell>
                                <TableCell className="py-3">
                                    <Link
                                        to={`/admin/carts/${cart.userId}`}
                                        className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-theme-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-white/[0.03]"
                                    >
                                        Деталі
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                        {carts.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="py-8 text-center text-gray-500 dark:text-gray-400">
                                    Немає кошиків з товарами
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
                        Назад
                    </button>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        Сторінка {pagination.currentPage} / {pagination.totalPages}
                    </span>
                    <button
                        type="button"
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                        disabled={page >= pagination.totalPages}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Далі
                    </button>
                </div>
            )}
        </div>
    );
}
