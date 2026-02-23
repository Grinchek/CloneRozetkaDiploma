interface OrderSummaryProps {
    itemCount: number;
    totalPrice: number;
    isSubmitting: boolean;
    submitError: string | undefined;
}

export default function OrderSummary({
    itemCount,
    totalPrice,
    isSubmitting,
    submitError,
}: OrderSummaryProps) {
    const formattedTotal = totalPrice.toLocaleString("uk-UA");
    const itemsLabel =
        itemCount === 1 ? "1 товар на суму" : `${itemCount} товари на суму`;

    return (
        <aside className="checkout-summary">
            <h2 className="checkout-summary__title">Разом</h2>
            <div className="checkout-summary__rows">
                <div className="checkout-summary__row">
                    <span className="checkout-summary__label">{itemsLabel}</span>
                    <span className="checkout-summary__value">{formattedTotal} ₴</span>
                </div>
                <div className="checkout-summary__row">
                    <span className="checkout-summary__label">вартість доставки:</span>
                    <span className="checkout-summary__value checkout-summary__value--muted">
                        за тарифами перевізника
                    </span>
                </div>
                <div className="checkout-summary__row checkout-summary__row--total">
                    <span className="checkout-summary__label">До сплати:</span>
                    <span className="checkout-summary__value checkout-summary__value--accent">
                        {formattedTotal} ₴
                    </span>
                </div>
            </div>
            {submitError && (
                <p className="checkout-summary__error">{submitError}</p>
            )}
            <button
                type="submit"
                disabled={isSubmitting}
                className="checkout-summary__submit"
            >
                {isSubmitting ? "Створення..." : "Замовлення підтверджую"}
            </button>
            <p className="checkout-summary__legal">
                Натискаючи кнопку, ви погоджуєтесь з умовами обробки даних та
                договору оферти.
            </p>
        </aside>
    );
}
