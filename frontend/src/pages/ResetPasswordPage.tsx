import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useResetPasswordMutation } from '../features/account/apiAccount';

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email') ?? '';
    const token = searchParams.get('token') ?? '';

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [reset, { isLoading, isSuccess, isError, error }] = useResetPasswordMutation();
    const [localError, setLocalError] = useState('');

    useEffect(() => {
        setLocalError('');
    }, [newPassword, confirmPassword]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError('');
        if (!token || !email) {
            setLocalError('Некоректне посилання. Запитайте новий лист для скидання пароля.');
            return;
        }
        if (newPassword.length < 6) {
            setLocalError('Пароль має бути не коротшим за 6 символів.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setLocalError('Паролі не збігаються.');
            return;
        }
        await reset({ email, token, newPassword });
    };

    if (!token || !email) {
        return (
            <div className="max-w-md mx-auto px-6 py-20 text-center">
                <h1 className="text-2xl font-bold text-[#404236] mb-4">Некоректне посилання</h1>
                <p className="text-gray-500 mb-6">Використайте посилання з листа або <Link to="/forgot-password" className="text-[#F5A623] font-medium hover:underline">запитайте новий лист</Link>.</p>
                <Link to="/login" className="inline-block py-3 px-6 bg-[#F5A623] text-white font-bold rounded-xl">Увійти</Link>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto px-6 py-20">
            <h1 className="text-2xl font-bold text-[#404236] mb-2">Новий пароль</h1>
            <p className="text-gray-500 mb-6">Введіть новий пароль для {email}</p>

            {isSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800">
                    Пароль змінено. Тепер ви можете увійти.
                </div>
            )}

            {(isError || localError) && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
                    {localError || ((error as { data?: { error?: string } })?.data?.error ?? 'Не вдалося змінити пароль.')}
                </div>
            )}

            {!isSuccess && (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <label className="block">
                        <span className="block text-sm font-medium text-gray-700 mb-1">Новий пароль</span>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F5A623] focus:border-[#F5A623]"
                        />
                    </label>
                    <label className="block">
                        <span className="block text-sm font-medium text-gray-700 mb-1">Підтвердіть пароль</span>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F5A623] focus:border-[#F5A623]"
                        />
                    </label>
                    <button
                        type="submit"
                        disabled={isLoading || newPassword !== confirmPassword}
                        className="w-full py-3 bg-[#F5A623] text-white font-bold rounded-xl hover:bg-[#D48D1C] disabled:opacity-50"
                    >
                        {isLoading ? 'Зміна...' : 'Змінити пароль'}
                    </button>
                </form>
            )}

            <p className="mt-6 text-center">
                <Link to="/login" className="text-[#F5A623] font-medium hover:underline">Увійти</Link>
            </p>
        </div>
    );
}
