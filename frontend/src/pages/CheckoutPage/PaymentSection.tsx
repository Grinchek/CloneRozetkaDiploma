import type React from "react";

interface PaymentSectionProps {
    cardNumber: string;
    expiry: string;
    cvv: string;
    onCardNumberChange: (value: string) => void;
    onExpiryChange: (value: string) => void;
    onCvvChange: (value: string) => void;
    errors: Record<string, string>;
    onBack: () => void;
}

export default function PaymentSection({
    cardNumber,
    expiry,
    cvv,
    onCardNumberChange,
    onExpiryChange,
    onCvvChange,
    errors,
    onBack,
}: PaymentSectionProps) {
    const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
        const grouped = raw.replace(/(.{4})/g, "$1 ").trim();
        onCardNumberChange(grouped);
    };

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/[^0-9]/g, "").slice(0, 4);
        if (value.length >= 3) {
            value = `${value.slice(0, 2)}/${value.slice(2)}`;
        }
        onExpiryChange(value);
    };

    const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, "").slice(0, 3);
        onCvvChange(value);
    };

    return (
        <section className="checkout-payment">
            <div className="checkout-payment__header">
                <h2 className="checkout-section__title">Оплата карткою</h2>
                <button type="button" className="checkout-payment__back" onClick={onBack}>
                    Змінити дані доставки
                </button>
            </div>

            <div className="checkout-payment__card">
                <div className="checkout-payment__field">
                    <label className="checkout-payment__label" htmlFor="card-number">
                        Номер картки
                    </label>
                    <input
                        id="card-number"
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="0000 0000 0000 0000"
                        className="checkout-payment__input"
                        value={cardNumber}
                        onChange={handleCardChange}
                    />
                    {errors.cardNumber && (
                        <p className="checkout-payment__error">{errors.cardNumber}</p>
                    )}
                </div>

                <div className="checkout-payment__row">
                    <div className="checkout-payment__field">
                        <label className="checkout-payment__label" htmlFor="card-expiry">
                            Термін дії
                        </label>
                        <input
                            id="card-expiry"
                            type="text"
                            inputMode="numeric"
                            autoComplete="off"
                            placeholder="MM/YY"
                            className="checkout-payment__input"
                            value={expiry}
                            onChange={handleExpiryChange}
                        />
                        {errors.expiry && (
                            <p className="checkout-payment__error">{errors.expiry}</p>
                        )}
                    </div>

                    <div className="checkout-payment__field">
                        <label className="checkout-payment__label" htmlFor="card-cvv">
                            CVV
                        </label>
                        <input
                            id="card-cvv"
                            type="password"
                            inputMode="numeric"
                            autoComplete="off"
                            placeholder="000"
                            className="checkout-payment__input"
                            value={cvv}
                            onChange={handleCvvChange}
                        />
                        {errors.cvv && (
                            <p className="checkout-payment__error">{errors.cvv}</p>
                        )}
                    </div>
                </div>

                <p className="checkout-payment__hint">
                    Дані картки використовуються лише для імітації оплати на цій сторінці та
                    нікуди не передаються і не зберігаються.
                </p>
            </div>
        </section>
    );
}

