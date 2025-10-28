import type { CategoryDto } from "../features/categories/types/types";

export type CategoryNode = CategoryDto & { children: CategoryNode[] };

export function buildCategoryTree(flat: CategoryDto[]): CategoryNode[] {
  const byId = new Map<number, CategoryNode>();
  const roots: CategoryNode[] = [];

  for (const c of flat) {
    byId.set(c.id, { ...c, children: [] });
  }

  for (const node of byId.values()) {
    if (node.parentId == null) {
      roots.push(node);
    } else {
      const parent = byId.get(node.parentId);
      if (parent) parent.children.push(node);
      else roots.push(node);
    }
  }

  const sortRec = (nodes: CategoryNode[]) => {
    nodes.sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name));
    nodes.forEach(n => sortRec(n.children));
  };
  sortRec(roots);

  return roots;
}
