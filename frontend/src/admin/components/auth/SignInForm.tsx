import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useGoogleLogin, type TokenResponse } from "@react-oauth/google";

import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";

import { useLoginMutation, useLoginByGoogleMutation } from "../../../features/account/apiAccount";
import { cartApi } from "../../../features/cart/api/cartApi";

type FormState = {
    userNameOrEmail: string;
    password: string;
};

export default function SignInForm() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [showPassword, setShowPassword] = useState(false);
    const [isChecked, setIsChecked] = useState(false);

    const [form, setForm] = useState<FormState>({
        userNameOrEmail: "",
        password: "",
    });

    const [error, setError] = useState<string | null>(null);

    const [login, { isLoading: isLoginLoading }] = useLoginMutation();
    const [loginByGoogle, { isLoading: isGoogleLoading }] = useLoginByGoogleMutation();

    const isSubmitting = isLoginLoading || isGoogleLoading;

    const onChange =
        (key: keyof FormState) =>
            (e: React.ChangeEvent<HTMLInputElement>) => {
                setForm((prev) => ({ ...prev, [key]: e.target.value }));
            };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!isChecked) {
            setError("Потрібно підтвердити ознайомлення з політикою та умовами.");
            return;
        }

        try {
            const result = await login({
                userNameOrEmail: form.userNameOrEmail,
                password: form.password,
            }).unwrap();

            if (result?.token) {
                localStorage.setItem("token", result.token);
                dispatch(cartApi.util.invalidateTags(["Cart"]));
                navigate("/", { replace: true });
            } else {
                setError("Не вдалося увійти: сервер не повернув токен.");
            }
        } catch (err: any) {
            console.error("Auth error:", err);
            setError(err?.data?.message ?? "Помилка входу. Перевірте дані.");
        }
    };

    const loginUseGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse: TokenResponse) => {
            setError(null);
            try {
                const result = await loginByGoogle({
                    token: tokenResponse.access_token,
                }).unwrap();

                if (result?.token) {
                    localStorage.setItem("token", result.token);
                    dispatch(cartApi.util.invalidateTags(["Cart"]));
                    navigate("/", { replace: true });
                } else {
                    setError("Google-вхід: сервер не повернув токен.");
                }
            } catch (err: any) {
                console.error("Google auth error:", err);
                setError(err?.data?.message ?? "Помилка входу через Google.");
            }
        },
        onError: (err) => {
            console.error("Google auth error:", err);
            setError("Не вдалося виконати Google-вхід.");
        },
    });

    return (
        <div className="w-[520px] max-w-full">
            {/* Card як на макеті */}
            <div className="rounded-[36px] bg-[#9B9B9B] px-10 py-10 text-white">
                {/* Title */}
                <h1 className="mb-8 text-center text-[28px] font-semibold tracking-wide">
                    Вхід
                </h1>

                {/* Error */}
                {error && (
                    <div className="mb-5 rounded-xl bg-black/15 px-4 py-3 text-sm text-white">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email */}
                    <div>
                        <Label>
                            <span className="block text-xs text-white/80">E-mail</span>
                        </Label>

                        <Input
                            placeholder="user123@gmail.com"
                            value={form.userNameOrEmail}
                            onChange={onChange("userNameOrEmail")}
                            disabled={isSubmitting}
                            className="mt-2 h-12 w-full rounded-xl bg-white/10 px-4 text-sm text-white placeholder:text-white/40 border border-white/20 focus:border-[#F5A623] outline-none disabled:opacity-70 transition-colors"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <Label>
                            <span className="block text-xs text-white/80">Введіть пароль</span>
                        </Label>

                        <div className="relative mt-2">
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="1234Aa!5678"
                                value={form.password}
                                onChange={onChange("password")}
                                disabled={isSubmitting}
                                className="h-12 w-full rounded-xl bg-white/10 px-4 pr-12 text-sm text-white placeholder:text-white/40 border border-white/20 focus:border-[#F5A623] outline-none disabled:opacity-70 transition-colors"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword((p) => !p)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
                                aria-label={showPassword ? "Приховати пароль" : "Показати пароль"}
                            >
                                {showPassword ? (
                                    <EyeIcon className="size-5 fill-[#F5A623]" />
                                ) : (
                                    <EyeCloseIcon className="size-5 fill-[#F5A623]" />
                                )}
                            </button>
                        </div>

                        <div className="mt-2 text-[11px] text-[#FFD89F] cursor-pointer hover:underline">Не пам’ятаю пароль</div>
                    </div>

                    {/* Policy checkbox */}
                    <div className="flex items-start gap-3">
                        <div className="mt-1">
                            <Checkbox checked={isChecked} onChange={setIsChecked} />
                        </div>

                        <div className="text-[12px] leading-snug text-white/70">
                            Натискаючи галочку, ви підтверджуєте що ознайомились з політикою
                            конфіденційності та умовами використання
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="pt-2">
                        <Button
                            className="h-12 w-full rounded-xl bg-[#F5A623] text-white hover:bg-[#D48D1C] font-semibold transition-all active:scale-[0.98] shadow-lg shadow-[#F5A623]/20"
                            size="sm"
                            disabled={isSubmitting}
                        >
                            {isLoginLoading ? "Вхід..." : "Увійти"}
                        </Button>
                    </div>
                </form>

                {/* Bottom text */}
                <div className="mt-6 text-center text-sm text-white/80">
                    Не маєте профілю?{" "}
                    <Link to="/signup" className="underline underline-offset-2">
                        Зареєструйтесь!
                    </Link>
                </div>

                {/* Social icons */}
                <div className="mt-6 flex items-center justify-center gap-6">
                    {/* Google */}
                    <button
                        type="button"
                        onClick={() => loginUseGoogle()}
                        disabled={isSubmitting}
                        className="grid h-11 w-11 place-items-center rounded-full bg-transparent disabled:opacity-60"
                        aria-label="Увійти через Google"
                        title="Google"
                    >
                        {/* Google icon  */}
                        <svg width="34" height="34" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18.7511 10.1944C18.7511 9.47495 18.6915 8.94995 18.5626 8.40552H10.1797V11.6527H15.1003C15.0011 12.4597 14.4654 13.675 13.2749 14.4916L13.2582 14.6003L15.9087 16.6126L16.0924 16.6305C17.7788 15.1041 18.7511 12.8583 18.7511 10.1944Z" fill="#4285F4" />
                            <path d="M10.1788 18.75C12.5895 18.75 14.6133 17.9722 16.0915 16.6305L13.274 14.4916C12.5201 15.0068 11.5081 15.3666 10.1788 15.3666C7.81773 15.3666 5.81379 13.8402 5.09944 11.7305L4.99473 11.7392L2.23868 13.8295L2.20264 13.9277C3.67087 16.786 6.68674 18.75 10.1788 18.75Z" fill="#34A853" />
                            <path d="M5.10014 11.7305C4.91165 11.186 4.80257 10.6027 4.80257 9.99992C4.80257 9.3971 4.91165 8.81379 5.09022 8.26935L5.08523 8.1534L2.29464 6.02954L2.20333 6.0721C1.5982 7.25823 1.25098 8.5902 1.25098 9.99992C1.25098 11.4096 1.5982 12.7415 2.20333 13.9277L5.10014 11.7305Z" fill="#FBBC05" />
                            <path d="M10.1789 4.63331C11.8554 4.63331 12.9864 5.34303 13.6312 5.93612L16.1511 3.525C14.6035 2.11528 12.5895 1.25 10.1789 1.25C6.68676 1.25 3.67088 3.21387 2.20264 6.07218L5.08953 8.26943C5.81381 6.15972 7.81776 4.63331 10.1789 4.63331Z" fill="#EB4335" />
                        </svg>
                    </button>

                    {/* Apple  */}
                    <button
                        type="button"
                        className="grid h-11 w-11 place-items-center rounded-full"
                        aria-label="Apple (soon)"
                        title="Apple"
                    >
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16.365 1.43c0 1.14-.468 2.203-1.24 3.02-.84.89-2.228 1.58-3.43 1.48-.16-1.11.33-2.24 1.08-3.06.83-.92 2.27-1.59 3.59-1.44ZM20.5 17.2c-.54 1.23-.8 1.78-1.49 2.87-.96 1.5-2.32 3.37-4.01 3.38-1.5.01-1.88-.98-3.91-.98-2.03 0-2.45.96-3.92.99-1.69.02-2.98-1.7-3.94-3.2-2.7-4.2-2.98-9.12-1.32-11.68 1.17-1.8 3.03-2.85 4.78-2.85 1.78 0 2.9.99 4.38.99 1.44 0 2.31-1 4.36-1 1.56 0 3.22.85 4.39 2.32-3.86 2.11-3.24 7.6.68 9.16Z" />
                        </svg>
                    </button>

                    {/* Facebook */}
                    <button
                        type="button"
                        className="grid h-11 w-11 place-items-center rounded-full"
                        aria-label="Facebook (soon)"
                        title="Facebook"
                    >
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 12.07C22 6.48 17.52 2 11.93 2S1.86 6.48 1.86 12.07c0 5.05 3.66 9.24 8.44 10.05v-7.1H7.9v-2.95h2.4V9.82c0-2.37 1.41-3.68 3.58-3.68 1.04 0 2.13.18 2.13.18v2.34h-1.2c-1.18 0-1.55.73-1.55 1.48v1.78h2.64l-.42 2.95h-2.22v7.1c4.78-.81 8.44-5 8.44-10.05Z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
