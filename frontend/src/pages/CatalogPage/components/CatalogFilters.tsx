import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const manufacturers = [
    { name: "Asus", count: 15 },
    { name: "HP", count: 12 },
    { name: "Lenovo", count: 15 },
    { name: "Dell", count: 14 },
    { name: "Acer", count: 12 },
    { name: "MSI", count: 14 },
];

const placeholderCategories = [
    { name: "Категорія 15", count: 8 },
    { name: "Категорія 15", count: 5 },
    { name: "Категорія 15", count: 3 },
];

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

export default function CatalogFilters() {
    const [priceFrom, setPriceFrom] = useState("");
    const [priceTo, setPriceTo] = useState("");

    return (
        <aside className="w-full bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <FilterBlock title="Ціна" defaultOpen>
                <div className="flex gap-2 items-center">
                    <input
                        type="number"
                        placeholder="Від"
                        value={priceFrom}
                        onChange={(e) => setPriceFrom(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px] outline-none focus:border-[#F5A623]"
                    />
                    <span className="text-gray-400">–</span>
                    <input
                        type="number"
                        placeholder="До"
                        value={priceTo}
                        onChange={(e) => setPriceTo(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px] outline-none focus:border-[#F5A623]"
                    />
                </div>
            </FilterBlock>

            <FilterBlock title="Виробник" defaultOpen>
                <ul className="space-y-2">
                    {manufacturers.map((m) => (
                        <li key={m.name + m.count} className="flex items-center justify-between gap-2">
                            <label className="flex items-center gap-2 cursor-pointer text-[13px] text-gray-700">
                                <input type="checkbox" className="rounded border-gray-300 text-[#F5A623] focus:ring-[#F5A623]" />
                                <span>{m.name}</span>
                            </label>
                            <span className="text-[12px] text-gray-400">({m.count})</span>
                        </li>
                    ))}
                </ul>
            </FilterBlock>

            {placeholderCategories.map((c, i) => (
                <FilterBlock key={i} title={c.name} defaultOpen={false}>
                    <ul className="space-y-2">
                        <li className="flex items-center justify-between gap-2">
                            <label className="flex items-center gap-2 cursor-pointer text-[13px] text-gray-700">
                                <input type="checkbox" className="rounded border-gray-300 text-[#F5A623] focus:ring-[#F5A623]" />
                                <span>Опція</span>
                            </label>
                            <span className="text-[12px] text-gray-400">({c.count})</span>
                        </li>
                    </ul>
                </FilterBlock>
            ))}
        </aside>
    );
}
