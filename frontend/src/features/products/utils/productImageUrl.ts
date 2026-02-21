const API_BASE = import.meta.env.VITE_API_BASE;

/**
 * Повертає масив URL-кандидатів для зображення товару:
 * спочатку з префіксом 200_, потім без (якщо на сервері лише оригінал).
 */
export function buildProductImageCandidates(value?: string | null): string[] {
    if (!value) return [];
    if (value.startsWith("http://") || value.startsWith("https://")) return [value];
    if (value.startsWith("/")) return [`${API_BASE}${value}`];
    const name = value.replace(/^\/+/, "");
    return [
        `${API_BASE}/Images/200_${name}`,
        `${API_BASE}/Images/${name}`,
    ];
}

/** Перший кандидат (для зворотної сумісності). */
export function buildProductImageSrc(value?: string | null): string | null {
    const candidates = buildProductImageCandidates(value);
    return candidates[0] ?? null;
}
