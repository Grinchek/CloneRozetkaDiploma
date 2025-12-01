import { useEffect, useState, type CSSProperties } from "react";
import { fetchCategories, API_BASE } from "../api/api";
import { buildCategoryTree } from "../utils/buildTree";
import type { CategoryNode } from "../utils/buildTree";
import "../styles/categories.css";

type ItemProps = {
    node: CategoryNode;
    depth?: number;
    onSelect?: (node: CategoryNode) => void;
    activeId?: number | null;
};

const ICON_SIZE_PREFIX = "100_";

const buildIconCandidates = (image?: string | null): string[] => {
    if (!image) return [];
    if (image.startsWith("http")) return [image];

    const justName = image.split("/").pop()!.replace(/^\/+/, "");

    if (/^\d+_/.test(justName)) {
        return [
            `${API_BASE}/Images/${justName}`,
            `${API_BASE}/Images/${justName.replace(/^\d+_/, "")}`,
        ];
    }

    return [
        `${API_BASE}/Images/${ICON_SIZE_PREFIX}${justName}`,
        `${API_BASE}/Images/${justName}`,
    ];
};

function TreeItem({ node, depth = 0, onSelect, activeId }: ItemProps) {
    const [open, setOpen] = useState(false);
    const hasChildren = node.children.length > 0;

    const candidates = buildIconCandidates(node.image);
    const [srcIdx, setSrcIdx] = useState(0);
    const currentSrc = candidates[srcIdx] ?? null;

    const indentStyle = { ["--depth" as any]: depth } as CSSProperties;
    const isActive = node.id === activeId;

    return (
        <li className="tree-item" style={indentStyle}>
            <div
                className={
                    "tree-row " +
                    (hasChildren ? "is-branch " : "") +
                    (isActive ? "is-active" : "")
                }
                onClick={() => onSelect?.(node)}
                title={node.name}
            >
                <span
                    className={hasChildren ? "caret" : "dot"}
                    onClick={(e) => {
                        if (!hasChildren) return;
                        e.stopPropagation(); // щоб не тригерити вибір
                        setOpen((v) => !v);
                    }}
                >
                    {hasChildren ? (open ? "▾" : "▸") : "•"}
                </span>

                {currentSrc ? (
                    <img
                        src={currentSrc}
                        alt=""
                        className="tree-icon-img"
                        loading="lazy"
                        onError={() => setSrcIdx((i) => i + 1)}
                    />
                ) : (
                    <span aria-hidden="true" className="tree-fallback"></span>
                )}

                <span>{node.name}</span>
            </div>

            {hasChildren && open && (
                <ul className="tree-children">
                    {node.children.map((child) => (
                        <TreeItem
                            key={child.id}
                            node={child}
                            depth={depth + 1}
                            onSelect={onSelect}
                            activeId={activeId}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
}

type CategoryTreeProps = {
    onSelectCategory?: (node: CategoryNode) => void;
    activeCategoryId?: number | null;
    onCategoriesLoaded?: (nodes: CategoryNode[]) => void;
};

export default function CategoryTree({
                                         onSelectCategory,
                                         activeCategoryId,
                                         onCategoriesLoaded,          // 👈 додали
                                     }: CategoryTreeProps) {
    const [data, setData] = useState<CategoryNode[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories()
            .then((flat) => {
                const tree = buildCategoryTree(flat);
                setData(tree);

                // 👇 віддаємо дерево нагору, якщо треба
                if (onCategoriesLoaded) {
                    onCategoriesLoaded(tree);
                }
            })
            .catch((e) => setError(String(e)))
            .finally(() => setLoading(false));
    }, [onCategoriesLoaded]);


    if (loading) return <div className="muted">Завантаження категорій…</div>;
    if (error) return <div className="error">Помилка: {error}</div>;
    if (!data || data.length === 0)
        return <div className="muted">Категорії відсутні</div>;

    return (
        <nav className="sidebar">
            <div className="sidebar-header">Категорії</div>
            <ul className="tree-list">
                {data.map((n) => (
                    <TreeItem
                        key={n.id}
                        node={n}
                        onSelect={onSelectCategory}
                        activeId={activeCategoryId ?? null}
                    />
                ))}
            </ul>
        </nav>
    );
}
