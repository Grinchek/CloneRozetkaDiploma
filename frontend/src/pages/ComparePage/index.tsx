import { Link } from "react-router-dom";
import {
    useGetCompareQuery,
    useRemoveFromCompareMutation,
    useClearCompareMutation,
} from "../../features/compare/api/compareApi";
import CompareHeader from "../../features/compare/components/CompareHeader";
import CompareTable from "../../features/compare/components/CompareTable";
import { useState } from "react";

export default function ComparePage() {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const { data: products = [], isLoading, error } = useGetCompareQuery(undefined, { skip: !token });
    const [removeFromCompare, { isLoading: isRemoving }] = useRemoveFromCompareMutation();
    const [clearCompare, { isLoading: isClearing }] = useClearCompareMutation();
    const [removingId, setRemovingId] = useState<number | null>(null);

    const handleRemove = (productId: number) => {
        setRemovingId(productId);
        removeFromCompare(productId).finally(() => setRemovingId(null));
    };

    const handleClear = () => {
        clearCompare();
    };

    if (!token) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-20 text-center">
                <h1 className="text-3xl font-bold mb-6 text-[#404236]">Порівняння товарів</h1>
                <p className="text-gray-500 mb-8">Увійдіть в акаунт, щоб зберігати товари для порівняння.</p>
                <Link
                    to="/login"
                    className="inline-block bg-[#F5A623] text-white px-8 py-3 rounded-full font-bold hover:bg-[#e6951d] transition-colors shadow-md"
                >
                    Увійти
                </Link>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-10">
                <div className="h-10 w-64 bg-gray-200 rounded animate-pulse mb-6" />
                <div className="flex gap-4 overflow-hidden">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="min-w-[220px] flex-shrink-0">
                            <div className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
                            <div className="h-4 bg-gray-200 rounded mt-3 animate-pulse w-3/4 mx-auto" />
                            <div className="h-5 bg-gray-200 rounded mt-2 w-1/2 mx-auto animate-pulse" />
                        </div>
                    ))}
                </div>
                <div className="mt-6 space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-20 text-center">
                <h1 className="text-3xl font-bold mb-6 text-[#404236]">Порівняння товарів</h1>
                <p className="text-red-500 mb-8">Не вдалося завантажити список порівняння.</p>
                <Link
                    to="/"
                    className="inline-block rounded-full bg-[#F5A623] text-white px-8 py-3 font-bold hover:bg-[#e6951d] transition-colors"
                >
                    На головну
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <CompareHeader
                count={products.length}
                onClear={handleClear}
                isClearing={isClearing}
            />
            {products.length === 0 ? (
                <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
                    <p className="text-gray-500 mb-6">У порівнянні поки немає товарів. Додайте товари з каталогу.</p>
                    <Link
                        to="/"
                        className="inline-block rounded-full bg-[#F5A623] text-white px-8 py-3 font-bold hover:bg-[#e6951d] transition-colors"
                    >
                        Перейти до каталогу
                    </Link>
                </div>
            ) : (
                <CompareTable
                    products={products}
                    onRemove={handleRemove}
                    removingId={isRemoving ? removingId : null}
                />
            )}
        </div>
    );
}
