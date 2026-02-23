import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE;

export default function ConfirmEmailPage() {
    const [searchParams] = useSearchParams();
    const userId = searchParams.get('userId');
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!userId || !token) {
            setStatus('error');
            setMessage('Некоректне посилання. Запитайте новий лист для підтвердження email.');
            return;
        }

        const confirm = async () => {
            try {
                const url = `${API_BASE}/api/account/confirm-email?userId=${encodeURIComponent(userId)}&token=${encodeURIComponent(token)}`;
                const res = await fetch(url);
                if (res.ok) {
                    setStatus('ok');
                    setMessage('Email підтверджено. Тепер ви можете увійти.');
                } else {
                    const data = await res.json().catch(() => ({}));
                    setStatus('error');
                    setMessage((data as { error?: string })?.error ?? 'Не вдалося підтвердити email.');
                }
            } catch {
                setStatus('error');
                setMessage('Помилка мережі. Спробуйте пізніше.');
            }
        };

        confirm();
    }, [userId, token]);

    return (
        <div className="max-w-md mx-auto px-6 py-20 text-center">
            <h1 className="text-2xl font-bold text-[#404236] mb-4">
                {status === 'loading' && 'Підтвердження email...'}
                {status === 'ok' && 'Готово'}
                {status === 'error' && 'Помилка'}
            </h1>

            {status === 'loading' && <p className="text-gray-500">Зачекайте.</p>}

            {status === 'ok' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-left">
                    {message}
                </div>
            )}

            {status === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-left">
                    {message}
                </div>
            )}

            <Link to="/login" className="inline-block mt-6 py-3 px-6 bg-[#F5A623] text-white font-bold rounded-xl hover:bg-[#D48D1C]">
                Увійти
            </Link>
        </div>
    );
}
