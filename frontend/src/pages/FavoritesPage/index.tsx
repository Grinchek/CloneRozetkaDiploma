import { Link } from "react-router-dom";
import { useGetFavoritesQuery, useRemoveFavoriteMutation } from "../../features/favorites/api/favoritesApi";
import { buildProductImageSrc } from "../../features/products/utils/productImageUrl";
import { Heart } from "lucide-react";

export default function FavoritesPage() {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const { data: favorites = [], isLoading } = useGetFavoritesQuery(undefined, { skip: !token });
    const [removeFavorite] = useRemoveFavoriteMutation();

    const buildImageSrc = (value?: string | null): string => {
        if (!value) return "/icons/ZORYA-LOGO.svg";
        return buildProductImageSrc(value) ?? "/icons/ZORYA-LOGO.svg";
    };

    if (!token) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-20 text-center">
                <h1 className="text-3xl font-bold mb-6 text-[#404236]">Улюблене</h1>
                <p className="text-gray-500 mb-8">Щоб зберігати товари в обране, увійдіть в акаунт.</p>
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
            <div className="max-w-7xl mx-auto px-6 py-20 text-center text-gray-500">
                Завантаження обраного…
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <h1 className="text-3xl font-bold mb-8 text-[#404236]">Улюблене</h1>

            {favorites.length === 0 ? (
                <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
                    <p className="text-gray-500 mb-6">У вас поки немає товарів в обраному.</p>
                    <Link
                        to="/"
                        className="inline-block rounded-full bg-[#F5A623] text-white px-8 py-3 font-bold hover:bg-[#e6951d] transition-colors"
                    >
                        Перейти до каталогу
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {favorites.map((p) => (
                        <article
                            key={p.id}
                            className="group flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300"
                        >
                            <Link
                                to={`/product/${p.id}`}
                                className="relative block aspect-square w-full bg-gray-50 flex-shrink-0 overflow-hidden"
                            >
                                <img
                                    src={buildImageSrc(p.mainImageUrl)}
                                    alt={p.name}
                                    className="w-full h-full object-contain"
                                />
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        removeFavorite(p.id);
                                    }}
                                    className="absolute top-2 right-2 p-2 rounded-full bg-white/90 shadow-sm text-red-500 hover:bg-red-50 transition-colors fill-red-500"
                                    aria-label="Видалити з обраного"
                                >
                                    <Heart size={20} strokeWidth={2} />
                                </button>
                            </Link>
                            <div className="flex flex-col flex-1 p-4">
                                <Link
                                    to={`/product/${p.id}`}
                                    className="text-[14px] font-medium text-gray-800 hover:text-[#F5A623] line-clamp-2 leading-tight mb-2"
                                >
                                    {p.name}
                                </Link>
                                <div className="mt-auto flex items-center justify-between gap-2">
                                    <span className="text-lg font-bold text-[#404236]">
                                        {Number(p.price).toLocaleString("uk-UA")} ₴
                                    </span>
                                    <Link
                                        to={`/product/${p.id}`}
                                        className="rounded-xl bg-[#404236] text-white px-4 py-2 text-sm font-medium hover:bg-[#F5A623] transition-colors"
                                    >
                                        Купити
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
