import { Link } from "react-router-dom";
import { X, ShoppingCart, Star } from "lucide-react";
import { buildProductImageSrc } from "../../products/utils/productImageUrl";
import type { CompareProductDto } from "../api/compareApi";

const ACCENT = "#FF9C00";
const CARD_BG = "#3C3C3C";
const TEXT_LIGHT = "#E0E0E0";
const TEXT_MUTED = "#A0A0A0";

function buildImageSrc(value?: string | null): string {
    return buildProductImageSrc(value) ?? "/icons/ZORYA-LOGO.svg";
}

function StarRating({ rating = 0, max = 5 }: { rating?: number; max?: number }) {
    const full = Math.min(Math.max(0, Math.round(rating)), max);
    return (
        <span className="inline-flex items-center gap-0.5" aria-hidden>
            {Array.from({ length: max }, (_, i) => (
                <Star
                    key={i}
                    size={14}
                    className={i < full ? "fill-[#FF9C00] text-[#FF9C00]" : "fill-none text-[#FF9C00]"}
                    strokeWidth={2}
                />
            ))}
        </span>
    );
}

export interface CompareColumnProps {
    product: CompareProductDto;
    index: number;
    onRemove: (productId: number) => void;
    isRemoving?: boolean;
}

export default function CompareColumn({ product, index, onRemove, isRemoving }: CompareColumnProps) {
    const reviewsCount = product.reviewsCount ?? null;
    const showOldPrice = product.oldPrice != null && product.oldPrice > product.price;

    return (
        <div
            className="compare-column flex h-full min-w-[200px] max-w-[240px] flex-shrink-0 flex-col rounded-2xl"
            style={{ backgroundColor: CARD_BG }}
        >
            <div className="relative flex h-full flex-col p-4">
                {/* Індекс товару (зліва) + кнопка видалення (справа) */}
                <div className="mb-3 flex items-start justify-between">
                    <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white/80"
                        aria-hidden
                    >
                        {index}
                    </span>
                    <button
                        type="button"
                        onClick={() => onRemove(product.id)}
                        disabled={isRemoving}
                        className="rounded-full p-1.5 hover:opacity-80 disabled:opacity-50"
                        style={{ color: ACCENT }}
                        aria-label="Видалити з порівняння"
                    >
                        <X size={18} strokeWidth={2} />
                    </button>
                </div>

                {/* Зображення: по центру, з тонкою світлою обводкою/тінью */}
                <Link
                    to={`/product/${product.id}`}
                    className="flex h-[140px] w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-black/20 ring-1 ring-white/10"
                >
                    <img
                        src={buildImageSrc(product.mainImageUrl ?? null)}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain"
                    />
                </Link>

                {/* Назва: зліва, світло-сірий */}
                <Link
                    to={`/product/${product.id}`}
                    className="mt-3 line-clamp-3 text-left text-sm font-medium leading-snug hover:opacity-90"
                    style={{ color: TEXT_LIGHT }}
                >
                    {product.name}
                </Link>

                {/* Нижній ряд: ціна + рейтинг зліва, кошик справа */}
                <div className="mt-3 flex items-end justify-between gap-2">
                    <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
                        {/* Поточна ціна — велика, жирна, акцент */}
                        <span className="text-lg font-bold" style={{ color: ACCENT }}>
                            {Number(product.price).toLocaleString("uk-UA")} ₴
                        </span>
                        {showOldPrice && (
                            <span
                                className="text-sm line-through"
                                style={{ color: TEXT_MUTED }}
                            >
                                {Number(product.oldPrice).toLocaleString("uk-UA")} ₴
                            </span>
                        )}
                        <span className="flex items-center gap-1.5">
                            <StarRating rating={4} />
                            <span className="text-xs" style={{ color: TEXT_MUTED }}>
                                ({reviewsCount ?? "—"})
                            </span>
                        </span>
                    </div>
                    <Link
                        to={`/product/${product.id}`}
                        className="shrink-0 rounded-full p-2 hover:opacity-80"
                        style={{ color: ACCENT }}
                        aria-label="До сторінки товару"
                    >
                        <ShoppingCart size={22} strokeWidth={2} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
