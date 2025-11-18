import { useMemo, useState } from 'react';
import { useMeQuery } from '../features/account/apiAccount';
import { buildAvatarCandidates } from '../utils/image';
import '../styles/profile.css';
import {Link} from "react-router-dom";

const ProfilePage = () => {
    const token = localStorage.getItem('token');
    const { data: me, isLoading } = useMeQuery(undefined, { skip: !token });

    const candidates = useMemo(
        () => buildAvatarCandidates(me?.avatarUrl),
        [me?.avatarUrl]
    );
    const [idx, setIdx] = useState(0);
    const src = candidates[idx];

    if (isLoading) {
        return (
            <div className="profile-page">
                <div className="profile-card skeleton" />
            </div>
        );
    }

    if (!me) {
        return (
            <div className="profile-page">
                <div className="profile-card">
                    <p>Не вдалося завантажити дані профілю 🙁</p>
                </div>
            </div>
        );
    }

    const createdAtText = me.createdAt
        ? new Date(me.createdAt).toLocaleDateString('uk-UA')
        : '';

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
                        <p className="profile-email">{me.email}</p>

                        <div className="profile-badges">
              <span
                  className={
                      'badge ' +
                      (me.isEmailVarified ? 'badge-success' : 'badge-warning')
                  }
              >
                {me.isEmailVarified
                    ? 'Email підтверджений'
                    : 'Email не підтверджений'}
              </span>
                            {me.googleId && (
                                <span className="badge badge-light">Google акаунт</span>
                            )}
                        </div>

                        {createdAtText && (
                            <p className="profile-date">З нами з {createdAtText}</p>
                        )}
                    </div>

                </div>
                <div className="navbar-links">
                <Link to="/">Головна</Link>
                </div>
            </section>


            <section className="profile-sections">
                <div className="profile-section">
                    <h2>Особисті дані</h2>
                    <p className="muted">
                        Тут можна буде змінювати ім’я, email та інші дані (пізніше додаси форму).
                    </p>
                </div>

                <div className="profile-section">
                    <h2>Безпека</h2>
                    <ul className="profile-list">
                        <li>Зміна пароля</li>
                        <li>Управління входом через Google</li>
                    </ul>
                </div>

                <div className="profile-section">
                    <h2>Мої замовлення</h2>
                    <p className="muted">
                        Список замовлень ти зможеш вивести тут, коли реалізуєш логіку кошика / покупок.
                    </p>
                </div>
            </section>
        </div>
    );
};

export default ProfilePage;
