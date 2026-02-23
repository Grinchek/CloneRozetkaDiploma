import type { CartItemDto } from "../../features/cart/api/cartApi";
import { buildProductImageSrc } from "../../features/products/utils/productImageUrl";

const PLACEHOLDER_IMG = "/icons/ZORYA-LOGO.svg";

function getImageSrc(url?: string | null): string {
    if (!url) return PLACEHOLDER_IMG;
    return buildProductImageSrc(url) ?? PLACEHOLDER_IMG;
}

interface CheckoutProductsProps {
    items: CartItemDto[];
}

export default function CheckoutProducts({ items }: CheckoutProductsProps) {
    return (
        <section className="checkout-section">
            <h2 className="checkout-section__title">Замовлення</h2>
            <div className="checkout-products">
                {items.map((item) => (
                    <article key={item.productId} className="checkout-product-card">
                        <div className="checkout-product-card__image-wrap">
                            <img
                                src={getImageSrc(item.imageUrl)}
                                alt={item.productName}
                                className="checkout-product-card__image"
                            />
                        </div>
                        <div className="checkout-product-card__body">
                            <h3 className="checkout-product-card__name">{item.productName}</h3>
                            <span className="checkout-product-card__price">
                                {item.price.toLocaleString("uk-UA")} ₴
                            </span>
                            <span className="checkout-product-card__meta">
                                {item.quantity} шт.
                            </span>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
