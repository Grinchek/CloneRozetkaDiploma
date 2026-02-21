const API_BASE = import.meta.env.VITE_API_BASE as string;
const ICON_SIZE_PREFIX = "100_";

/**
 * Повертає масив URL-кандидатів для іконки категорії (спочатку з префіксом розміру, потім без).
 * Використовуй перший у <img> та onError -> переходи на наступний.
 */
export function buildCategoryIconCandidates(image?: string | null): string[] {
    if (!image) return [];
    if (image.startsWith("http")) return [image];

    const justName = image.split("/").pop()?.replace(/^\/+/, "") ?? image;

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
}
