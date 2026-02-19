import { useParams } from "react-router-dom";
import { useGetProductByIdQuery } from "../api/productApi";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "../../../store/cartSlice";

const API_BASE = import.meta.env.VITE_API_BASE;

export default function ProductDetails() {
    const { id } = useParams<{ id: string }>();
    const productId = Number(id);
    const { data: product, isLoading, error } = useGetProductByIdQuery(productId);
    const [mainImageIdx, setMainImageIdx] = useState(0);
    const dispatch = useDispatch();

    const handleAddToCart = () => {
        if (!product) return;
        dispatch(addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            mainImageUrl: product.mainImageUrl
        }));
    };

    const buildImageSrc = (value?: string | null): string => {
        if (!value) return "/icons/ZORYA-LOGO.svg";
        if (value.startsWith("http")) return value;
        return `${API_BASE}${value.startsWith("/") ? "" : "/"}${value}`;
    };

    if (isLoading) return <div className="p-8 text-center">Завантаження...</div>;
    if (error || !product) return <div className="p-8 text-center text-red-500">Товар не знайдено</div>;

    const images = product.imageUrls && product.imageUrls.length > 0
        ? product.imageUrls
        : [product.mainImageUrl].filter(Boolean) as string[];

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4">
                    <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
                        <img
                            src={buildImageSrc(images[mainImageIdx])}
                            alt={product.name}
                            className="w-full h-full object-contain"
                        />
                    </div>
                    {images.length > 1 && (
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setMainImageIdx(idx)}
                                    className={`w-20 h-20 border-2 rounded-lg overflow-hidden flex-shrink-0 ${mainImageIdx === idx ? 'border-[#F5A623]' : 'border-gray-200'}`}
                                >
                                    <img src={buildImageSrc(img)} className="w-full h-full object-cover" alt="" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-6">
                    <h1 className="text-3xl font-bold text-[#404236]">{product.name}</h1>

                    <div className="flex items-center gap-4">
                        <span className="text-4xl font-bold text-[#1a1a1a]">
                            {product.price.toLocaleString("uk-UA")} ₴
                        </span>
                        <span className="text-green-600 font-medium">В наявності</span>
                    </div>

                    <button
                        onClick={handleAddToCart}
                        className="bg-[#F5A623] hover:bg-[#e6951d] text-white font-bold py-4 px-8 rounded-full transition-colors text-lg shadow-lg active:scale-95 duration-75"
                    >
                        Купити
                    </button>

                    <div className="mt-8">
                        <h2 className="text-xl font-semibold mb-3 border-b pb-2">Опис</h2>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                            {product.description || "Опис для цього товару поки що відсутній."}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <h3 className="text-sm text-gray-400 font-medium uppercase">Доставка</h3>
                            <p className="text-sm font-medium mt-1">Нова Пошта, Самовивіз</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <h3 className="text-sm text-gray-400 font-medium uppercase">Оплата</h3>
                            <p className="text-sm font-medium mt-1">Готівка, Картка, Кредит</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
