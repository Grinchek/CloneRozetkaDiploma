import { useEffect, useState, useRef, useCallback } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import {
    useGetAdminAttributesListQuery,
    useGetAdminAttributeByIdQuery,
    useCreateAdminAttributeMutation,
    useUpdateAdminAttributeMutation,
    useDeleteAdminAttributeMutation,
    type AdminAttributeListItemDto,
    type AdminAttributeCreateRequest,
    type AdminAttributeUpdateRequest,
    AttributeDataType,
} from "../../../features/products/api/productAttributesApi";

const DATA_TYPES: AttributeDataType[] = [
    AttributeDataType.String,
    AttributeDataType.Number,
    AttributeDataType.Bool,
    AttributeDataType.Enum,
];

type FormModalProps = {
    open: boolean;
    mode: "create" | "edit";
    editId: number | null;
    onClose: () => void;
    onSuccess: () => void;
};

function AttributeFormModal({ open, mode, editId, onClose, onSuccess }: FormModalProps) {
    const { data: editAttr, isLoading: loadingAttr } = useGetAdminAttributeByIdQuery(editId ?? 0, {
        skip: !open || mode !== "edit" || editId == null,
    });
    const [createAttr, { isLoading: isCreating }] = useCreateAdminAttributeMutation();
    const [updateAttr, { isLoading: isUpdating }] = useUpdateAdminAttributeMutation();

    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [dataType, setDataType] = useState<AttributeDataType>(AttributeDataType.String);
    const [unit, setUnit] = useState("");
    const [options, setOptions] = useState<{ id?: number | null; value: string }[]>([]);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const submitting = isCreating || isUpdating;

    const resetForm = useCallback(() => {
        setName("");
        setSlug("");
        setDataType(AttributeDataType.String);
        setUnit("");
        setOptions([]);
        setSubmitError(null);
    }, []);

    useEffect(() => {
        if (!open) {
            resetForm();
            return;
        }
        if (mode === "edit" && editAttr) {
            setName(editAttr.name);
            setSlug(editAttr.slug ?? "");
            setDataType(editAttr.dataType);
            setUnit(editAttr.unit ?? "");
            setOptions(editAttr.options.map((o) => ({ id: o.id, value: o.value })));
            setSubmitError(null);
        } else if (mode === "create") {
            resetForm();
        }
    }, [open, mode, editId, editAttr, resetForm]);

    const addOption = () => setOptions((prev) => [...prev, { value: "" }]);
    const removeOption = (index: number) => setOptions((prev) => prev.filter((_, i) => i !== index));
    const setOptionValue = (index: number, value: string) =>
        setOptions((prev) => prev.map((o, i) => (i === index ? { ...o, value } : o)));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);
        const nameTrim = name.trim();
        if (!nameTrim) {
            setSubmitError("Назва обовʼязкова.");
            return;
        }
        if (mode === "create") {
            const body: AdminAttributeCreateRequest = {
                name: nameTrim,
                slug: slug.trim() || null,
                dataType,
                unit: unit.trim() || null,
                options:
                    dataType === AttributeDataType.Enum && options.length > 0
                        ? options.filter((o) => o.value.trim()).map((o) => ({ value: o.value.trim() }))
                        : undefined,
            };
            try {
                await createAttr(body).unwrap();
                onSuccess();
                onClose();
            } catch (err: unknown) {
                const msg =
                    (err as { data?: { title?: string } })?.data?.title ??
                    (err as { data?: unknown })?.data ??
                    (err as Error)?.message ??
                    "Не вдалося створити.";
                setSubmitError(String(msg));
            }
        } else if (editId != null) {
            const body: AdminAttributeUpdateRequest = {
                name: nameTrim,
                slug: slug.trim() || null,
                dataType,
                unit: unit.trim() || null,
                options:
                    dataType === AttributeDataType.Enum
                        ? options.map((o) => ({ id: o.id ?? null, value: o.value }))
                        : undefined,
            };
            try {
                await updateAttr({ id: editId, body }).unwrap();
                onSuccess();
                onClose();
            } catch (err: unknown) {
                const msg =
                    (err as { data?: { title?: string } })?.data?.title ??
                    (err as { data?: unknown })?.data ??
                    (err as Error)?.message ??
                    "Не вдалося оновити.";
                setSubmitError(String(msg));
            }
        }
    };

    if (!open) return null;

    const title = mode === "create" ? "Створити атрибут" : "Редагувати атрибут";

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => !submitting && onClose()} />
            <div className="relative w-[92%] max-w-lg rounded-2xl border border-gray-200 bg-white p-5 shadow-xl dark:border-gray-800 dark:bg-gray-900 max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>

                {mode === "edit" && loadingAttr && (
                    <div className="py-4 text-gray-500 dark:text-gray-400">Завантаження...</div>
                )}

                {(mode === "create" || (mode === "edit" && editAttr)) && (
                    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                        <div>
                            <label className="mb-1 block text-theme-xs font-medium text-gray-600 dark:text-gray-400">
                                Назва *
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-theme-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                placeholder="Наприклад: Колір"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-theme-xs font-medium text-gray-600 dark:text-gray-400">
                                Slug (необовʼязково)
                            </label>
                            <input
                                type="text"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-theme-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                placeholder="color"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-theme-xs font-medium text-gray-600 dark:text-gray-400">
                                Тип даних *
                            </label>
                            <select
                                value={dataType}
                                onChange={(e) => setDataType(e.target.value as AttributeDataType)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-theme-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            >
                                {DATA_TYPES.map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-theme-xs font-medium text-gray-600 dark:text-gray-400">
                                Одиниця виміру (необовʼязково)
                            </label>
                            <input
                                type="text"
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-theme-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                placeholder="кг, см, ГБ"
                            />
                        </div>
                        {dataType === AttributeDataType.Enum && (
                            <div>
                                <div className="mb-1 flex items-center justify-between">
                                    <label className="text-theme-xs font-medium text-gray-600 dark:text-gray-400">
                                        Варіанти (для Enum)
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addOption}
                                        className="text-theme-xs text-blue-600 hover:underline dark:text-blue-400"
                                    >
                                        + Додати
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {options.map((opt, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={opt.value}
                                                onChange={(e) => setOptionValue(idx, e.target.value)}
                                                className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-theme-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                                placeholder="Значення"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeOption(idx)}
                                                className="rounded border border-red-200 px-2 py-1 text-theme-xs text-red-600 dark:border-red-800 dark:text-red-400"
                                            >
                                                Видалити
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {submitError && (
                            <div className="rounded-lg bg-red-50 px-3 py-2 text-theme-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                {submitError}
                            </div>
                        )}
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={submitting}
                                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-theme-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                            >
                                Скасувати
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-theme-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {submitting ? "Збереження..." : mode === "create" ? "Створити" : "Зберегти"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
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
    confirmClass?: string;
};

function ConfirmModal({
    open,
    title = "Підтвердити",
    description = "Ви впевнені?",
    confirmText = "Так",
    cancelText = "Скасувати",
    loading = false,
    onClose,
    onConfirm,
    confirmClass = "rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50",
}: ConfirmModalProps) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => !loading && onClose()} />
            <div className="relative w-[92%] max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-xl dark:border-gray-800 dark:bg-gray-900">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{description}</p>
                <div className="mt-5 flex justify-end gap-3">
                    <button
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                        onClick={onClose}
                        disabled={loading}
                    >
                        {cancelText}
                    </button>
                    <button className={confirmClass} onClick={onConfirm} disabled={loading}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

const DEBOUNCE_MS = 400;

export default function AdminAttributes() {
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setDebouncedSearch(searchInput.trim());
            setPage(1);
        }, DEBOUNCE_MS);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [searchInput]);

    const { data, isLoading, isFetching, error, refetch } = useGetAdminAttributesListQuery({
        page,
        pageSize,
        search: debouncedSearch || undefined,
    });
    const [deleteAttr, { isLoading: isDeleting }] = useDeleteAdminAttributeMutation();

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selected, setSelected] = useState<{ id: number; name: string } | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<"create" | "edit">("create");
    const [editId, setEditId] = useState<number | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!data) return;
        if (page > 1 && data.items.length === 0) setPage((p) => p - 1);
    }, [data, page]);

    const openCreate = () => {
        setFormMode("create");
        setEditId(null);
        setFormOpen(true);
    };
    const openEdit = (attr: AdminAttributeListItemDto) => {
        setFormMode("edit");
        setEditId(attr.id);
        setFormOpen(true);
    };
    const closeForm = () => setFormOpen(false);
    const handleFormSuccess = () => {
        setSuccessMessage("Атрибут збережено.");
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    const askDelete = (id: number, name: string) => {
        setSelected({ id, name });
        setConfirmOpen(true);
    };
    const closeConfirm = () => {
        if (!isDeleting) {
            setConfirmOpen(false);
            setSelected(null);
        }
    };
    const confirmDelete = async () => {
        if (!selected) return;
        try {
            await deleteAttr(selected.id).unwrap();
            setSuccessMessage("Атрибут видалено.");
            setTimeout(() => setSuccessMessage(null), 3000);
            closeConfirm();
        } catch {
            closeConfirm();
        }
    };

    const apiErrorText =
        (error as { data?: unknown })?.data != null
            ? typeof (error as { data: unknown }).data === "string"
                ? (error as { data: string }).data
                : JSON.stringify((error as { data: unknown }).data)
            : (error as { error?: string })?.error ?? "Помилка";

    const items = data?.items ?? [];

    return (
        <div className="rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Атрибути (довідник) {isFetching ? "(оновлення…)" : ""}
                    </h3>
                    {data && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Всього: {data.pagination.totalCount}
                        </p>
                    )}
                    {successMessage && (
                        <p className="mt-1 text-sm text-green-600 dark:text-green-400">{successMessage}</p>
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <input
                        type="search"
                        placeholder="Пошук за назвою або slug…"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="w-56 rounded-lg border border-gray-300 bg-white px-3 py-2 text-theme-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                    <button
                        className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-4 py-2.5 text-theme-sm font-medium text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                        onClick={openCreate}
                        disabled={isFetching}
                    >
                        Створити атрибут
                    </button>
                    <button
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
                        onClick={() => refetch()}
                        disabled={isFetching}
                    >
                        Оновити
                    </button>
                </div>
            </div>

            {isLoading && <div className="py-6 text-gray-500 dark:text-gray-400">Завантаження…</div>}
            {error && (
                <div className="py-6 text-red-600 dark:text-red-400">Помилка: {apiErrorText}</div>
            )}

            {!isLoading && !error && (
                <div className="max-w-full overflow-x-auto">
                    <Table>
                        <TableHeader className="border-y border-gray-100 dark:border-gray-800">
                            <TableRow>
                                <TableCell
                                    isHeader
                                    className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                                >
                                    ID
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                                >
                                    Назва
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                                >
                                    Slug
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                                >
                                    Тип
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                                >
                                    Одиниця
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                                >
                                    Дії
                                </TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {items.map((attr) => (
                                <TableRow key={attr.id}>
                                    <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                                        {attr.id}
                                    </TableCell>
                                    <TableCell className="py-3 text-theme-sm font-medium text-gray-800 dark:text-white/90">
                                        {attr.name}
                                    </TableCell>
                                    <TableCell className="py-3 text-theme-sm text-gray-600 dark:text-gray-300">
                                        {attr.slug ?? "—"}
                                    </TableCell>
                                    <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                                        {attr.dataType}
                                    </TableCell>
                                    <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                                        {attr.unit ?? "—"}
                                    </TableCell>
                                    <TableCell className="py-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-blue-700 shadow-theme-xs hover:bg-blue-50 dark:border-blue-700 dark:bg-gray-800 dark:text-blue-300 dark:hover:bg-white/[0.03]"
                                                onClick={() => openEdit(attr)}
                                                disabled={isDeleting}
                                            >
                                                Редагувати
                                            </button>
                                            <button
                                                className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-red-700 shadow-theme-xs hover:bg-red-50 disabled:opacity-50 dark:border-red-700 dark:bg-gray-800 dark:text-red-300 dark:hover:bg-white/[0.03]"
                                                onClick={() => askDelete(attr.id, attr.name)}
                                                disabled={isDeleting}
                                            >
                                                Видалити
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {items.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="py-6 text-gray-500 dark:text-gray-400"
                                    >
                                        Атрибутів не знайдено. Створіть перший атрибут.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {data && data.pagination.totalPages > 1 && (
                        <div className="mt-4 flex items-center justify-between">
                            <button
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-50 dark:border-gray-700"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => p - 1)}
                            >
                                Назад
                            </button>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Сторінка {data.pagination.currentPage} / {data.pagination.totalPages}
                            </div>
                            <button
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-50 dark:border-gray-700"
                                disabled={page >= data.pagination.totalPages}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Далі
                            </button>
                        </div>
                    )}
                </div>
            )}

            <ConfirmModal
                open={confirmOpen}
                title="Видалити атрибут?"
                description={
                    selected ? `Видалити «${selected.name}» (ID: ${selected.id})?` : "Ви впевнені?"
                }
                confirmText={isDeleting ? "Видалення…" : "Видалити"}
                cancelText="Скасувати"
                loading={isDeleting}
                onClose={closeConfirm}
                onConfirm={confirmDelete}
            />

            <AttributeFormModal
                open={formOpen}
                mode={formMode}
                editId={editId}
                onClose={closeForm}
                onSuccess={handleFormSuccess}
            />
        </div>
    );
}
