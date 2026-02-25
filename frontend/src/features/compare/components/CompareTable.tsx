import { useMemo } from "react";
import CompareColumn from "./CompareColumn";
import CompareSection from "./CompareSection";
import { buildCompareRows } from "../utils/buildCompareRows";
import type { CompareProductDto } from "../api/compareApi";

const CARD_MIN_WIDTH = 220;

/**
 * Таблиця порівняння по макету Frame 618: БЕЗ класичної HTML-таблиці.
 * 1) Верхній блок — картки товарів (flex, одна висота).
 * 2) Нижній блок — CompareSection: кожен параметр = два рядки (назва на всю ширину, потім значення по колонках).
 */
export interface CompareTableProps {
    products: CompareProductDto[];
    onRemove: (productId: number) => void;
    removingId?: number | null;
}

export default function CompareTable({ products, onRemove, removingId }: CompareTableProps) {
    const rows = useMemo(() => buildCompareRows(products), [products]);
    const totalWidth = products.length * CARD_MIN_WIDTH;

    return (
        <div
            className="flex flex-col overflow-hidden rounded-2xl shadow-sm"
            style={{ width: totalWidth, maxWidth: "100%" }}
        >
            {/* Блок карток: ширина = N × ширина картки */}
            <div
                className="flex rounded-t-2xl border-b border-[#4A4A4A] bg-[#4F4F42]"
                style={{ minHeight: "300px" }}
            >
                {products.map((product, idx) => (
                    <div
                        key={product.id}
                        className="flex flex-1 flex-shrink-0 flex-col border-r border-[#4A4A4A]/80 last:border-r-0"
                        style={{ minWidth: CARD_MIN_WIDTH, maxWidth: CARD_MIN_WIDTH }}
                    >
                        <div className="h-[300px] overflow-hidden">
                            <CompareColumn
                                product={product}
                                index={idx + 1}
                                onRemove={onRemove}
                                isRemoving={removingId === product.id}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Таблиця порівняння: та сама ширина, закруглення тільки знизу */}
            <div style={{ width: totalWidth }}>
                <CompareSection rows={rows} products={products} columnWidth={CARD_MIN_WIDTH} />
            </div>
        </div>
    );
}
