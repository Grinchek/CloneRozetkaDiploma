import { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMeQuery } from '../features/account/apiAccount';
import { buildAvatarCandidates } from '../utils/image';
import '../styles/profile.css';

const ProfilePage = () => {
    const navigate = useNavigate();
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const { data: me, isLoading, error } = useMeQuery(undefined, { skip: !token });

    const candidates = useMemo(
        () => buildAvatarCandidates(me?.avatarUrl ?? undefined),
        [me?.avatarUrl]
    );
    const [idx, setIdx] = useState(0);
    const src = candidates[idx];

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
    };

    if (isLoading) {
        return (
            <div className="profile-page">
                <div className="profile-card skeleton" />
                <div className="profile-sections">
                    <div className="profile-section skeleton" style={{ height: 80 }} />
                    <div className="profile-section skeleton" style={{ height: 80 }} />
                </div>
            </div>
        );
    }

    if (error || !me) {
        const isAuthError = (error as { status?: number })?.status === 401;
        return (
            <div className="profile-page profile-page--center">
                <div className="profile-card profile-card--error">
                    <div className="profile-error-icon">{isAuthError ? '🔒' : '🙁'}</div>
                    <h2 className="profile-error-title">
                        {isAuthError ? 'Сесія завершена' : 'Помилка завантаження'}
                    </h2>
                    <p className="profile-error-text">
                        {isAuthError
                            ? 'Будь ласка, увійдіть в акаунт знову, щоб переглянути свій профіль.'
                            : 'Не вдалося завантажити дані профілю. Спробуйте пізніше.'}
                    </p>
                    <Link to={isAuthError ? '/login' : '/'} className="profile-btn profile-btn--primary">
                        {isAuthError ? 'Увійти' : 'На головну'}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <section className="profile-card">
                <div className="profile-header">
                    <div className="profile-avatar">
                        {src ? (
                            <img
                                src={src}
                                alt={me.name ?? 'Avatar'}
                                onError={() =>
                                    setIdx((i) => (i + 1 < candidates.length ? i + 1 : i))
                                }
                            />
                        ) : (
                            <div className="avatar-placeholder">
                                {(me.name ?? me.email ?? 'U').charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="profile-main-info">
                        <h1 className="profile-name">{me.name ?? 'Користувач'}</h1>
                        {me.email && <p className="profile-email">{me.email}</p>}
                        {me.role && (
                            <div className="profile-badges">
                                <span className="badge badge-role">{me.role}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="profile-actions">
                    <Link to="/" className="profile-link">Головна</Link>
                    <button type="button" onClick={handleLogout} className="profile-btn profile-btn--logout">
                        <span className="profile-btn-icon" aria-hidden>→</span>
                        Вийти
                    </button>
                </div>
            </section>

            <div className="profile-sections">
                <div className="profile-section">
                    <h2>Кабінет</h2>
                    <p className="muted">
                        Відображаються дані з профілю: ім’я, email, роль. Редагування профілю на бекенді відсутнє.
                    </p>
                    <Link to="/account" className="profile-btn profile-btn--primary" style={{ marginTop: 8 }}>
                        Відкрити кабінет
                    </Link>
                </div>

                <div className="profile-section">
                    <h2>Безпека</h2>
                    <button type="button" onClick={handleLogout} className="profile-btn profile-btn--secondary">
                        Вийти з акаунту
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
