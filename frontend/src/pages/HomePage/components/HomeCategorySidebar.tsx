import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ChevronDown } from "lucide-react";
import { useGetCategoriesQuery } from "../../../features/categories/api/categoryApi";
import { buildCategoryTree } from "../../../features/categories/utils/buildTree";
import type { CategoryNode } from "../../../features/categories/utils/buildTree";
import { buildCategoryIconCandidates } from "../../../features/categories/utils/categoryImageUrl";

type HomeCategorySidebarProps = {
    selectedId?: number | null;
    onSelect?: (node: CategoryNode) => void;
};

function CategoryIcon({ image }: { image?: string | null }) {
    const candidates = buildCategoryIconCandidates(image);
    const [idx, setIdx] = useState(0);
    const src = candidates[idx] ?? null;

    if (!src) {
        return <span className="text-xl shrink-0 w-8 h-8 flex items-center justify-center bg-gray-200 rounded">📦</span>;
    }

    return (
        <img
            src={src}
            alt=""
            className="w-8 h-8 object-contain shrink-0"
            loading="lazy"
            onError={() => setIdx((i) => i + 1)}
        />
    );
}

type TreeRowProps = {
    node: CategoryNode;
    depth: number;
    isActive: boolean;
    onSelect: ((node: CategoryNode) => void) | undefined;
    isOpen: boolean;
    onToggle: () => void;
};

function TreeRow({ node, depth, isActive, onSelect, isOpen, onToggle }: TreeRowProps) {
    const hasChildren = node.children.length > 0;
    const indentPx = 12 + depth * 20;

    const rowContent = (
        <>
            {hasChildren ? (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggle();
                    }}
                    className="shrink-0 p-0.5 -ml-0.5 rounded hover:bg-black/5 flex items-center justify-center"
                    aria-label={isOpen ? "Згорнути" : "Розгорнути"}
                >
                    {isOpen ? <ChevronDown size={16} className="text-gray-500" /> : <ChevronRight size={16} className="text-gray-500" />}
                </button>
            ) : (
                <span className="w-5 shrink-0" aria-hidden />
            )}
            <div className="flex items-center gap-3 min-w-0 flex-1">
                <CategoryIcon image={node.image} />
                <span className="text-[13px] font-medium text-gray-800 truncate">{node.name}</span>
            </div>
            <ChevronRight size={14} className="text-gray-500 shrink-0 opacity-70 group-hover:opacity-100" />
        </>
    );

    const rowClassName = `flex items-center justify-between gap-2 py-2.5 pr-4 cursor-pointer transition-colors rounded-lg group ${isActive ? "bg-[#E0E0E0]" : "hover:bg-[#E8E8E8]"}`;
    const style = { paddingLeft: indentPx };

    if (onSelect) {
        return (
            <div className={rowClassName} style={style} onClick={() => onSelect(node)}>
                {rowContent}
            </div>
        );
    }

    return (
        <Link to={`/category/${node.id}`} className={rowClassName} style={style}>
            {rowContent}
        </Link>
    );
}

type TreeItemProps = {
    node: CategoryNode;
    depth: number;
    selectedId: number | null;
    onSelect: ((node: CategoryNode) => void) | undefined;
};

function TreeItem({ node, depth, selectedId, onSelect }: TreeItemProps) {
    const hasChildren = node.children.length > 0;
    const [isOpen, setIsOpen] = useState(false);
    const isActive = node.id === selectedId;

    return (
        <li className="list-none">
            <TreeRow
                node={node}
                depth={depth}
                isActive={isActive}
                onSelect={onSelect}
                isOpen={isOpen}
                onToggle={() => setIsOpen((v) => !v)}
            />
            {hasChildren && isOpen && (
                <ul className="flex flex-col gap-0.5 mt-0.5">
                    {node.children.map((child) => (
                        <TreeItem
                            key={child.id}
                            node={child}
                            depth={depth + 1}
                            selectedId={selectedId}
                            onSelect={onSelect}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
}

const HomeCategorySidebar: React.FC<HomeCategorySidebarProps> = ({ selectedId = null, onSelect }) => {
    const { data: categoriesFlat } = useGetCategoriesQuery();
    const roots = useMemo(() => {
        if (!categoriesFlat?.length) return [];
        return buildCategoryTree(categoriesFlat);
    }, [categoriesFlat]);

    if (roots.length === 0) {
        return (
            <aside className="w-full h-full bg-[#F0F0F0] rounded-l-[32px] py-4 pr-2">
                <div className="px-5 py-2.5 text-[13px] text-gray-500">Завантаження категорій...</div>
            </aside>
        );
    }

    return (
        <aside className="w-full h-full bg-[#F0F0F0] rounded-l-[32px] py-4 pr-2 overflow-y-auto">
            <ul className="flex flex-col gap-0.5">
                {roots.map((node) => (
                    <TreeItem
                        key={node.id}
                        node={node}
                        depth={0}
                        selectedId={selectedId}
                        onSelect={onSelect}
                    />
                ))}
            </ul>
        </aside>
    );
};

export default HomeCategorySidebar;
