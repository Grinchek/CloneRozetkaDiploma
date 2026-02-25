/**
 * По макету Frame 617: темніший сірий (#4A4A4A), дві однакові колонки, тонка вертикальна біла/світла лінія між ними, текст по центру.
 */
export interface CompareValuesRowProps {
    values: string[];
    highlightIndexes?: number[];
    columnWidth?: number;
    valuesBg?: string;
}

export default function CompareValuesRow({
    values,
    highlightIndexes = [],
    columnWidth = 220,
    valuesBg = "#4A4A4A",
}: CompareValuesRowProps) {
    return (
        <div
            className="flex w-full"
            style={{ backgroundColor: valuesBg, minHeight: "48px" }}
        >
            {values.map((value, index) => (
                <div
                    key={index}
                    className="flex flex-1 items-center justify-center border-r border-white/20 px-4 py-3 last:border-r-0"
                    style={{
                        width: columnWidth,
                        minWidth: columnWidth,
                        maxWidth: columnWidth,
                        minHeight: "48px",
                        backgroundColor: highlightIndexes.includes(index) ? "rgba(255,193,7,0.15)" : undefined,
                    }}
                >
                    <span className="text-center text-sm text-white whitespace-normal break-words">
                        {value}
                    </span>
                </div>
            ))}
        </div>
    );
}
