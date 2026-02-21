import { useState } from "react";
import { buildProductImageCandidates } from "../utils/productImageUrl";

type Props = {
    mainImageUrl?: string | null;
    alt: string;
    className?: string;
    loading?: "lazy" | "eager";
    /** Якщо всі URL не завантажились */
    fallback?: React.ReactNode;
};

/**
 * Зображення товару з fallback: спочатку 200_xxx, при 404 — без префікса, потім fallback.
 */
export default function ProductImage({ mainImageUrl, alt, className, loading, fallback }: Props) {
    const candidates = buildProductImageCandidates(mainImageUrl);
    const [idx, setIdx] = useState(0);
    const [allFailed, setAllFailed] = useState(false);
    const src = candidates[idx] ?? null;

    if (!src || allFailed) {
        return <>{fallback ?? <div className={className} />}</>;
    }

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            loading={loading}
            onError={() => {
                if (idx + 1 < candidates.length) setIdx((i) => i + 1);
                else setAllFailed(true);
            }}
        />
    );
}
