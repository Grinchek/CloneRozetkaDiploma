import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

function FilterBlock({
    title,
    children,
    defaultOpen = true,
}: {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-gray-200 py-4 last:border-b-0">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex items-center justify-between w-full text-left text-[14px] font-semibold text-gray-800"
            >
                {title}
                <ChevronDown size={18} className={`text-gray-500 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            {open && <div className="mt-3">{children}</div>}
        </div>
    );
}

export type CatalogFiltersProps = {
    priceFrom: string;
    priceTo: string;
    onPriceFromChange: (value: string) => void;
    onPriceToChange: (value: string) => void;
};

export default function CatalogFilters({
    priceFrom,
    priceTo,
    onPriceFromChange,
    onPriceToChange,
}: CatalogFiltersProps) {
    return (
        <aside className="w-full bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <FilterBlock title="Діапазон ціни" defaultOpen>
                <div className="flex gap-2 items-center">
                    <input
                        type="number"
                        min={0}
                        placeholder="Від"
                        value={priceFrom}
                        onChange={(e) => onPriceFromChange(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px] outline-none focus:border-[#F5A623]"
                    />
                    <span className="text-gray-400">–</span>
                    <input
                        type="number"
                        min={0}
                        placeholder="До"
                        value={priceTo}
                        onChange={(e) => onPriceToChange(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px] outline-none focus:border-[#F5A623]"
                    />
                </div>
            </FilterBlock>
        </aside>
    );
}
