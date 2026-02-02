import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import { useDeleteProductMutation, useGetProductsPagedQuery } from "../../../features/products/api/productApi.tsx";

const API_URL = import.meta.env.VITE_API_BASE;

export default function AdminProducts() {
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const { data, isLoading, isFetching, error, refetch } = useGetProductsPagedQuery({ page, pageSize });
    const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

    // modal
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selected, setSelected] = useState<{ id: number; name: string } | null>(null);

    // якщо після видалення сторінка стала пустою — відкотитись назад
    useEffect(() => {
        if (!data) return;
        if (page > 1 && data.items.length === 0) setPage((p) => p - 1);
    }, [data, page]);

    const askDelete = (id: number, name: string) => {
        setSelected({ id, name });
        setConfirmOpen(true);
    };

    const closeConfirm = () => {
        if (isDeleting) return;
        setConfirmOpen(false);
        setSelected(null);
    };

    const confirmDelete = async () => {
        if (!selected) return;
        try {
            await deleteProduct(selected.id).unwrap();
            closeConfirm();
        } catch {
            closeConfirm();
        }
    };

    const apiErrorText =
        (error as any)?.data
            ? typeof (error as any).data === "string"
                ? (error as any).data
                : JSON.stringify((error as any).data)
            : (error as any)?.error || "Unknown error";

    const items = data?.items ?? [];

    return (
        <div className="rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Products {isFetching ? "(updating...)" : ""}
                    </h3>
                    {data && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Total: {data.pagination.totalCount}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <button
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                        onClick={() => refetch()}
                        disabled={isFetching}
                    >
                        Refresh
                    </button>

                    <button
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                        onClick={() => setPage(1)}
                    >
                        First page
                    </button>
                </div>
            </div>

            {isLoading && <div className="py-6 text-gray-500 dark:text-gray-400">Loading...</div>}
            {error && <div className="py-6 text-red-600">Error: {apiErrorText}</div>}

            {!isLoading && !error && (
                <div className="max-w-full overflow-x-auto">
                    <Table>
                        <TableHeader className="border-y border-gray-100 dark:border-gray-800">
                            <TableRow>
                                <TableCell isHeader className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                                    Product
                                </TableCell>

                                <TableCell isHeader className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                                    Price
                                </TableCell>

                                <TableCell isHeader className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                                    CategoryId
                                </TableCell>

                                <TableCell isHeader className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                                    Slug
                                </TableCell>

                                <TableCell isHeader className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {items.map((p) => {
                                // Якщо бек віддає вже "/Images/400_xxx.webp" — тоді просто використовуй p.mainImageUrl
                                // Якщо віддає тільки "xxx.webp" — тоді зроби `${API_URL}/Images/400_${p.mainImageUrl}`
                                const imgSrc = p.mainImageUrl
                                    ? p.mainImageUrl.startsWith("/")
                                        ? `${API_URL}${p.mainImageUrl}`
                                        : `${API_URL}/Images/400_${p.mainImageUrl}`
                                    : "/images/placeholder.png";

                                return (
                                    <TableRow key={p.id}>
                                        <TableCell className="py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-[50px] w-[50px] overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
                                                    <img
                                                        src={imgSrc}
                                                        className="h-[50px] w-[50px] object-cover"
                                                        alt={p.name}
                                                    />
                                                </div>

                                                <div>
                                                    <p className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
                                                        {p.name}
                                                    </p>
                                                    <span className="text-theme-xs text-gray-500 dark:text-gray-400">
                            ID: {p.id}
                          </span>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                                            {p.price}
                                        </TableCell>

                                        <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                                            {p.categoryId}
                                        </TableCell>

                                        <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                                            {p.slug}
                                        </TableCell>

                                        <TableCell className="py-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-blue-700 shadow-theme-xs hover:bg-blue-50 hover:text-blue-800 dark:border-blue-700 dark:bg-gray-800 dark:text-blue-300 dark:hover:bg-white/[0.03]"
                                                    onClick={() => console.log("Edit product:", p.id)}
                                                    disabled={isDeleting}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-red-700 shadow-theme-xs hover:bg-red-50 hover:text-red-800 disabled:opacity-50 dark:border-red-700 dark:bg-gray-800 dark:text-red-300 dark:hover:bg-white/[0.03]"
                                                    onClick={() => askDelete(p.id, p.name)}
                                                    disabled={isDeleting}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}

                            {items.length === 0 && (
                                <TableRow>
                                    <TableCell className="py-6 text-gray-500 dark:text-gray-400">
                                        No products found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {data && data.pagination.totalPages > 1 && (
                        <div className="mt-4 flex items-center justify-between">
                            <button
                                className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => p - 1)}
                            >
                                Prev
                            </button>

                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Page {data.pagination.currentPage} / {data.pagination.totalPages}
                            </div>

                            <button
                                className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
                                disabled={page >= data.pagination.totalPages}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}

            <ConfirmModal
                open={confirmOpen}
                title="Delete product?"
                description={selected ? `Delete "${selected.name}" (ID: ${selected.id})?` : "Are you sure?"}
                confirmText={isDeleting ? "Deleting..." : "Delete"}
                cancelText="Cancel"
                loading={isDeleting}
                onClose={closeConfirm}
                onConfirm={confirmDelete}
            />
        </div>
    );
}

type ConfirmModalProps = {
    open: boolean;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    loading?: boolean;
    onClose: () => void;
    onConfirm: () => void;
};

function ConfirmModal({
                          open,
                          title = "Confirm action",
                          description = "Are you sure?",
                          confirmText = "Confirm",
                          cancelText = "Cancel",
                          loading = false,
                          onClose,
                          onConfirm,
                      }: ConfirmModalProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => !loading && onClose()} />

            <div className="relative w-[92%] max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-xl dark:border-gray-800 dark:bg-gray-900">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{description}</p>

                <div className="mt-5 flex items-center justify-end gap-3">
                    <button
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-white/[0.03]"
                        onClick={onClose}
                        disabled={loading}
                    >
                        {cancelText}
                    </button>

                    <button
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
