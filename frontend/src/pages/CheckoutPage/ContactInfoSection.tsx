import { User, MapPin, Phone } from "lucide-react";
import type { NpCity } from "../../features/shipping/api/shippingApi";

interface ContactInfoSectionProps {
    recipientName: string;
    recipientPhone: string;
    cityQuery: string;
    setCityQuery: (v: string) => void;
    cityDropdownOpen: boolean;
    setCityDropdownOpen: (v: boolean) => void;
    cities: NpCity[];
    citiesLoading: boolean;
    onSelectCity: (c: NpCity) => void;
    onNameChange: (value: string) => void;
    onPhoneChange: (value: string) => void;
    errors: Record<string, string>;
}

export default function ContactInfoSection({
    recipientName,
    recipientPhone,
    cityQuery,
    setCityQuery,
    cityDropdownOpen,
    setCityDropdownOpen,
    cities,
    citiesLoading,
    onSelectCity,
    onNameChange,
    onPhoneChange,
    errors,
}: ContactInfoSectionProps) {
    return (
        <section className="checkout-section">
            <h2 className="checkout-section__title">Контактні дані</h2>
            <div className="checkout-contact">
                <div className="checkout-contact-capsule">
                    <span className="checkout-contact-capsule__icon" aria-hidden>
                        <User size={20} />
                    </span>
                    <div className="checkout-contact-capsule__content">
                        <div className="checkout-contact-capsule__label">П.І.Б. отримувача</div>
                        <input
                            type="text"
                            value={recipientName}
                            onChange={(e) => onNameChange(e.target.value)}
                            className="checkout-contact-capsule__input"
                            placeholder="Введіть ПІБ"
                        />
                    </div>
                    <button type="button" className="checkout-contact-capsule__btn">
                        Змінити
                    </button>
                </div>
                {errors.recipientName && (
                    <p className="checkout-contact__error">{errors.recipientName}</p>
                )}

                <div className="checkout-contact-capsule checkout-contact-capsule--with-dropdown">
                    <span className="checkout-contact-capsule__icon" aria-hidden>
                        <MapPin size={20} />
                    </span>
                    <div className="checkout-contact-capsule__content">
                        <div className="checkout-contact-capsule__label">Місто отримувача</div>
                        <input
                            type="text"
                            value={cityQuery}
                            onChange={(e) => {
                                setCityQuery(e.target.value);
                                setCityDropdownOpen(true);
                            }}
                            onFocus={() => setCityDropdownOpen(true)}
                            className="checkout-contact-capsule__input"
                            placeholder="Почніть вводити назву міста"
                        />
                    </div>
                    <button type="button" className="checkout-contact-capsule__btn">
                        Змінити
                    </button>
                    {cityDropdownOpen && (
                        <div className="checkout-contact__dropdown" role="listbox">
                            {citiesLoading ? (
                                <div className="checkout-contact__dropdown-item">
                                    Завантаження...
                                </div>
                            ) : cities.length === 0 ? (
                                <div className="checkout-contact__dropdown-item">
                                    Введіть місто (мінімум 2 символи)
                                </div>
                            ) : (
                                cities.map((c) => (
                                    <button
                                        key={c.ref}
                                        type="button"
                                        role="option"
                                        className="checkout-contact__dropdown-item"
                                        onClick={() => onSelectCity(c)}
                                    >
                                        {c.name}
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>
                {errors.city && <p className="checkout-contact__error">{errors.city}</p>}

                <div className="checkout-contact-capsule">
                    <span className="checkout-contact-capsule__icon" aria-hidden>
                        <Phone size={20} />
                    </span>
                    <div className="checkout-contact-capsule__content">
                        <div className="checkout-contact-capsule__label">Номер телефону отримувача</div>
                        <input
                            type="tel"
                            value={recipientPhone}
                            onChange={(e) => onPhoneChange(e.target.value)}
                            className="checkout-contact-capsule__input"
                            placeholder="+380..."
                        />
                    </div>
                    <button type="button" className="checkout-contact-capsule__btn">
                        Змінити
                    </button>
                </div>
                {errors.recipientPhone && (
                    <p className="checkout-contact__error">{errors.recipientPhone}</p>
                )}
            </div>
        </section>
    );
}
