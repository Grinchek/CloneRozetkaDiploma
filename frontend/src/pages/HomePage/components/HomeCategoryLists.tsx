import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { CategoryNode } from "../../../features/categories/utils/buildTree";

type HomeCategoryListsProps = {
    subcategories: CategoryNode[];
};

const HomeCategoryLists: React.FC<HomeCategoryListsProps> = ({ subcategories }) => {
    const list = subcategories.length > 0 ? subcategories : [];
    const popular = list.slice(0, Math.ceil(list.length / 2) || 5);
    const all = list;

    return (
        <div className="w-full h-full flex gap-4 p-4 pr-6 bg-[#F0F0F0]">
            <div className="flex-1 min-w-0">
                <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-2">
                    Популярні категорії:
                </h3>
                <ul className="flex flex-col gap-0.5">
                    {popular.length > 0 ? (
                        popular.map((node) => (
                            <li key={node.id}>
                                <Link
                                    to={`/category/${node.id}`}
                                    className="flex items-center justify-between px-2 py-1.5 cursor-pointer rounded-lg hover:bg-[#E8E8E8] group"
                                >
                                    <span className="text-[13px] font-medium text-gray-700 truncate">{node.name}</span>
                                    <ChevronRight size={12} className="text-gray-500 shrink-0 opacity-70 group-hover:opacity-100" />
                                </Link>
                            </li>
                        ))
                    ) : (
                        <li className="px-2 py-1.5 text-[13px] text-gray-500">Оберіть категорію зліва</li>
                    )}
                </ul>
            </div>

            <div className="flex-1 min-w-0">
                <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-2">
                    Усі категорії:
                </h3>
                <ul className="flex flex-col gap-0.5">
                    {all.length > 0 ? (
                        all.map((node) => (
                            <li key={node.id}>
                                <Link
                                    to={`/category/${node.id}`}
                                    className="flex items-center justify-between px-2 py-1.5 cursor-pointer rounded-lg hover:bg-[#E8E8E8] group"
                                >
                                    <span className="text-[13px] font-medium text-gray-700 truncate">{node.name}</span>
                                    <ChevronRight size={12} className="text-gray-500 shrink-0 opacity-70 group-hover:opacity-100" />
                                </Link>
                            </li>
                        ))
                    ) : (
                        <li className="px-2 py-1.5 text-[13px] text-gray-500">—</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default HomeCategoryLists;
