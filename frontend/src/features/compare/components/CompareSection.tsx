import { useState } from "react";
import CompareParameterBlock from "./CompareParameterBlock";
import type { CompareRow } from "../utils/buildCompareRows";
import { isDifferentInRow } from "../utils/buildCompareRows";
import type { CompareProductDto } from "../api/compareApi";

/** По макету Frame 617: світліший сірий #666 для заголовків/назв, темніший #4A4A4A для значень, текст по центру. */
const HEADER_BG = "#666666";
const VALUES_BG = "#4A4A4A";

export interface CompareSectionProps {
    rows: CompareRow[];
    products: CompareProductDto[];
    columnWidth?: number;
}

export default function CompareSection({ rows, products, columnWidth = 220 }: CompareSectionProps) {
    const [highlightDifferences, setHighlightDifferences] = useState(false);
    const productIds = products.map((p) => p.id);

    return (
        <section className="flex flex-col overflow-hidden rounded-b-2xl">
            {/* Заголовок: світліший сірий, текст по центру візуально (ліворуч заголовок, справа кнопка) */}
            <div
                className="flex w-full items-center justify-between gap-4 px-4 py-3"
                style={{ backgroundColor: HEADER_BG }}
            >
                <h2 className="text-sm font-bold uppercase tracking-wide text-white">
                    Характеристики
                </h2>
                <button
                    type="button"
                    onClick={() => setHighlightDifferences((v) => !v)}
                    className="rounded border border-white/40 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
                >
                    {highlightDifferences ? "Приховати відмінності" : "Показати відмінності"}
                </button>
            </div>

            {/* Параметри: назва — світліший сірий, значення — темніший сірий, текст по центру */}
            <div className="flex flex-col">
                {rows.map((row) => {
                    const values = products.map(
                        (p) => row.valuesByProductId.get(p.id) ?? "—"
                    );
                    const highlightIndexes = highlightDifferences
                        ? products
                              .map((p, idx) =>
                                  isDifferentInRow(
                                      p.id,
                                      row.valuesByProductId,
                                      productIds
                                  )
                                  ? idx
                                  : -1
                              )
                              .filter((i) => i >= 0)
                        : [];
                    return (
                        <CompareParameterBlock
                            key={row.attributeId}
                            parameterName={row.attributeName}
                            values={values}
                            highlightValueIndexes={highlightIndexes}
                            columnWidth={columnWidth}
                            nameBlockBg={HEADER_BG}
                            valuesBlockBg={VALUES_BG}
                        />
                    );
                })}
            </div>
        </section>
    );
}
