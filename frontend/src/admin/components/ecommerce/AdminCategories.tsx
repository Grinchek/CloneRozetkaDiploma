import { useEffect, useState, useCallback, useRef } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import {
    useDeleteCategoryMutation,
    useGetCategoriesPagedQuery,
    useGetCategoriesQuery,
    useGetCategoryByIdQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useRestoreCategoryMutation,
    type CategoryDto,
    type CreateCategoryForm,
    type UpdateCategoryForm,
} from "../../../features/categories/api/categoryApi";
import { buildCategoryIconCandidates } from "../../../features/categories/utils/categoryImageUrl";
import { slugify, isSlugValid } from "../../../features/categories/utils/slugify";

function CategoryImage({ image }: { image: string | null }) {
    const candidates = buildCategoryIconCandidates(image);
    const [idx, setIdx] = useState(0);
    const src = candidates[idx] ?? null;
    if (!src) return <div className="h-[50px] w-[50px] rounded-md bg-gray-100 dark:bg-gray-800" />;
    return (
        <img
            src={src}
            className="h-[50px] w-[50px] object-cover rounded-md bg-gray-100 dark:bg-gray-800"
            alt=""
            onError={() => setIdx((i) => (i + 1 < candidates.length ? i + 1 : i))}
        />
    );
}

type FormModalProps = {
    open: boolean;
    mode: "create" | "edit";
    editId: number | null;
    onClose: () => void;
    onSuccess: () => void;
};

