import { useEffect, useState } from "react";
import { fetchCategories, API_BASE } from "../api/api";
import { buildCategoryTree } from "../utils/buildTree";
import type { CategoryNode } from "../utils/buildTree";

type ItemProps = {
  node: CategoryNode;
  depth?: number;
};

// Який розмір іконки просимо для сайдбару:
const ICON_SIZE_PREFIX = "100_";

// Побудова кандидатів на URL іконки, враховуючи:
// - повний URL (http...) — беремо як є
// - лише ім'я файлу — пробуємо з префіксом (100_) і без
// - шлях із /Images/... — нормалізуємо до абсолютного
const buildIconCandidates = (image?: string | null): string[] => {
  if (!image) return [];
  if (image.startsWith("http")) return [image];

  // Витягуємо тільки назву файлу (без проміжних підпапок)
  const justName = image.split("/").pop()!.replace(/^\/+/, "");

  // Якщо вже є префікс розміру у назві — спробуємо і його, і варіант без префікса
  if (/^\d+_/.test(justName)) {
    return [
      `${API_BASE}/Images/${justName}`,
      `${API_BASE}/Images/${justName.replace(/^\d+_/, "")}`,
    ];
  }

  // Звичайний кейс: спочатку 100_<name>, потім <name>
  return [
    `${API_BASE}/Images/${ICON_SIZE_PREFIX}${justName}`,
    `${API_BASE}/Images/${justName}`,
  ];
};

function TreeItem({ node, depth = 0 }: ItemProps) {
  const [open, setOpen] = useState(false);
  const hasChildren = node.children.length > 0;

  // Кандидати на джерело іконки + індекс поточного
  const candidates = buildIconCandidates(node.image);
  const [srcIdx, setSrcIdx] = useState(0);
  const currentSrc = candidates[srcIdx] ?? null;

  return (
    <li style={{ marginLeft: depth * 8 }}>
      <div
        onClick={() => hasChildren && setOpen(!open)}
        style={{
          cursor: hasChildren ? "pointer" : "default",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "4px 6px",
          borderRadius: 8,
          userSelect: "none",
          transition: "background .2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        title={node.name}
      >
        {hasChildren ? (open ? "▾" : "▸") : "•"}

        {/* Іконка з автоматичним fallback */}
        {currentSrc ? (
          <img
            src={currentSrc}
            alt=""
            width={18}
            height={18}
            loading="lazy"
            style={{ display: "inline-block", objectFit: "contain", borderRadius: 4 }}
            onError={() => setSrcIdx((i) => i + 1)} // якщо 404 — беремо наступного кандидата
          />
        ) : (
          <span aria-hidden="true" style={{ width: 18, textAlign: "center", display: "inline-block" }}>
            🗂️
          </span>
        )}

        <span>{node.name}</span>
      </div>

      {hasChildren && open && (
        <ul style={{ listStyle: "none", paddingLeft: 0, marginTop: 4 }}>
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
      <ul style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}>
        {data.map((n) => (
          <TreeItem key={n.id} node={n} />
        ))}
      </ul>
    </nav>
  );
}
