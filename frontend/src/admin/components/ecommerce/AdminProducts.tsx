import { useEffect, useState, useCallback, useRef } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import {
    useDeleteProductMutation,
    useGetProductsPagedQuery,
    useGetProductByIdQuery,
    useCreateProductMutation,
    useUpdateProductMutation,
    useRestoreProductMutation,
    type ProductListItemDto,
    type CreateProductForm,
    type UpdateProductForm,
} from "../../../features/products/api/productApi";
import {
    useGetCategoryAttributesQuery,
    useGetProductAttributesQuery,
    useSetProductAttributesMutation,
    type CategoryAttributeItemDto,
    type ProductAttributeValueUpsertItem,
    AttributeDataType,
} from "../../../features/products/api/productAttributesApi";
import { useGetCategoriesQuery } from "../../../features/categories/api/categoryApi";
import { buildProductImageCandidates } from "../../../features/products/utils/productImageUrl";
import { slugify, isSlugValid } from "../../../features/categories/utils/slugify";

function ProductImage({ imageName }: { imageName: string | null | undefined }) {
    const candidates = buildProductImageCandidates(imageName ?? null);
    const [idx, setIdx] = useState(0);
    const src = candidates[idx] ?? null;
    if (!src)
        return (
            <div className="h-[50px] w-[50px] shrink-0 rounded-md bg-gray-100 dark:bg-gray-800" />
        );
    return (
        <img
            src={src}
            className="h-[50px] w-[50px] shrink-0 object-cover rounded-md bg-gray-100 dark:bg-gray-800"
            alt=""
            onError={() => setIdx((i) => (i + 1 < candidates.length ? i + 1 : i))}
        />
    );
}

type AttributeValuePatch = Partial<Omit<ProductAttributeValueUpsertItem, "attributeId">>;

