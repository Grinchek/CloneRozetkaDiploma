import {
    useEffect,
    useState,
    type ChangeEvent,
    type FormEvent,
} from "react";
import "../styles/admin.css";
import CategoryTree from "../features/categories/components/CategoryTree";
import type { CategoryNode } from "../features/categories/utils/buildTree";

import {
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
} from "../features/categories/api/categoryApi";

type SelectedCategory = { id: number; name: string } | null;
const STORAGE_KEY = "selectedCategory";

type CategoryFormMode = "create" | "edit";

type CategoryFormState = {
    name: string;
    priority: number;
    slug: string;
    parentId: string;   // зберігаємо як string для select
    imageUrl: string;
    imageFile: File | null;
};

type FlatCategory = {
    id: number;
    name: string;
};

const initialForm: CategoryFormState = {
    name: "",
    priority: 0,
    slug: "",
    parentId: "",
    imageUrl: "",
    imageFile: null,
};

const AdminCategoriesSection = () => {
    const [selectedCategory, setSelectedCategory] =
        useState<SelectedCategory>(() => {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                if (!raw) return null;
                const parsed = JSON.parse(raw);
                if (
                    parsed &&
                    typeof parsed.id === "number" &&
                    typeof parsed.name === "string"
                ) {
                    return { id: parsed.id, name: parsed.name };
                }
            } catch {
                // ignore
            }
            return null;
        });

    const [mode, setMode] = useState<CategoryFormMode>(
        selectedCategory ? "edit" : "create"
    );
    const [form, setForm] = useState<CategoryFormState>(initialForm);

    // всі категорії з дерева – для селекта батька
    const [allCategories, setAllCategories] = useState<FlatCategory[]>([]);

    const [createCategory, { isLoading: isCreating }] =
        useCreateCategoryMutation();
    const [updateCategory, { isLoading: isUpdating }] =
        useUpdateCategoryMutation();
    const [deleteCategory, { isLoading: isDeleting }] =
        useDeleteCategoryMutation();

    const submitting = isCreating || isUpdating || isDeleting;

    useEffect(() => {
        if (selectedCategory) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedCategory));
            setMode("edit");
        } else {
            localStorage.removeItem(STORAGE_KEY);
            setMode("create");
            setForm(initialForm);
        }
    }, [selectedCategory]);

    // отримуємо всі категорії від CategoryTree
    const handleCategoriesLoaded = (nodes: CategoryNode[]) => {
        const flat: FlatCategory[] = [];

        const walk = (list: CategoryNode[]) => {
            for (const n of list) {
                flat.push({ id: n.id, name: n.name });
                if (n.children && n.children.length > 0) {
                    walk(n.children);
                }
            }
        };

        walk(nodes);
        setAllCategories(flat);
    };

    // клік по категорії в дереві
    const handleSelectCategory = (node: CategoryNode) => {
        const anyNode = node as any;
        const parentId = (anyNode.parentId as number | undefined) ?? null;

        setSelectedCategory({ id: node.id, name: node.name });

        setForm({
            name: node.name ?? "",
            priority: node.priority ?? 0,
            slug:
                (anyNode.slug as string | undefined) ??
                (anyNode.urlSlug as string | undefined) ??
                "",
            parentId: parentId ? parentId.toString() : "",
            imageUrl:
                (anyNode.imageUrl as string | undefined) ??
                (anyNode.image as string | undefined) ??
                "",
            imageFile: null,
        });
    };

    const handleInputChange = (
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setForm((prev) => ({
            ...prev,
            imageFile: file,
        }));
    };

    const handleResetToCreate = () => {
        setSelectedCategory(null);
        setForm(initialForm);
        setMode("create");
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (submitting) return;

        const parentId = form.parentId ? Number(form.parentId) : null;
        const name = form.name.trim();
        const priority = Number(form.priority) || 0;
        const urlSlug = form.slug.trim();
        const image = form.imageFile ?? undefined;

        try {
            if (mode === "create") {
                await createCategory({
                    name,
                    priority,
                    urlSlug,
                    parentId: parentId ?? undefined,
                    image: image || undefined,
                }).unwrap();
                setForm(initialForm);
            } else if (mode === "edit" && selectedCategory) {
                await updateCategory({
                    id: selectedCategory.id,
                    name,
                    priority,
                    urlSlug,
                    parentId: parentId ?? undefined,
                    image: image || undefined,
                }).unwrap();
            }
        } catch (err) {
            console.error(err);
            alert("Сталася помилка при збереженні категорії");
        }
    };

    const handleDelete = async () => {
        if (!selectedCategory || submitting) return;

        const ok = window.confirm(
            `Точно видалити категорію "${selectedCategory.name}"?`
        );
        if (!ok) return;

        try {
            await deleteCategory(selectedCategory.id).unwrap();
            setSelectedCategory(null);
            setForm(initialForm);
        } catch (err) {
            console.error(err);
            alert("Сталася помилка при видаленні категорії");
        }
    };

    const isEdit = mode === "edit" && selectedCategory;

    const parentOptions = allCategories.filter((c) =>
        selectedCategory ? c.id !== selectedCategory.id : true
    );

    return (
        <section className="admin-categories">
            <aside className="left-sidebar">
                <CategoryTree
                    onSelectCategory={handleSelectCategory}
                    activeCategoryId={selectedCategory?.id ?? null}
                    onCategoriesLoaded={handleCategoriesLoaded}
                />
            </aside>

            <main className="right-panel">
                <div className="panel-header">
                    <h2>
                        {isEdit
                            ? `Редагування категорії: ${selectedCategory!.name}`
                            : "Створення нової категорії"}
                    </h2>

                    {isEdit && (
                        <button
                            type="button"
                            className="btn secondary"
                            onClick={handleResetToCreate}
                        >
                            Нова категорія
                        </button>
                    )}
                </div>

                <form className="category-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <label htmlFor="name">Назва</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={form.name}
                            onChange={handleInputChange}
                            required
                            placeholder="Наприклад, Ноутбуки"
                        />
                    </div>
                    <div className="form-row">
                        <label htmlFor="priority">Пріоритет</label>
                        <input
                            id="priority"
                            name="priority"
                            type="number"
                            value={form.priority}
                            onChange={handleInputChange}
                            required
                            placeholder="Пріоритет"
                        />
                    </div>

                    <div className="form-row">
                        <label htmlFor="slug">Slug</label>
                        <input
                            id="slug"
                            name="slug"
                            type="text"
                            value={form.slug}
                            onChange={handleInputChange}
                            required
                            placeholder="napryklad-noutbuky"
                        />
                    </div>

                    <div className="form-row">
                        <label htmlFor="parentId">Батьківська категорія</label>
                        <select
                            id="parentId"
                            name="parentId"
                            value={form.parentId}
                            onChange={handleInputChange}
                        >
                            <option value="">(Без батьківської)</option>
                            {parentOptions.map((c) => (
                                <option
                                    key={c.id}
                                    value={c.id.toString()}
                                >
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-row">
                        <label htmlFor="imageUrl">
                            Зображення (URL){" "}
                            <span className="muted">(необовʼязково)</span>
                        </label>
                        <input
                            id="imageUrl"
                            name="imageUrl"
                            type="text"
                            value={form.imageUrl}
                            onChange={handleInputChange}
                            placeholder="https://... або назва файлу"
                        />
                    </div>

                    <div className="form-row">
                        <label htmlFor="imageFile">
                            Або вибір зображення з файлів
                        </label>
                        <input
                            id="imageFile"
                            name="imageFile"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        {form.imageFile && (
                            <div className="muted">
                                Обрано файл: {form.imageFile.name}
                            </div>
                        )}
                    </div>

                    <div className="form-actions">
                        <button
                            type="submit"
                            className="btn primary"
                            disabled={submitting}
                        >
                            {isEdit ? "Зберегти зміни" : "Створити категорію"}
                        </button>

                        {isEdit && (
                            <button
                                type="button"
                                className="btn danger"
                                onClick={handleDelete}
                                disabled={submitting}
                            >
                                Видалити
                            </button>
                        )}
                    </div>
                </form>
            </main>
        </section>
    );
};

export default AdminCategoriesSection;
