import type { NpCity, NpWarehouse } from "../../features/shipping/api/shippingApi";

interface DeliverySectionProps {
    selectedCity: NpCity | null;
    selectedWarehouse: NpWarehouse | null;
    warehouseDropdownOpen: boolean;
    setWarehouseDropdownOpen: (v: boolean) => void;
    warehouses: NpWarehouse[];
    warehousesLoading: boolean;
    onSelectWarehouse: (w: NpWarehouse) => void;
    errors: Record<string, string>;
    comment: string;
    setComment: (v: string) => void;
}

export default function DeliverySection({
    selectedCity,
    selectedWarehouse,
    warehouseDropdownOpen,
    setWarehouseDropdownOpen,
    warehouses,
    warehousesLoading,
    onSelectWarehouse,
    errors,
    comment,
    setComment,
}: DeliverySectionProps) {
    return (
        <section className="checkout-section">
            <h2 className="checkout-section__title">Доставка</h2>
            <div className="checkout-delivery">
                <div className="checkout-delivery__row">
                    <span className="checkout-delivery__option-text">
                        Самовивіз з Нової Пошти (Середній термін доставки: 3 дні)
                    </span>
                    <button type="button" className="checkout-delivery__option-btn">
                        Змінити
                    </button>
                </div>
                <div className="checkout-delivery__fields">
                    <div className="checkout-delivery__field checkout-delivery__field-wrap">
                        <label className="checkout-delivery__field-label">Відділення *</label>
                        <input
                            type="text"
                            readOnly
                            value={selectedWarehouse?.name ?? ""}
                            onFocus={() => setWarehouseDropdownOpen(true)}
                            placeholder={
                                selectedCity
                                    ? "Оберіть відділення"
                                    : "Спочатку оберіть місто"
                            }
                            className="checkout-delivery__field-input readonly"
                        />
                        {warehouseDropdownOpen && selectedCity && (
                            <div className="checkout-delivery__dropdown" role="listbox">
                                {warehousesLoading ? (
                                    <div className="checkout-delivery__dropdown-item">
                                        Завантаження...
                                    </div>
                                ) : warehouses.length === 0 ? (
                                    <div className="checkout-delivery__dropdown-item">
                                        Немає відділень
                                    </div>
                                ) : (
                                    warehouses.map((w) => (
                                        <button
                                            key={w.ref}
                                            type="button"
                                            role="option"
                                            className="checkout-delivery__dropdown-item"
                                            onClick={() => onSelectWarehouse(w)}
                                        >
                                            {w.name}
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                        {errors.warehouse && (
                            <p className="checkout-delivery__error">{errors.warehouse}</p>
                        )}
                    </div>
                </div>
            </div>
            <div className="checkout-comment">
                <label htmlFor="checkout-comment" className="checkout-comment__label">
                    Коментар
                </label>
                <textarea
                    id="checkout-comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={2}
                    className="checkout-comment__textarea"
                    placeholder="Необов'язково"
                />
            </div>
        </section>
    );
}
