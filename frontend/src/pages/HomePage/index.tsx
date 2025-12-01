import { useEffect, useState } from "react";
import CategoryTree from "../../features/categories/components/CategoryTree.tsx";
import Navbar from "../../components/Navbar";
import ProductGrid from "../../features/products/components/ProductGrid";
import type { CategoryNode } from "../../features/categories/utils/buildTree";

type SelectedCategory = { id: number; name: string } | null;

const STORAGE_KEY = "selectedCategory";

const HomePage = () => {
    const [selectedCategory, setSelectedCategory] = useState<SelectedCategory>(() => {
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

    // 👇 тут зберііаємо дерево категорій
    const [categories, setCategories] = useState<CategoryNode[]>([]);

    useEffect(() => {
        if (selectedCategory) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedCategory));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, [selectedCategory]);

    const handleSelectCategory = (node: CategoryNode) => {
        setSelectedCategory({ id: node.id, name: node.name });
    };

    return (
        <>
            <Navbar onHomeClick={() => setSelectedCategory(null)} />

            <div className="layout">
                <aside className="layout-sidebar">
                    <CategoryTree
                        onSelectCategory={handleSelectCategory}
                        activeCategoryId={selectedCategory?.id ?? null}
                        onCategoriesLoaded={setCategories}  // 👈 забираємо дерево
                    />
                </aside>

                <main className="layout-content">
                    <div style={{ marginBottom: 12, fontSize: 14 }}>
                        {selectedCategory ? (
                            <>
                                Категорія:{" "}
                                <strong>{selectedCategory.name}</strong>
                            </>
                        ) : (
                            <>Всі товари</>
                        )}
                    </div>

                    <ProductGrid
                        categoryId={selectedCategory?.id ?? null} // 👈 заміна selectedCategoryId
                        categories={categories}                   // 👈 дерево з CategoryTree
                    />
                </main>
            </div>
        </>
    );
};

export default HomePage;