function CategoryFormModal({ open, mode, editId, onClose, onSuccess }: FormModalProps) {
    const { data: editCategory, isLoading: loadingCategory } = useGetCategoryByIdQuery(
        editId ?? 0,
        { skip: !open || mode !== "edit" || editId == null }
    );
    const { data: allCategories = [] } = useGetCategoriesQuery(undefined, { skip: !open });
    const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
    const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();

    const [name, setName] = useState("");
    const [priority, setPriority] = useState(0);
    const [urlSlug, setUrlSlug] = useState("");
    const [parentId, setParentId] = useState<number | "">("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [slugError, setSlugError] = useState<string | null>(null);

    const submitting = isCreating || isUpdating;

    const resetForm = useCallback(() => {
        setName("");
        setPriority(0);
        setUrlSlug("");
        setParentId("");
        setImageFile(null);
        setSubmitError(null);
        setSlugError(null);
    }, []);

    useEffect(() => {
        if (!open) {
            resetForm();
            return;
        }
        if (mode === "edit" && editCategory) {
            setName(editCategory.name);
            setPriority(editCategory.priority);
            setUrlSlug(editCategory.urlSlug);
            setParentId(editCategory.parentId ?? "");
            setImageFile(null);
            setSubmitError(null);
            setSlugError(null);
        } else if (mode === "create") {
            resetForm();
        }
    }, [open, mode, editId, editCategory, resetForm]);

    const handleGenerateSlug = () => {
        setSlugError(null);
        const result = slugify(name);
        setUrlSlug(result);
        if (!result) setSlugError("Slug is empty, please enter manually.");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);
        setSlugError(null);
        const slug = urlSlug.trim();
        if (!isSlugValid(slug)) {
            setSlugError(
                slug ? "UrlSlug may contain lowercase letters, digits, '-' or '_'." : "Url slug is required."
            );
            return;
        }
        const parent = parentId === "" ? undefined : (parentId as number);
        if (mode === "create") {
            const body: CreateCategoryForm = {
                name: name.trim(),
                priority: Number(priority) || 0,
                urlSlug: slug,
                parentId: parent ?? null,
                image: imageFile ?? undefined,
            };
            try {
                await createCategory(body).unwrap();
                onSuccess();
                onClose();
            } catch (err: any) {
                const msg = err?.data?.title ?? err?.data ?? err?.message ?? "Failed to create";
                setSubmitError(String(msg));
            }
        } else if (editId != null) {
            const body: UpdateCategoryForm = {
                id: editId,
                name: name.trim(),
                priority: Number(priority) || 0,
                urlSlug: slug,
                parentId: parent ?? null,
                image: imageFile ?? undefined,
            };
            try {
                await updateCategory(body).unwrap();
                onSuccess();
                onClose();
            } catch (err: any) {
                const msg = err?.data?.title ?? err?.data ?? err?.message ?? "Failed to update";
                setSubmitError(String(msg));
            }
        }
    };

    if (!open) return null;

    const title = mode === "create" ? "Create category" : "Edit category";
    const parentOptions = allCategories.filter((c) => mode !== "edit" || c.id !== editId);

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => !submitting && onClose()} />
            <div className="relative w-[92%] max-w-lg rounded-2xl border border-gray-200 bg-white p-5 shadow-xl dark:border-gray-800 dark:bg-gray-900 max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>

                {mode === "edit" && loadingCategory && (
                    <div className="py-4 text-gray-500 dark:text-gray-400">Loading...</div>
                )}

                {(mode === "create" || (mode === "edit" && editCategory)) && (
                    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                        <div>
                            <label className="block text-theme-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                Name *
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-theme-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                placeholder="Category name"
                            />
                        </div>
                        <div>
                            <label className="block text-theme-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                Priority
                            </label>
                            <input
                                type="number"
                                min={0}
                                value={priority}
                                onChange={(e) => setPriority(Number(e.target.value) || 0)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-theme-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-theme-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                Url slug * (e.g. notebooks, smartphones)
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={urlSlug}
                                    onChange={(e) => {
                                        setUrlSlug(e.target.value);
                                        setSlugError(null);
                                    }}
                                    required
                                    className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-theme-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    placeholder="url-slug"
                                />
                                <button
                                    type="button"
                                    onClick={handleGenerateSlug}
                                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-theme-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-white/5"
                                >
                                    From name
                                </button>
                            </div>
                            {slugError && (
                                <p className="mt-1 text-theme-xs text-red-600 dark:text-red-400" role="alert">
                                    {slugError}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-theme-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                Parent category
                            </label>
                            <select
                                value={parentId === "" ? "" : parentId}
                                onChange={(e) => setParentId(e.target.value === "" ? "" : Number(e.target.value))}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-theme-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            >
                                <option value="">(None)</option>
                                {parentOptions.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-theme-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                Image (optional)
                            </label>
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/webp"
                                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-theme-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            />
                            {mode === "edit" && editCategory?.image && !imageFile && (
                                <p className="mt-1 text-theme-xs text-gray-500 dark:text-gray-400">
                                    Current: {editCategory.image}
                                </p>
                            )}
                        </div>
                        {submitError && (
                            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-theme-sm px-3 py-2">
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
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-theme-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {submitting ? "Saving..." : mode === "create" ? "Create" : "Save"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

type FilterStatus = "all" | "active" | "deleted";

const DEBOUNCE_MS = 400;

export default function AdminCategories() {
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [filter, setFilter] = useState<FilterStatus>("active");
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

    const queryParams = {
        page,
        pageSize,
        search: debouncedSearch || undefined,
        isDeleted: filter === "all" ? undefined : filter === "deleted",
    };
    const { data, isLoading, isFetching, error, refetch } = useGetCategoriesPagedQuery(queryParams);
    const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();
    const [restoreCategory, { isLoading: isRestoring }] = useRestoreCategoryMutation();

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selected, setSelected] = useState<{ id: number; name: string } | null>(null);
    const [confirmRestoreOpen, setConfirmRestoreOpen] = useState(false);
    const [selectedRestore, setSelectedRestore] = useState<{ id: number; name: string } | null>(null);

    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<"create" | "edit">("create");
    const [editId, setEditId] = useState<number | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!data) return;
        if (page > 1 && data.items.length === 0) setPage((p) => p - 1);
    }, [data, page]);

    useEffect(() => setPage(1), [filter]);

    const openCreate = () => {
        setFormMode("create");
        setEditId(null);
        setFormOpen(true);
    };
    const openEdit = (cat: CategoryDto) => {
        setFormMode("edit");
        setEditId(cat.id);
        setFormOpen(true);
    };
    const closeForm = () => setFormOpen(false);

    const handleFormSuccess = () => {
        setSuccessMessage("Category saved.");
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    const askDelete = (id: number, name: string) => {
        setSelected({ id, name });
        setConfirmOpen(true);
    };

    const closeConfirm = () => {
        if (!mutating) {
            setConfirmOpen(false);
            setSelected(null);
        }
    };

    const confirmDelete = async () => {
        if (!selected) return;
        try {
            await deleteCategory(selected.id).unwrap();
            setSuccessMessage("Category deleted.");
            setTimeout(() => setSuccessMessage(null), 3000);
            closeConfirm();
        } catch {
            closeConfirm();
        }
    };

    const askRestore = (id: number, name: string) => {
        setSelectedRestore({ id, name });
        setConfirmRestoreOpen(true);
    };

    const closeConfirmRestore = () => {
        if (!mutating) {
            setConfirmRestoreOpen(false);
            setSelectedRestore(null);
        }
    };

    const confirmRestore = async () => {
        if (!selectedRestore) return;
        try {
            await restoreCategory(selectedRestore.id).unwrap();
            setSuccessMessage("Category restored.");
            setTimeout(() => setSuccessMessage(null), 3000);
            closeConfirmRestore();
        } catch {
            closeConfirmRestore();
        }
    };

    const mutating = isDeleting || isRestoring;

    const apiErrorText =
        (error as any)?.data
            ? typeof (error as any).data === "string"
                ? (error as any).data
                : JSON.stringify((error as any).data)
            : (error as any)?.error ?? "Unknown error";

    const items = data?.items ?? [];

    return (
        <div className="rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Categories {isFetching ? "(updating...)" : ""}
                    </h3>
                    {data && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Total: {data.pagination.totalCount}
                        </p>
                    )}
                    {successMessage && (
                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">{successMessage}</p>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <input
                        type="search"
                        placeholder="Search by name or slug..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-theme-sm w-56 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                    <div className="flex rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden">
                        {(["active", "deleted", "all"] as const).map((f) => (
                            <button
                                key={f}
                                type="button"
                                onClick={() => setFilter(f)}
                                className={`px-3 py-2 text-theme-sm font-medium capitalize ${filter === f ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <button
                        className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-4 py-2.5 text-theme-sm font-medium text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                        onClick={openCreate}
                        disabled={isFetching}
                    >
                        Create category
                    </button>
                    <button
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
                        onClick={() => refetch()}
                        disabled={isFetching}
                    >
                        Refresh
                    </button>
                    <button
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
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
                                    Category
                                </TableCell>
                                <TableCell isHeader className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                                    ID
                                </TableCell>
                                <TableCell isHeader className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                                    Slug
                                </TableCell>
                                <TableCell isHeader className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                                    Priority
                                </TableCell>
                                <TableCell isHeader className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                                    Parent
                                </TableCell>
                                <TableCell isHeader className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                                    Status
                                </TableCell>
                                <TableCell isHeader className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {items.map((cat) => (
                                <TableRow key={cat.id}>
                                    <TableCell className="py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-[50px] w-[50px] overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800 shrink-0">
                                                <CategoryImage image={cat.image} />
                                            </div>
                                            <div>
                                                <p className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
                                                    {cat.name}
                                                </p>
                                                <span className="text-theme-xs text-gray-500 dark:text-gray-400">
                                                    {cat.image || "—"}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                                        {cat.id}
                                    </TableCell>
                                    <TableCell className="py-3 text-theme-sm text-gray-600 dark:text-gray-300">
                                        {cat.urlSlug}
                                    </TableCell>
                                    <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                                        {cat.priority}
                                    </TableCell>
                                    <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                                        {cat.parentId ?? "—"}
                                    </TableCell>
                                    <TableCell className="py-3">
                                        {cat.isDeleted ? (
                                            <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-theme-xs font-medium text-red-800 dark:bg-red-900/40 dark:text-red-300">
                                                Deleted
                                            </span>
                                        ) : (
                                            <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-theme-xs font-medium text-green-800 dark:bg-green-900/40 dark:text-green-300">
                                                Active
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="py-3">
                                        <div className="flex items-center gap-2">
                                            {cat.isDeleted ? (
                                                <button
                                                    className="inline-flex items-center gap-2 rounded-lg border border-green-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-green-700 shadow-theme-xs hover:bg-green-50 disabled:opacity-50 dark:border-green-700 dark:bg-gray-800 dark:text-green-300 dark:hover:bg-white/[0.03]"
                                                    onClick={() => askRestore(cat.id, cat.name)}
                                                    disabled={mutating}
                                                >
                                                    Restore
                                                </button>
                                            ) : (
                                                <>
                                                    <button
                                                        className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-blue-700 shadow-theme-xs hover:bg-blue-50 dark:border-blue-700 dark:bg-gray-800 dark:text-blue-300 dark:hover:bg-white/[0.03]"
                                                        onClick={() => openEdit(cat)}
                                                        disabled={mutating}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-red-700 shadow-theme-xs hover:bg-red-50 disabled:opacity-50 dark:border-red-700 dark:bg-gray-800 dark:text-red-300 dark:hover:bg-white/[0.03]"
                                                        onClick={() => askDelete(cat.id, cat.name)}
                                                        disabled={mutating}
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {items.length === 0 && (
                                <TableRow>
                                    <TableCell className="py-6 text-gray-500 dark:text-gray-400">
                                        No categories found
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
                                Prev
                            </button>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Page {data.pagination.currentPage} / {data.pagination.totalPages}
                            </div>
                            <button
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-50 dark:border-gray-700"
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
                title="Delete category?"
                description={selected ? `Delete "${selected.name}" (ID: ${selected.id})?` : "Are you sure?"}
                confirmText={isDeleting ? "Deleting..." : "Delete"}
                cancelText="Cancel"
                loading={mutating}
                onClose={closeConfirm}
                onConfirm={confirmDelete}
            />

            <ConfirmModal
                open={confirmRestoreOpen}
                title="Restore category?"
                description={selectedRestore ? `Restore "${selectedRestore.name}" (ID: ${selectedRestore.id})?` : "Are you sure?"}
                confirmText={isRestoring ? "Restoring..." : "Restore"}
                cancelText="Cancel"
                loading={mutating}
                onClose={closeConfirmRestore}
                onConfirm={confirmRestore}
                confirmClass="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            />

            <CategoryFormModal
                open={formOpen}
                mode={formMode}
                editId={editId}
                onClose={closeForm}
                onSuccess={handleFormSuccess}
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
    confirmClass?: string;
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
    confirmClass = "rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50",
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
                        className={confirmClass}
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
