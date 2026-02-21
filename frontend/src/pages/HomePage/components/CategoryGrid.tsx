import React, { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useGetCategoriesQuery } from "../../../features/categories/api/categoryApi";
import { buildCategoryTree } from "../../../features/categories/utils/buildTree";
import type { CategoryNode } from "../../../features/categories/utils/buildTree";
import { buildCategoryIconCandidates } from "../../../features/categories/utils/categoryImageUrl";

const defaultCategories: { id: number; name: string; icon: string }[] = [
    { id: 0, name: "Електроніка", icon: "📱" },
    { id: 1, name: "Ноутбуки", icon: "💻" },
    { id: 2, name: "Побутова техніка", icon: "🧺" },
    { id: 3, name: "Товари для дому", icon: "🏠" },
    { id: 4, name: "Спорт", icon: "⚽" },
];

function CategoryIcon({ image }: { image?: string | null }) {
    const candidates = buildCategoryIconCandidates(image);
    const [idx, setIdx] = useState(0);
    const src = candidates[idx] ?? null;

    if (!src) return null;
    return (
        <img
            src={src}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setIdx((i) => i + 1)}
        />
    );
}

function CategoryItem({
    cat,
    isPlaceholder,
    onSelectCategory,
    scrollToSectionId,
}: {
    cat: CategoryNode | (typeof defaultCategories)[0];
    isPlaceholder: boolean;
    onSelectCategory?: (id: number) => void;
    scrollToSectionId?: string;
}) {
    const id = "id" in cat ? cat.id : (cat as (typeof defaultCategories)[0]).id;
    const name = cat.name;
    const hasImage = !isPlaceholder && "image" in cat && (cat as CategoryNode).image;
    const icon = isPlaceholder && "icon" in cat ? (cat as (typeof defaultCategories)[0]).icon : null;

    const handleClick = () => {
        if (onSelectCategory && !isPlaceholder) {
            onSelectCategory(id);
            if (scrollToSectionId) {
                document.getElementById(scrollToSectionId)?.scrollIntoView({ behavior: "smooth" });
            }
        }
    };

    const content = (
        <>
            <div className="relative mb-3 flex items-center justify-center w-24 h-24 md:w-28 md:h-28 rounded-full bg-[#E5E5E5] overflow-hidden transition-all duration-300 group-hover/item:scale-110">
                {hasImage ? (
                    <CategoryIcon image={(cat as CategoryNode).image} />
                ) : null}
                {(!hasImage || isPlaceholder) && (
                    <span className="text-4xl">{icon ?? "📦"}</span>
                )}
            </div>
            <span className="text-[14px] md:text-[15px] font-bold text-gray-800 text-center max-w-[120px] line-clamp-2">
                {name}
            </span>
        </>
    );

    const className = "flex flex-col items-center shrink-0 w-[140px] md:w-[160px] group/item cursor-pointer";

    if (onSelectCategory && !isPlaceholder) {
        return (
            <div role="button" tabIndex={0} onClick={handleClick} onKeyDown={(e) => e.key === "Enter" && handleClick()} className={className}>
                {content}
            </div>
        );
    }

    return (
        <Link
            to={isPlaceholder ? "#" : `/category/${id}`}
            className={className}
        >
            {content}
        </Link>
    );
}

const SCROLL_STEP = 320;

type CategoryGridProps = {
    onSelectCategory?: (id: number) => void;
    scrollToSectionId?: string;
};

const CategoryGrid: React.FC<CategoryGridProps> = ({ onSelectCategory, scrollToSectionId }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const { data: categoriesFlat } = useGetCategoriesQuery();

    const roots = useMemo(() => {
        if (categoriesFlat && categoriesFlat.length > 0) {
            return buildCategoryTree(categoriesFlat);
        }
        return null;
    }, [categoriesFlat]);

    const list = roots && roots.length > 0 ? roots : defaultCategories;
    const isPlaceholder = !roots || roots.length === 0;

    const scroll = (direction: "left" | "right") => {
        const el = scrollRef.current;
        if (!el) return;
        const step = direction === "left" ? -SCROLL_STEP : SCROLL_STEP;
        el.scrollBy({ left: step, behavior: "smooth" });
    };

    return (
        <section className="mx-auto max-w-7xl px-6 py-12">
            <div className="flex items-center gap-3 md:gap-4">
                {/* Кнопка вліво */}
                <button
                    type="button"
                    onClick={() => scroll("left")}
                    className="shrink-0 flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#E5E5E5] text-[#F5A623] hover:bg-[#F5A623] hover:text-white transition-all shadow-md"
                    aria-label="Попередні категорії"
                >
                    <ChevronLeft size={28} strokeWidth={2.5} />
                </button>

                {/* Горизонтальна смуга з прокруткою */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-x-auto overflow-y-hidden flex gap-6 md:gap-8 px-2 py-4 scroll-smooth scrollbar-hide"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {list.map((cat) => (
                        <CategoryItem
                            key={"id" in cat ? cat.id : (cat as (typeof defaultCategories)[0]).id}
                            cat={cat as CategoryNode}
                            isPlaceholder={isPlaceholder}
                            onSelectCategory={onSelectCategory}
                            scrollToSectionId={scrollToSectionId}
                        />
                    ))}
                </div>

                {/* Кнопка вправо */}
                <button
                    type="button"
                    onClick={() => scroll("right")}
                    className="shrink-0 flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#E5E5E5] text-[#F5A623] hover:bg-[#F5A623] hover:text-white transition-all shadow-md"
                    aria-label="Наступні категорії"
                >
                    <ChevronRight size={28} strokeWidth={2.5} />
                </button>
            </div>

            {/* Приховуємо скролбар у WebKit */}
            <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
            `}</style>
        </section>
    );
};

export default CategoryGrid;
