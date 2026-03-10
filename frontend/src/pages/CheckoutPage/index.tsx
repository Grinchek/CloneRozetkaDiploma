import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useGetCartQuery } from "../../features/cart/api/cartApi";
import { useCreateOrderMutation } from "../../features/orders/api/ordersApi";
import { useLazyGetNpCitiesQuery, useLazyGetNpWarehousesQuery } from "../../features/shipping/api/shippingApi";
import { useMeQuery } from "../../features/account/apiAccount";
import type { NpCity, NpWarehouse } from "../../features/shipping/api/shippingApi";

import CheckoutProducts from "./CheckoutProducts";
import ContactInfoSection from "./ContactInfoSection";
import DeliverySection from "./DeliverySection";
import OrderSummary from "./OrderSummary";
import PaymentSection from "./PaymentSection";

import "./CheckoutPage.css";

const DEBOUNCE_MS = 400;

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debouncedValue;
}

type CheckoutStep = "details" | "payment";

export default function CheckoutPage() {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const { data: cart, isLoading: cartLoading, refetch: refetchCart } = useGetCartQuery(undefined, { skip: !token });
    const navigate = useNavigate();
    const [createOrder, { isLoading: isSubmitting }] = useCreateOrderMutation();
    const [fetchCities, { data: cities = [], isFetching: citiesLoading }] = useLazyGetNpCitiesQuery();
    const [fetchWarehouses, { data: warehouses = [], isFetching: warehousesLoading }] = useLazyGetNpWarehousesQuery();

    const { data: me, isSuccess: isAuth } = useMeQuery();
    const items = cart?.items ?? [];
    const totalPrice = cart?.totalPrice ?? 0;

    const [recipientName, setRecipientName] = useState("");
    const [recipientPhone, setRecipientPhone] = useState("");
    const [cityQuery, setCityQuery] = useState("");
    const [selectedCity, setSelectedCity] = useState<NpCity | null>(null);
    const [selectedWarehouse, setSelectedWarehouse] = useState<NpWarehouse | null>(null);
    const [comment, setComment] = useState("");
    const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
    const [warehouseDropdownOpen, setWarehouseDropdownOpen] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [step, setStep] = useState<CheckoutStep>("details");

    const [cardNumber, setCardNumber] = useState("");
    const [cardExpiry, setCardExpiry] = useState("");
    const [cardCvv, setCardCvv] = useState("");
    const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>({});

    const debouncedCityQuery = useDebounce(cityQuery, DEBOUNCE_MS);

    useEffect(() => {
        if (!isAuth) return;
        if (!cartLoading && cart && items.length === 0) {
            navigate("/cart", { replace: true });
            return;
        }
    }, [isAuth, cartLoading, cart, items.length, navigate]);

    useEffect(() => {
        if (debouncedCityQuery.trim().length >= 2) fetchCities(debouncedCityQuery.trim());
        else setSelectedCity(null);
    }, [debouncedCityQuery, fetchCities]);

    useEffect(() => {
        if (selectedCity?.ref) fetchWarehouses(selectedCity.ref);
        else setSelectedWarehouse(null);
    }, [selectedCity?.ref, fetchWarehouses]);

    const validate = useCallback((): boolean => {
        const e: Record<string, string> = {};
        if (!recipientName.trim()) e.recipientName = "Вкажіть ім'я отримувача";
        if (!recipientPhone.trim()) e.recipientPhone = "Вкажіть телефон";
        if (!selectedCity) e.city = "Оберіть місто";
        if (!selectedWarehouse) e.warehouse = "Оберіть відділення";
        setErrors(e);
        return Object.keys(e).length === 0;
    }, [recipientName, recipientPhone, selectedCity, selectedWarehouse]);

    const validatePayment = useCallback((): boolean => {
        const e: Record<string, string> = {};
        const digits = cardNumber.replace(/\s+/g, "");
        if (digits.length !== 16 || !/^\d{16}$/.test(digits)) {
            e.cardNumber = "Введіть коректний номер картки (16 цифр)";
        }

        if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
            e.expiry = "Введіть термін у форматі MM/YY";
        } else {
            const [mmStr, yyStr] = cardExpiry.split("/");
            const month = Number(mmStr);
            const year = Number(yyStr);
            if (month < 1 || month > 12) {
                e.expiry = "Невірний місяць";
            } else {
                const now = new Date();
                const currentYear = now.getFullYear() % 100;
                const currentMonth = now.getMonth() + 1;
                if (year < currentYear || (year === currentYear && month < currentMonth)) {
                    e.expiry = "Картка прострочена";
                }
            }
        }

        if (!/^\d{3}$/.test(cardCvv)) {
            e.cvv = "CVV має містити 3 цифри";
        }

        setPaymentErrors(e);
        return Object.keys(e).length === 0;
    }, [cardNumber, cardExpiry, cardCvv]);

    const handleCreateOrder = async () => {
        if (!isAuth || items.length === 0) return;
        if (!selectedCity || !selectedWarehouse) return;

        try {
            const res = await createOrder({
                recipientName: recipientName.trim(),
                recipientPhone: recipientPhone.trim(),
                npCityRef: selectedCity.ref,
                npCityName: selectedCity.name,
                npWarehouseRef: selectedWarehouse.ref,
                npWarehouseName: selectedWarehouse.name,
                comment: comment.trim() || undefined,
            }).unwrap();
            await refetchCart();
            navigate(`/orders/${res.orderId}`, { replace: true });
        } catch (err: unknown) {
            const msg = err && typeof err === "object" && "data" in err
                ? (err as { data?: { errors?: string[] } }).data?.errors?.join(", ")
                : "Не вдалося створити замовлення";
            setErrors({ submit: msg ?? "Помилка" });
        }
    };

    const handlePrimaryAction = async () => {
        if (!isAuth || items.length === 0) return;
        if (step === "details") {
            if (!validate() || !selectedCity || !selectedWarehouse) return;
            setStep("payment");
            return;
        }

        if (!validatePayment()) return;
        await handleCreateOrder();
    };

    if (!isAuth && me !== undefined) {
        return (
            <div className="checkout">
                <div className="checkout__auth-wrap">
                    <h1 className="checkout__title">Увійдіть в акаунт</h1>
                    <p className="checkout__auth-text">
                        Щоб оформити замовлення, потрібно авторизуватися.
                    </p>
                    <Link to="/login" className="checkout-summary__submit checkout__auth-btn">
                        Увійти
                    </Link>
                </div>
            </div>
        );
    }

    if (cartLoading || (isAuth && items.length === 0 && cart)) {
        return (
            <div className="checkout">
                <p className="checkout__loading">Завантаження…</p>
            </div>
        );
    }

    if (items.length === 0 && isAuth) {
        return null;
    }

    return (
        <div className="checkout">
            <h1 className="checkout__title">Оформлення замовлення</h1>

            <form
                id="checkout-form"
                onSubmit={(e) => e.preventDefault()}
                className="checkout__grid"
            >
                <div className="checkout__main">
                    <CheckoutProducts items={items} />

                    <ContactInfoSection
                        recipientName={recipientName}
                        recipientPhone={recipientPhone}
                        cityQuery={cityQuery}
                        setCityQuery={setCityQuery}
                        cityDropdownOpen={cityDropdownOpen}
                        setCityDropdownOpen={setCityDropdownOpen}
                        cities={cities}
                        citiesLoading={citiesLoading}
                        onSelectCity={(c) => {
                            setSelectedCity(c);
                            setCityQuery(c.name);
                            setCityDropdownOpen(false);
                        }}
                        onNameChange={setRecipientName}
                        onPhoneChange={setRecipientPhone}
                        errors={errors}
                    />

                    <DeliverySection
                        selectedCity={selectedCity}
                        selectedWarehouse={selectedWarehouse}
                        warehouseDropdownOpen={warehouseDropdownOpen}
                        setWarehouseDropdownOpen={setWarehouseDropdownOpen}
                        warehouses={warehouses}
                        warehousesLoading={warehousesLoading}
                        onSelectWarehouse={(w) => {
                            setSelectedWarehouse(w);
                            setWarehouseDropdownOpen(false);
                        }}
                        errors={errors}
                        comment={comment}
                        setComment={setComment}
                    />

                    {step === "payment" && (
                        <PaymentSection
                            cardNumber={cardNumber}
                            expiry={cardExpiry}
                            cvv={cardCvv}
                            onCardNumberChange={setCardNumber}
                            onExpiryChange={setCardExpiry}
                            onCvvChange={setCardCvv}
                            errors={paymentErrors}
                            onBack={() => setStep("details")}
                        />
                    )}
                </div>

                <OrderSummary
                    itemCount={items.length}
                    totalPrice={totalPrice}
                    isSubmitting={isSubmitting}
                    submitError={errors.submit}
                    primaryLabel={step === "details" ? "Перейти до оплати" : "Замовлення підтверджую"}
                    onPrimaryAction={handlePrimaryAction}
                />
            </form>
        </div>
    );
}
