import React, { useMemo } from "react";
import { useGetCategoriesQuery } from "../../../features/categories/api/categoryApi";
import { buildCategoryTree } from "../../../features/categories/utils/buildTree";
import type { CategoryNode } from "../../../features/categories/utils/buildTree";
import HomeCategorySidebar from "./HomeCategorySidebar";
import HomeMainBanner from "./HomeMainBanner";
import HomeCategoryLists from "./HomeCategoryLists";

type HomeTopContainerProps = {
    selectedCategoryId: number | null;
    onSelectCategory: (node: CategoryNode) => void;
};

const HomeTopContainer: React.FC<HomeTopContainerProps> = ({ selectedCategoryId, onSelectCategory }) => {
    const { data: categoriesFlat } = useGetCategoriesQuery();
    const roots = useMemo(() => {
        if (!categoriesFlat?.length) return [];
        return buildCategoryTree(categoriesFlat);
    }, [categoriesFlat]);

    const selectedId = selectedCategoryId;

    const selectedNode = useMemo(() => {
        if (selectedId == null) return null;
        const find = (nodes: CategoryNode[]): CategoryNode | null => {
            for (const n of nodes) {
                if (n.id === selectedId) return n;
                const inChild = find(n.children);
                if (inChild) return inChild;
            }
            return null;
        };
        return find(roots);
    }, [roots, selectedId]);

    const children = selectedNode?.children ?? [];

    return (
        <section className="mx-auto max-w-7xl px-6 py-8">
            <div className="home-top-section bg-[#E8E8E8] rounded-[32px] p-4 md:p-5 shadow-lg flex gap-4 md:gap-5 h-[480px] md:h-[520px] overflow-hidden">
                <div className="home-sidebar w-[260px] md:w-[280px] flex-shrink-0 hidden lg:block overflow-y-auto">
                    <HomeCategorySidebar
                        selectedId={selectedId}
                        onSelect={onSelectCategory}
                    />
                </div>
                <div className="flex-1 overflow-hidden rounded-2xl min-w-0 bg-white">
                    <HomeMainBanner categoryId={selectedId} categories={roots} />
                </div>
                <div className="home-category-lists w-[320px] md:w-[380px] flex-shrink-0 rounded-r-2xl overflow-hidden hidden xl:block">
                    <HomeCategoryLists subcategories={children} />
                </div>
            </div>
        </section>
    );
};

export default HomeTopContainer;
