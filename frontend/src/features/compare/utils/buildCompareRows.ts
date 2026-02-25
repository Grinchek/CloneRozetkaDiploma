import type { CompareProductDto } from "../api/compareApi";

export interface CompareRow {
    attributeId: number;
    attributeName: string;
    sortOrder: number;
    valuesByProductId: Map<number, string>;
}

/**
 * Збирає всі унікальні характеристики з усіх товарів, сортує (основні → додаткові),
 * повертає рядки для таблиці: назва + значення по кожному productId (або "—" якщо відсутня).
 */
export function buildCompareRows(products: CompareProductDto[]): CompareRow[] {
    const byAttrId = new Map<
        number,
        { name: string; sortOrder: number; valuesByProductId: Map<number, string> }
    >();

    for (const product of products) {
        for (const spec of product.specifications) {
            let row = byAttrId.get(spec.attributeId);
            if (!row) {
                row = {
                    name: spec.attributeName,
                    sortOrder: spec.sortOrder,
                    valuesByProductId: new Map(),
                };
                byAttrId.set(spec.attributeId, row);
            }
            row.valuesByProductId.set(product.id, spec.displayValue);
        }
    }

    return Array.from(byAttrId.entries())
        .map(([attributeId, row]) => ({
            attributeId,
            attributeName: row.name,
            sortOrder: row.sortOrder,
            valuesByProductId: row.valuesByProductId,
        }))
        .sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Чи значення в комірці відрізняється від інших у цьому рядку (для підсвітки). */
export function isDifferentInRow(
    productId: number,
    valuesByProductId: Map<number, string>,
    productIds: number[]
): boolean {
    const value = valuesByProductId.get(productId) ?? "—";
    const others = productIds.filter((id) => id !== productId).map((id) => valuesByProductId.get(id) ?? "—");
    if (others.length === 0) return false;
    return others.some((v) => v !== value);
}
