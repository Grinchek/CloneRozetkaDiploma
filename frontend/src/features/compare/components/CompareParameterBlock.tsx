import CompareValuesRow from "./CompareValuesRow";

/**
 * По макету Frame 617: два блоки.
 * 1) Назва — 100% ширини, rgb(102,102,102), текст по центру, жирний, білий.
 * 2) Значення — rgb(74,74,74), колонки однакової ширини, тонка вертикальна лінія між ними, текст по центру.
 */
export interface CompareParameterBlockProps {
    parameterName: string;
    values: string[];
    highlightValueIndexes?: number[];
    columnWidth?: number;
    nameBlockBg?: string;
    valuesBlockBg?: string;
}

export default function CompareParameterBlock({
    parameterName,
    values,
    highlightValueIndexes = [],
    columnWidth = 220,
    nameBlockBg = "#666666",
    valuesBlockBg = "#4A4A4A",
}: CompareParameterBlockProps) {
    return (
        <div className="flex w-full flex-col">
            <div
                className="flex w-full items-center justify-center px-4 py-3"
                style={{ backgroundColor: nameBlockBg, minHeight: "48px" }}
            >
                <span className="text-center text-sm font-bold text-white">
                    {parameterName}
                </span>
            </div>
            <CompareValuesRow
                values={values}
                highlightIndexes={highlightValueIndexes}
                columnWidth={columnWidth}
                valuesBg={valuesBlockBg}
            />
        </div>
    );
}
