import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin, type TokenResponse } from '@react-oauth/google';
import {
    useLoginByGoogleMutation,
    useLoginMutation,
    useRegisterMutation,
} from '../../../features/account/apiAccount';
import '../../auth/auth.css';

const AuthPage = () => {
    const navigate = useNavigate();

    const [isRegister, setIsRegister] = useState(false);
    const [form, setForm] = useState({
        userNameOrEmail: '',
        password: '',
        email: '',
        fullName: '',
    });

    const [loginByGoogle] = useLoginByGoogleMutation();
    const [login, { isLoading: isLoginLoading }] = useLoginMutation();
    const [register, { isLoading: isRegisterLoading }] = useRegisterMutation();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            let result;
            if (isRegister) {
                result = await register({
                    userName: form.userNameOrEmail,
                    email: form.email,
                    fullName: form.fullName,
                    password: form.password,
                }).unwrap();
            } else {
                result = await login({
                    userNameOrEmail: form.userNameOrEmail,
                    password: form.password,
                }).unwrap();
            }

            console.log('Auth result:', result);

            if (result?.token) {
                localStorage.setItem('token', result.token);
                navigate('/', { replace: true });
            }
        } catch (err) {
            console.error('Auth error:', err);
        }
    };

    const loginUseGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse: TokenResponse) => {
            console.log('tokenResponse GOOGLE', tokenResponse.access_token);
            try {
                const result = await loginByGoogle({
                    token: tokenResponse.access_token,
                }).unwrap();

                console.log('login result', result);

                if (result?.token) {
                    localStorage.setItem('token', result.token);
                }

                navigate('/', { replace: true });
            } catch (error) {
                console.error('User server error auth', error);
            }
        },
        onError: (err) => {
            console.error('Google auth error', err);
        },
    });


    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2>{isRegister ? 'Реєстрація' : 'Вхід'}</h2>

                <form onSubmit={handleSubmit} className="auth-form">
                    <input
                        type="text"
                        name="userNameOrEmail"
                        placeholder="Ім'я користувача або Email"
                        value={form.userNameOrEmail}
                        onChange={handleChange}
                        required
                    />

                    {isRegister && (
                        <>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                            <input
                                type="text"
                                name="fullName"
                                placeholder="Повне ім’я"
                                value={form.fullName}
                                onChange={handleChange}
                                required
                            />
                        </>
                    )}

                    <input
                        type="password"
                        name="password"
                        placeholder="Пароль"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />

                    <button type="submit" disabled={isLoginLoading || isRegisterLoading}>
                        {isRegister
                            ? isRegisterLoading
                                ? 'Реєстрація...'
                                : 'Зареєструватися'
                            : isLoginLoading
                                ? 'Вхід...'
                                : 'Увійти'}
                    </button>
                </form>

                <div className="divider">або</div>

                <button
                    className="google-login-btn"
                    onClick={() => loginUseGoogle()}
                >
                    Увійти через Google
                </button>

                <p className="switch-mode">
                    {isRegister ? 'Вже маєш акаунт?' : 'Немає акаунта?'}{' '}
                    <button
                        className="link-btn"
                        type="button"
                        onClick={() => setIsRegister(!isRegister)}
                    >
                        {isRegister ? 'Увійти' : 'Зареєструватися'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default AuthPage;
