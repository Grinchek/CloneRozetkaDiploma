import { useEffect, useState } from "react";
import { fetchCategories, API_BASE } from "../api/api";
import { buildCategoryTree } from "../utils/buildTree";
import type { CategoryNode } from "../utils/buildTree";
import "../styles/categories.css";
import type { CSSProperties } from "react";

type ItemProps = {
    node: CategoryNode;
    depth?: number;
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

function TreeItem({ node, depth = 0 }: ItemProps) {
    const [open, setOpen] = useState(false);
    const hasChildren = node.children.length > 0;

    const candidates = buildIconCandidates(node.image);
    const [srcIdx, setSrcIdx] = useState(0);
    const currentSrc = candidates[srcIdx] ?? null;

    // передаємо глибину через CSS-змінну, без інлайн-стилів на самих правилах
    const indentStyle = { ["--depth" as any]: depth } as CSSProperties;

    return (
        <li className="tree-item" style={indentStyle}>
            <div
                className={`tree-row ${hasChildren ? "is-branch" : ""}`}
                onClick={() => hasChildren && setOpen(!open)}
                title={node.name}
            >
        <span className={hasChildren ? "caret" : "dot"}>
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
                    <span aria-hidden="true" className="tree-fallback">🗂️</span>
                )}

                <span>{node.name}</span>
            </div>

            {hasChildren && open && (
                <ul className="tree-children">
                    {node.children.map((child) => (
                        <TreeItem key={child.id} node={child} depth={depth + 1} />
                    ))}
                </ul>
            )}
        </li>
    );
}

export default function CategoryTree() {
    const [data, setData] = useState<CategoryNode[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories()
            .then((flat) => setData(buildCategoryTree(flat)))
            .catch((e) => setError(String(e)))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="muted">Завантаження категорій…</div>;
    if (error) return <div className="error">Помилка: {error}</div>;
    if (!data || data.length === 0) return <div className="muted">Категорії відсутні</div>;

    return (
        <nav className="sidebar">
            <div className="sidebar-header">Категорії</div>
            <ul className="tree-list">
                {data.map((n) => (
                    <TreeItem key={n.id} node={n} />
                ))}
            </ul>
        </nav>
    );
}
