import type { CategoryDto } from "../types/types";

const BASE = import.meta.env.VITE_API_BASE as string;

export async function fetchCategories(): Promise<CategoryDto[]> {
  const res = await fetch(`${BASE}/api/categories`, {
    headers: { "Accept": "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Failed to load categories: ${res.status}`);
  }
  return res.json();
}
export const API_BASE = import.meta.env.VITE_API_BASE as string;