function ProductAttributeField({
    attr,
    value,
    onChange,
}: {
    attr: CategoryAttributeItemDto;
    value: AttributeValuePatch | undefined;
    onChange: (patch: AttributeValuePatch) => void;
}) {
    const label = attr.unit ? `${attr.name} (${attr.unit})` : attr.name;
    const requiredMark = attr.isRequired ? " *" : "";

    if (attr.dataType === AttributeDataType.String) {
        return (
            <div>
                <label className="mb-1 block text-theme-xs font-medium text-gray-600 dark:text-gray-400">
                    {label}{requiredMark}
                </label>
                <input
                    type="text"
                    value={value?.valueString ?? ""}
                    onChange={(e) => onChange({ valueString: e.target.value || null })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-theme-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder={attr.name}
                />
            </div>
        );
    }
    if (attr.dataType === AttributeDataType.Number) {
        const numVal = value?.valueNumber;
        return (
            <div>
                <label className="mb-1 block text-theme-xs font-medium text-gray-600 dark:text-gray-400">
                    {label}{requiredMark}
                </label>
                <input
                    type="number"
                    step="any"
                    value={numVal !== undefined && numVal !== null ? String(numVal) : ""}
                    onChange={(e) => {
                        const v = e.target.value.trim();
                        onChange({ valueNumber: v === "" ? null : parseFloat(v) });
                    }}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-theme-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder={attr.unit ?? "0"}
                />
            </div>
        );
    }
    if (attr.dataType === AttributeDataType.Bool) {
        const checked = value?.valueBool ?? false;
        return (
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id={`attr-${attr.attributeId}`}
                    checked={!!checked}
                    onChange={(e) => onChange({ valueBool: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                />
                <label
                    htmlFor={`attr-${attr.attributeId}`}
                    className="text-theme-sm font-medium text-gray-600 dark:text-gray-400"
                >
                    {label}{requiredMark}
                </label>
            </div>
        );
    }
    if (attr.dataType === AttributeDataType.Enum) {
        return (
            <div>
                <label className="mb-1 block text-theme-xs font-medium text-gray-600 dark:text-gray-400">
                    {label}{requiredMark}
                </label>
                <select
                    value={value?.optionId != null ? String(value.optionId) : ""}
                    onChange={(e) => {
                        const v = e.target.value;
                        onChange({ optionId: v === "" ? null : Number(v) });
                    }}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-theme-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                    <option value="">— Select —</option>
                    {attr.options.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                            {opt.value}
                        </option>
                    ))}
                </select>
            </div>
        );
    }
    return null;
}

type ProductFormModalProps = {
    open: boolean;
    mode: "create" | "edit";
    editId: number | null;
    onClose: () => void;
    onSuccess: () => void;
};

function ProductFormModal({
    open,
    mode,
    editId,
    onClose,
    onSuccess,
}: ProductFormModalProps) {
    const { data: editProduct, isLoading: loadingProduct } = useGetProductByIdQuery(
        editId ?? 0,
        { skip: !open || mode !== "edit" || editId == null }
    );
    const { data: categories = [] } = useGetCategoriesQuery(undefined, { skip: !open });
    const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
    const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
    const [setProductAttributes, { isLoading: isSettingAttributes }] = useSetProductAttributesMutation();

    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId] = useState<number | "">("");
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [attributeValues, setAttributeValues] = useState<
        Record<number, Partial<Omit<ProductAttributeValueUpsertItem, "attributeId">>>
    >({});
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [slugError, setSlugError] = useState<string | null>(null);
    const initedAttributesRef = useRef(false);
    const lastSyncedEditIdRef = useRef<number | null>(null);

    const effectiveCategoryId = categoryId !== "" ? categoryId : (editProduct?.categoryId ?? 0);
    const { data: categoryAttributes = [] } = useGetCategoryAttributesQuery(
        effectiveCategoryId as number,
        { skip: !open || effectiveCategoryId <= 0 }
    );
    const { data: productAttributes = [] } = useGetProductAttributesQuery(editId ?? 0, {
        skip: !open || mode !== "edit" || editId == null,
    });

    const submitting = isCreating || isUpdating || isSettingAttributes;

    const resetForm = useCallback(() => {
        setName("");
        setSlug("");
        setPrice("");
        setDescription("");
        setCategoryId("");
        setImageFiles([]);
        setAttributeValues({});
        setSubmitError(null);
        setSlugError(null);
    }, []);

    useEffect(() => {
        if (!open) {
            initedAttributesRef.current = false;
            lastSyncedEditIdRef.current = null;
            resetForm();
            return;
        }
        if (mode === "edit" && editProduct && editId != null) {
            if (lastSyncedEditIdRef.current !== editId) {
                lastSyncedEditIdRef.current = editId;
                setName(editProduct.name);
                setSlug(editProduct.slug);
                setPrice(String(editProduct.price));
                setDescription(editProduct.description ?? "");
                setCategoryId(editProduct.categoryId);
                setImageFiles([]);
                setSubmitError(null);
                setSlugError(null);
            }
        } else if (mode === "create") {
            resetForm();
        }
    }, [open, mode, editId, editProduct, resetForm]);

    // Sync attribute values from product when editing (once per open)
    const productAttributesKey = editId != null && productAttributes.length >= 0 ? `${editId}-${productAttributes.length}` : "";
    useEffect(() => {
        if (!open) return;
        if (mode === "create") {
            setAttributeValues({});
            return;
        }
        if (
            mode === "edit" &&
            editId != null &&
            categoryAttributes.length > 0 &&
            productAttributes.length >= 0 &&
            !initedAttributesRef.current
        ) {
            initedAttributesRef.current = true;
            const next: Record<number, Partial<Omit<ProductAttributeValueUpsertItem, "attributeId">>> = {};
            for (const pav of productAttributes) {
                next[pav.attributeId] = {
                    valueString: pav.valueString ?? undefined,
                    valueNumber: pav.valueNumber ?? undefined,
                    valueBool: pav.valueBool ?? undefined,
                    optionId: pav.optionId ?? undefined,
                };
            }
            setAttributeValues(next);
        }
    }, [open, mode, editId, categoryAttributes.length, productAttributesKey]);

    const handleGenerateSlug = () => {
        setSlugError(null);
        const result = slugify(name);
        setSlug(result);
        if (!result) setSlugError("Slug is empty, please enter manually.");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);
        setSlugError(null);
        const slugTrim = slug.trim();
        if (!isSlugValid(slugTrim)) {
            setSlugError(
                slugTrim
                    ? "Slug may contain lowercase letters, digits, '-' or '_'."
                    : "Slug is required."
            );
            return;
        }
        const priceNum = parseFloat(price.replace(",", "."));
        if (Number.isNaN(priceNum) || priceNum <= 0) {
            setSubmitError("Price must be a number greater than 0.");
            return;
        }
        const catId = categoryId === "" ? 0 : categoryId;
        if (!catId) {
            setSubmitError("Category is required.");
            return;
        }

        if (mode === "create") {
            const body: CreateProductForm = {
                name: name.trim(),
                slug: slugTrim,
                price: priceNum,
                description: description.trim() || null,
                categoryId: catId,
                images: imageFiles.length ? imageFiles : undefined,
            };
            try {
                const newId = await createProduct(body).unwrap();
                if (categoryAttributes.length > 0 && newId != null) {
                    const values = categoryAttributes.map((a) => ({
                        attributeId: a.attributeId,
                        valueString: attributeValues[a.attributeId]?.valueString ?? null,
                        valueNumber: attributeValues[a.attributeId]?.valueNumber ?? null,
                        valueBool: attributeValues[a.attributeId]?.valueBool ?? null,
                        optionId: attributeValues[a.attributeId]?.optionId ?? null,
                    }));
                    await setProductAttributes({ productId: newId, body: { values } }).unwrap();
                }
                onSuccess();
                onClose();
            } catch (err: unknown) {
                const msg =
                    (err as { data?: { title?: string } })?.data?.title ??
                    (err as { data?: unknown })?.data ??
                    (err as Error)?.message ??
                    "Failed to create product.";
                setSubmitError(String(msg));
            }
        } else if (editId != null) {
            const body: UpdateProductForm = {
                name: name.trim(),
                slug: slugTrim,
                price: priceNum,
                description: description.trim() || null,
                categoryId: catId,
                newImages: imageFiles.length ? imageFiles : undefined,
            };
            try {
                await updateProduct({ id: editId, body }).unwrap();
                if (categoryAttributes.length > 0) {
                    const values = categoryAttributes.map((a) => ({
                        attributeId: a.attributeId,
                        valueString: attributeValues[a.attributeId]?.valueString ?? null,
                        valueNumber: attributeValues[a.attributeId]?.valueNumber ?? null,
                        valueBool: attributeValues[a.attributeId]?.valueBool ?? null,
                        optionId: attributeValues[a.attributeId]?.optionId ?? null,
                    }));
                    await setProductAttributes({ productId: editId, body: { values } }).unwrap();
                }
                onSuccess();
                onClose();
            } catch (err: unknown) {
                const msg =
                    (err as { data?: { title?: string } })?.data?.title ??
                    (err as { data?: unknown })?.data ??
                    (err as Error)?.message ??
                    "Failed to update product.";
                setSubmitError(String(msg));
            }
        }
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files?.length) return;
        setImageFiles(Array.from(files));
    };

    if (!open) return null;

    const title = mode === "create" ? "Create product" : "Edit product";

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/50"
                onClick={() => !submitting && onClose()}
            />
            <div className="relative w-[92%] max-w-lg rounded-2xl border border-gray-200 bg-white p-5 shadow-xl dark:border-gray-800 dark:bg-gray-900 max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>

                {mode === "edit" && loadingProduct && (
                    <div className="py-4 text-gray-500 dark:text-gray-400">Loading...</div>
                )}

                {(mode === "create" || (mode === "edit" && editProduct)) && (
                    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                        <div>
                            <label className="mb-1 block text-theme-xs font-medium text-gray-600 dark:text-gray-400">
                                Name *
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-theme-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                placeholder="Product name"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-theme-xs font-medium text-gray-600 dark:text-gray-400">
                                Url slug *
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={slug}
                                    onChange={(e) => {
                                        setSlug(e.target.value);
                                        setSlugError(null);
                                    }}
                                    required
                                    className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-theme-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    placeholder="product-slug"
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
                                <p
                                    className="mt-1 text-theme-xs text-red-600 dark:text-red-400"
                                    role="alert"
                                >
                                    {slugError}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="mb-1 block text-theme-xs font-medium text-gray-600 dark:text-gray-400">
                                Price * (decimal)
                            </label>
                            <input
                                type="text"
                                inputMode="decimal"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-theme-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-theme-xs font-medium text-gray-600 dark:text-gray-400">
                                Description (optional)
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-theme-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                placeholder="Product description"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-theme-xs font-medium text-gray-600 dark:text-gray-400">
                                Category *
                            </label>
                            <select
                                value={categoryId === "" ? "" : categoryId}
                                onChange={(e) => {
                                    const v = e.target.value === "" ? "" : Number(e.target.value);
                                    setCategoryId(v);
                                    setAttributeValues({});
                                }}
                                required
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-theme-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            >
                                <option value="">Select category</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50/50 p-3 dark:border-gray-700 dark:bg-gray-800/30">
                            <h4 className="text-theme-sm font-medium text-gray-700 dark:text-gray-300">
                                Атрибути товару
                            </h4>
                            {categoryAttributes.length > 0 ? (
                                categoryAttributes.map((attr) => (
                                    <ProductAttributeField
                                        key={attr.attributeId}
                                        attr={attr}
                                        value={attributeValues[attr.attributeId]}
                                        onChange={(patch) =>
                                            setAttributeValues((prev) => ({
                                                ...prev,
                                                [attr.attributeId]: { ...prev[attr.attributeId], ...patch },
                                            }))
                                        }
                                    />
                                ))
                            ) : (
                                <p className="text-theme-xs text-gray-500 dark:text-gray-400">
                                    Для цієї категорії атрибути не налаштовані. Додайте їх у розділі «Категорії» → виберіть категорію → «Привʼязки атрибутів».
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="mb-1 block text-theme-xs font-medium text-gray-600 dark:text-gray-400">
                                {mode === "create" ? "Images (optional)" : "Add new images (optional)"}
                            </label>
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/webp"
                                multiple={mode === "create"}
                                onChange={onFileChange}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-theme-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            />
                            {mode === "create" && imageFiles.length > 0 && (
                                <p className="mt-1 text-theme-xs text-gray-500 dark:text-gray-400">
                                    {imageFiles.length} file(s) selected
                                </p>
                            )}
                            {mode === "edit" && editProduct?.imageUrls?.length ? (
                                <p className="mt-1 text-theme-xs text-gray-500 dark:text-gray-400">
                                    Current: {editProduct.imageUrls.length} image(s). Add files above to append.
                                </p>
                            ) : null}
                            {mode === "edit" && imageFiles.length > 0 && (
                                <p className="mt-1 text-theme-xs text-gray-500 dark:text-gray-400">
                                    {imageFiles.length} new file(s) will be added
                                </p>
                            )}
                        </div>
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
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-theme-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {submitting
                                    ? "Saving..."
                                    : mode === "create"
                                      ? "Create"
                                      : "Save"}
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

const DEBOUNCE_MS = 400;
type FilterStatus = "all" | "active" | "deleted";

export default function AdminProducts() {
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
    const { data, isLoading, isFetching, error, refetch } = useGetProductsPagedQuery(queryParams);
    const { data: categories = [] } = useGetCategoriesQuery();
    const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
    const [restoreProduct, { isLoading: isRestoring }] = useRestoreProductMutation();

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

    const categoryNameById = Object.fromEntries(categories.map((c) => [c.id, c.name]));

    const openCreate = () => {
        setFormMode("create");
        setEditId(null);
        setFormOpen(true);
    };

    const openEdit = (p: ProductListItemDto) => {
        setFormMode("edit");
        setEditId(p.id);
        setFormOpen(true);
    };

    const closeForm = () => setFormOpen(false);

    const handleFormSuccess = () => {
        setSuccessMessage("Product saved.");
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
            await deleteProduct(selected.id).unwrap();
            setSuccessMessage("Product deleted.");
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
            await restoreProduct(selectedRestore.id).unwrap();
            setSuccessMessage("Product restored.");
            setTimeout(() => setSuccessMessage(null), 3000);
            closeConfirmRestore();
        } catch {
            closeConfirmRestore();
        }
    };

    const mutating = isDeleting || isRestoring;

    const apiErrorText =
        (error as { data?: unknown })?.data != null
            ? typeof (error as { data: unknown }).data === "string"
                ? (error as { data: string }).data
                : JSON.stringify((error as { data: unknown }).data)
            : (error as { error?: string })?.error ?? "Unknown error";

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
                    {successMessage && (
                        <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                            {successMessage}
                        </p>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <input
                        type="search"
                        placeholder="Search by name or slug..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="w-56 rounded-lg border border-gray-300 bg-white px-3 py-2 text-theme-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                    <div className="flex overflow-hidden rounded-lg border border-gray-300 dark:border-gray-700">
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
                        Create product
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

            {isLoading && (
                <div className="py-6 text-gray-500 dark:text-gray-400">Loading...</div>
            )}
            {error && (
                <div className="py-6 text-red-600 dark:text-red-400">
                    Error: {apiErrorText}
                </div>
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
                                    Product
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                                >
                                    Price
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                                >
                                    Category
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
                                    Status
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                                >
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {items.map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell className="py-3">
                                        <div className="flex items-center gap-3">
                                            <ProductImage imageName={p.mainImageUrl} />
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
                                        {categoryNameById[p.categoryId] ?? p.categoryId}
                                    </TableCell>
                                    <TableCell className="py-3 text-theme-sm text-gray-600 dark:text-gray-300">
                                        {p.slug}
                                    </TableCell>
                                    <TableCell className="py-3">
                                        {p.isDeleted ? (
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
                                            {p.isDeleted ? (
                                                <button
                                                    className="inline-flex items-center gap-2 rounded-lg border border-green-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-green-700 shadow-theme-xs hover:bg-green-50 disabled:opacity-50 dark:border-green-700 dark:bg-gray-800 dark:text-green-300 dark:hover:bg-white/[0.03]"
                                                    onClick={() => askRestore(p.id, p.name)}
                                                    disabled={mutating}
                                                >
                                                    Restore
                                                </button>
                                            ) : (
                                                <>
                                                    <button
                                                        className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-blue-700 shadow-theme-xs hover:bg-blue-50 dark:border-blue-700 dark:bg-gray-800 dark:text-blue-300 dark:hover:bg-white/[0.03]"
                                                        onClick={() => openEdit(p)}
                                                        disabled={mutating}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-red-700 shadow-theme-xs hover:bg-red-50 disabled:opacity-50 dark:border-red-700 dark:bg-gray-800 dark:text-red-300 dark:hover:bg-white/[0.03]"
                                                        onClick={() => askDelete(p.id, p.name)}
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
                                    <TableCell
                                        colSpan={6}
                                        className="py-6 text-gray-500 dark:text-gray-400"
                                    >
                                        No products found
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
                title="Delete product?"
                description={
                    selected
                        ? `Delete "${selected.name}" (ID: ${selected.id})?`
                        : "Are you sure?"
                }
                confirmText={isDeleting ? "Deleting..." : "Delete"}
                cancelText="Cancel"
                loading={mutating}
                onClose={closeConfirm}
                onConfirm={confirmDelete}
            />

            <ConfirmModal
                open={confirmRestoreOpen}
                title="Restore product?"
                description={
                    selectedRestore
                        ? `Restore "${selectedRestore.name}" (ID: ${selectedRestore.id})?`
                        : "Are you sure?"
                }
                confirmText={isRestoring ? "Restoring..." : "Restore"}
                cancelText="Cancel"
                loading={mutating}
                onClose={closeConfirmRestore}
                onConfirm={confirmRestore}
                confirmClass="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            />

            <ProductFormModal
                open={formOpen}
                mode={formMode}
                editId={editId}
                onClose={closeForm}
                onSuccess={handleFormSuccess}
            />
        </div>
    );
}
