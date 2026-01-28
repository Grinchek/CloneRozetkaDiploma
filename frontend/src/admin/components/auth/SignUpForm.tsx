import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin, type TokenResponse } from "@react-oauth/google";

import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "../../icons";

import {
    useRegisterMutation,
    useLoginByGoogleMutation,
} from "../../../features/account/apiAccount";

export default function SignUpForm() {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [isChecked, setIsChecked] = useState(false);

    const [form, setForm] = useState({
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [error, setError] = useState<string | null>(null);

    const [register, { isLoading: isRegisterLoading }] = useRegisterMutation();
    const [loginByGoogle, { isLoading: isGoogleLoading }] =
        useLoginByGoogleMutation();

    const isSubmitting = isRegisterLoading || isGoogleLoading;

    const onChange =
        (key: keyof typeof form) =>
            (e: React.ChangeEvent<HTMLInputElement>) => {
                setForm((prev) => ({ ...prev, [key]: e.target.value }));
            };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!isChecked) {
            setError(
                "Потрібно підтвердити ознайомлення з політикою та умовами використання."
            );
            return;
        }

        if (form.password !== form.confirmPassword) {
            setError("Паролі не співпадають.");
            return;
        }

        try {
            const fd = new FormData();
            fd.append("userName", form.email);
            fd.append("email", form.email);
            fd.append("password", form.password);

            const result = await register(fd as any).unwrap();

            if (result?.token) {
                localStorage.setItem("token", result.token);
                navigate("/", { replace: true });
            } else {
                setError("Реєстрація пройшла, але сервер не повернув токен.");
            }
        } catch (err: any) {
            console.error("Register error:", err);
            setError(err?.data?.message ?? "Помилка реєстрації.");
        }
    };

    const signUpWithGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse: TokenResponse) => {
            try {
                const result = await loginByGoogle({
                    token: tokenResponse.access_token,
                }).unwrap();

                if (result?.token) {
                    localStorage.setItem("token", result.token);
                    navigate("/", { replace: true });
                }
            } catch {
                setError("Помилка реєстрації через Google.");
            }
        },
    });

    return (
        <div className="w-[520px] max-w-full">
            <div className="rounded-[36px] bg-[#9B9B9B] px-10 py-10 text-white">
                {/* Title */}
                <h1 className="mb-8 text-center text-[28px] font-semibold">
                    Реєстрація
                </h1>

                {error && (
                    <div className="mb-5 rounded-xl bg-black/20 px-4 py-3 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email */}
                    <div>
                        <Label>
                            <span className="text-xs text-white/80">E-mail</span>
                        </Label>
                        <Input
                            placeholder="user123@gmail.com"
                            value={form.email}
                            onChange={onChange("email")}
                            disabled={isSubmitting}
                            className="mt-2 h-12 w-full rounded-xl bg-[#CFCFCF] px-4 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <Label>
                            <span className="text-xs text-white/80">Придумайте пароль</span>
                        </Label>
                        <div className="relative mt-2">
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="1234Aa!5678"
                                value={form.password}
                                onChange={onChange("password")}
                                disabled={isSubmitting}
                                className="h-12 w-full rounded-xl bg-[#CFCFCF] px-4 pr-12 text-sm text-gray-800"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute right-4 top-1/2 -translate-y-1/2"
                            >
                                {showPassword ? (
                                    <EyeIcon className="size-5 fill-gray-600" />
                                ) : (
                                    <EyeCloseIcon className="size-5 fill-gray-600" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Confirm password */}
                    <div>
                        <Label>
                            <span className="text-xs text-white/80">Повторіть пароль</span>
                        </Label>
                        <Input
                            type="password"
                            placeholder="1234Aa!5678"
                            value={form.confirmPassword}
                            onChange={onChange("confirmPassword")}
                            disabled={isSubmitting}
                            className="mt-2 h-12 w-full rounded-xl bg-[#CFCFCF] px-4 text-sm text-gray-800"
                        />
                    </div>

                    {/* Policy */}
                    <div className="flex items-start gap-3">
                        <Checkbox checked={isChecked} onChange={setIsChecked} />
                        <p className="text-[12px] leading-snug text-white/70">
                            Натискаючи галочку, ви підтверджуєте що ознайомились з політикою
                            конфіденційності та умовами використання
                        </p>
                    </div>

                    {/* Submit */}
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="h-12 w-full rounded-xl bg-[#CFCFCF] text-white hover:bg-[#CFCFCF]"
                    >
                        {isRegisterLoading ? "Реєстрація..." : "Зареєструватись"}
                    </Button>
                </form>

                {/* Bottom text */}
                <div className="mt-6 text-center text-sm text-white/80">
                    Вже зареєстровані?{" "}
                    <Link to="/signin" className="underline underline-offset-2">
                        Увійти
                    </Link>
                </div>

                {/* Social icons */}
                <div className="mt-8 flex justify-center gap-8">
                    {/* Google */}
                    <button
                        type="button"
                        onClick={() => signUpWithGoogle()}
                        disabled={isSubmitting}
                        className="grid h-11 w-11 place-items-center rounded-full bg-transparent disabled:opacity-60"
                        aria-label="Увійти через Google"
                        title="Google"
                    >
                        <img
                            src="/icons/google.svg"
                            alt="Google"
                            className="h-6 w-6"
                        />
                    </button>

                    {/* Apple */}
                    <button
                        type="button"
                        className="flex h-10 w-10 items-center justify-center"
                        aria-label="Apple"
                    >
                        <img
                            src="/icons/apple.svg"
                            alt="Apple"
                            className="h-6 w-6"
                        />
                    </button>

                    {/* Facebook */}
                    <button
                        type="button"
                        className="flex h-10 w-10 items-center justify-center"
                        aria-label="Facebook"
                    >
                        <img
                            src="/icons/facebook.svg"
                            alt="Facebook"
                            className="h-6 w-6"
                        />
                    </button>
                </div>


            </div>
        </div>
    );
}
