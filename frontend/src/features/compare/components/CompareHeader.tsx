import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";

export interface CompareHeaderProps {
    count: number;
    onClear: () => void;
    isClearing?: boolean;
}

export default function CompareHeader({ count, onClear, isClearing }: CompareHeaderProps) {
    return (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 overflow-visible">
            <h1 className="min-w-0 shrink text-3xl font-bold text-[#404236]">Порівняння товарів</h1>
            <div className="flex shrink-0 flex-wrap items-center gap-3">
                <Link
                    to="/"
                    className="rounded-full border-2 border-[#404236] bg-white px-5 py-2.5 text-sm font-medium text-[#404236] hover:bg-[#404236] hover:text-white transition-colors"
                >
                    Додати товар
                </Link>
                <button
                    type="button"
                    onClick={onClear}
                    disabled={isClearing || count === 0}
                    className="inline-flex items-center gap-2 rounded-full border-2 border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 hover:border-red-500 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Trash2 size={18} />
                    Очистити все
                </button>
            </div>
        </div>
    );
}
