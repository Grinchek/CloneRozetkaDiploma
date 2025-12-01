import { FormEvent, useState } from 'react';
import '../styles/admin.css';
import {
    useGetCategoriesQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,

} from '../features/categories/api/categoryApi.ts';

const AdminCategoriesSection = () => {
    const { data: categories, isLoading, isError } = useGetCategoriesQuery();
    const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
    const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
    const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);

    const isEditMode = editingId !== null;


    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!name.trim() || !slug.trim()) return;

        try {
            if (isEditMode && editingId !== null) {
                await updateCategory({ id: editingId, name, slug }).unwrap();
            } else {
                await createCategory({ name, slug }).unwrap();
            }

            setName('');
            setSlug('');
            setEditingId(null);
        } catch (err) {
            console.error('Помилка при збереженні категорії', err);
        }
    };

    const handleEdit = (category: Category) => {
        setEditingId(category.id);
        setName(category.name);
        setSlug(category.slug);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setName('');
        setSlug('');
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Точно видалити цю категорію?')) return;

        try {
            await deleteCategory(id).unwrap();
        } catch (err) {
            console.error('Помилка при видаленні категорії', err);
        }
    };

    return (

        <section className="admin-categories">
            <h2>Категорії</h2>

            <form className="admin-categories-form" onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-field">
                        <label htmlFor="category-name">Назва</label>
                        <input
                            id="category-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Наприклад: Смартфони"
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="category-slug">Slug</label>
                        <input
                            id="category-slug"
                            type="text"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            placeholder="napr-smarthfony"
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" disabled={isCreating || isUpdating}>
                        {isEditMode ? 'Зберегти зміни' : 'Додати категорію'}
                    </button>
                    {isEditMode && (
                        <button type="button" onClick={handleCancelEdit}>
                            Скасувати
                        </button>
                    )}
                </div>
            </form>

            <div className="admin-categories-list">
                {isLoading && <p>Завантаження категорій...</p>}
                {isError && <p style={{ color: 'red' }}>Помилка завантаження категорій.</p>}

                {categories && categories.length > 0 ? (
                    <table className="admin-categories-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Назва</th>
                            <th>Slug</th>
                            <th>Дії</th>
                        </tr>
                        </thead>
                        <tbody>
                        {categories.map((category) => (
                            <tr key={category.id}>
                                <td>{category.id}</td>
                                <td>{category.name}</td>
                                <td>{category.urlSlug}</td>
                                <td>
                                    <button
                                        type="button"
                                        onClick={() => handleEdit(category)}
                                    >
                                        Редагувати
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(category.id)}
                                        disabled={isDeleting}
                                    >
                                        Видалити
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : !isLoading && (
                    <p>Категорій поки немає.</p>
                )}
            </div>
        </section>

    );
};

export default AdminCategoriesSection;
