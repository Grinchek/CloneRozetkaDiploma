import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useGetCategoriesQuery } from "../../features/categories/api/categoryApi";
import { buildCategoryTree } from "../../features/categories/utils/buildTree";
import HomeTopContainer from "./components/HomeTopContainer";
import CategoryGrid from "./components/CategoryGrid";
import HomeCategoryProducts from "./components/HomeCategoryProducts";
import "../../styles/home.css";

const HomePage = () => {
    const { data: categoriesFlat } = useGetCategoriesQuery();
    const categoryTree = categoriesFlat ? buildCategoryTree(categoriesFlat) : [];
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

    useEffect(() => {
        if (categoryTree.length > 0 && selectedCategoryId === null) {
            setSelectedCategoryId(categoryTree[0].id);
        }
    }, [categoryTree, selectedCategoryId]);

    return (
        <div className="home-page bg-[#F8F8F8] min-h-screen">
            {/* 1. Верхній блок: сайдбар категорій + банер + списки категорій */}
            <HomeTopContainer
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={(node) => setSelectedCategoryId(node.id)}
            />

            {/* 2. Карусель категорій — клік обирає категорію і скролить до товарів */}
            <CategoryGrid
                onSelectCategory={setSelectedCategoryId}
                scrollToSectionId="products-section"
            />

            {/* 3. Товари обраної категорії (з сітки вище) */}
            <HomeCategoryProducts categoryId={selectedCategoryId} categories={categoryTree} />

            {/* 4. Кнопка «Дивитись ще» */}
            <div className="mx-auto max-w-7xl px-6 pb-24 text-center">
                {selectedCategoryId != null && (
                    <Link
                        to={`/category/${selectedCategoryId}`}
                        className="inline-block rounded-2xl border-2 border-gray-200 bg-white px-12 py-4 font-black text-gray-700 uppercase tracking-widest text-sm transition-all hover:bg-gray-50 active:scale-95 shadow-sm"
                    >
                        Дивитись ще
                    </Link>
                )}
            </div>
        </div>
    );
};

export default HomePage;
