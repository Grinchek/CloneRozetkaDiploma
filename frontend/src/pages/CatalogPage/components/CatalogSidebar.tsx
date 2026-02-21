import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronRight, ChevronDown } from "lucide-react";
import { useGetCategoriesQuery } from "../../../features/categories/api/categoryApi";
import { buildCategoryTree } from "../../../features/categories/utils/buildTree";
import type { CategoryNode } from "../../../features/categories/utils/buildTree";
import { buildCategoryIconCandidates } from "../../../features/categories/utils/categoryImageUrl";

function CategoryIcon({ image }: { image?: string | null }) {
    const candidates = buildCategoryIconCandidates(image);
    const [idx, setIdx] = useState(0);
    const src = candidates[idx] ?? null;

    if (!src) {
        return <span className="text-xl shrink-0 w-8 h-8 flex items-center justify-center bg-gray-200 rounded">📦</span>;
    }
    return (
        <img src={src} alt="" className="w-8 h-8 object-contain shrink-0" loading="lazy" onError={() => setIdx((i) => i + 1)} />
    );
}

function TreeItem({ node, depth, activeId }: { node: CategoryNode; depth: number; activeId: number | null }) {
    const hasChildren = node.children.length > 0;
    const [isOpen, setIsOpen] = useState(depth === 0);
    const isActive = node.id === activeId;
    const indentPx = 12 + depth * 20;

    const rowContent = (
        <>
            {hasChildren ? (
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setIsOpen((v) => !v); }}
                    className="shrink-0 p-0.5 -ml-0.5 rounded hover:bg-black/5"
                    aria-label={isOpen ? "Згорнути" : "Розгорнути"}
                >
                    {isOpen ? <ChevronDown size={16} className="text-gray-500" /> : <ChevronRight size={16} className="text-gray-500" />}
                </button>
            ) : (
                <span className="w-5 shrink-0" />
            )}
            <div className="flex items-center gap-3 min-w-0 flex-1">
                <CategoryIcon image={node.image} />
                <span className="text-[13px] font-medium text-gray-800 truncate">{node.name}</span>
            </div>
            <ChevronRight size={14} className="text-gray-500 shrink-0 opacity-70 group-hover:opacity-100" />
        </>
    );

    const rowClass = `flex items-center justify-between gap-2 py-2.5 pr-4 rounded-lg group transition-colors ${isActive ? "bg-[#E0E0E0]" : "hover:bg-[#E8E8E8]"}`;
    const style = { paddingLeft: indentPx };

    return (
        <li className="list-none">
            <Link to={`/category/${node.id}`} className={`${rowClass} block`} style={style}>
                {rowContent}
            </Link>
            {hasChildren && isOpen && (
                <ul className="mt-0.5">
                    {node.children.map((child) => (
                        <TreeItem key={child.id} node={child} depth={depth + 1} activeId={activeId} />
                    ))}
                </ul>
            )}
        </li>
    );
}

export default function CatalogSidebar() {
    const { id } = useParams<{ id: string }>();
    const activeId = id != null ? parseInt(id, 10) : null;
    const { data: categoriesFlat } = useGetCategoriesQuery();
    const roots = useMemo(() => {
        if (!categoriesFlat?.length) return [];
        return buildCategoryTree(categoriesFlat);
    }, [categoriesFlat]);

    if (roots.length === 0) {
        return (
            <aside className="w-full rounded-2xl bg-[#F0F0F0] p-4">
                <p className="text-[13px] text-gray-500">Завантаження категорій…</p>
            </aside>
        );
    }

    return (
        <aside className="w-full rounded-2xl bg-[#F0F0F0] py-4 pr-2 overflow-y-auto max-h-[calc(100vh-12rem)]">
            <h3 className="px-5 mb-2 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Каталог</h3>
            <ul className="flex flex-col gap-0.5">
                {roots.map((node) => (
                    <TreeItem key={node.id} node={node} depth={0} activeId={activeId} />
                ))}
            </ul>
        </aside>
    );
}
