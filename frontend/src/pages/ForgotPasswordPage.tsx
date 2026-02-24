import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForgotPasswordMutation } from '../features/account/apiAccount';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [forgot, { isLoading, isSuccess, isError, error }] = useForgotPasswordMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        await forgot({ email: email.trim() });
    };

    return (
        <div className="max-w-md mx-auto px-6 py-20">
            <h1 className="text-2xl font-bold text-[#404236] mb-2">Відновлення пароля</h1>
            <p className="text-gray-500 mb-6">Введіть email — ми надішлемо посилання для скидання пароля.</p>

            {isSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800">
                    Лист надіслано. Перевірте пошту (в т.ч. папку «Спам»).
                </div>
            )}

            {isError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
                    {((error as { data?: { Errors?: { Email?: string } } })?.data?.Errors?.Email)
                        ?? 'Користувача з такою поштою не існує'}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block">
                    <span className="block text-sm font-medium text-gray-700 mb-1">Email</span>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F5A623] focus:border-[#F5A623]"
                        placeholder="your@email.com"
                    />
                </label>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-[#F5A623] text-white font-bold rounded-xl hover:bg-[#D48D1C] disabled:opacity-50"
                >
                    {isLoading ? 'Надсилання...' : 'Надіслати лист'}
                </button>
            </form>

            <p className="mt-6 text-center">
                <Link to="/login" className="text-[#F5A623] font-medium hover:underline">Повернутися до входу</Link>
            </p>
        </div>
    );
}
