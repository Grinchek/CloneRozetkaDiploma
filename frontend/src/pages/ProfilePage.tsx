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
    const handleLogout = () => {
        localStorage.removeItem('token');

    };

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
        <>
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
                    <div className="navbar-links">
                        <button onClick={handleLogout}>
                            <Link
                                to="/"
                                className="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                            >
                                <svg
                                    className="fill-gray-500 group-hover:fill-gray-700 dark:group-hover:fill-gray-300"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M15.1007 19.247C14.6865 19.247 14.3507 18.9112 14.3507 18.497L14.3507 14.245H12.8507V18.497C12.8507 19.7396 13.8581 20.747 15.1007 20.747H18.5007C19.7434 20.747 20.7507 19.7396 20.7507 18.497L20.7507 5.49609C20.7507 4.25345 19.7433 3.24609 18.5007 3.24609H15.1007C13.8581 3.24609 12.8507 4.25345 12.8507 5.49609V9.74501L14.3507 9.74501V5.49609C14.3507 5.08188 14.6865 4.74609 15.1007 4.74609L18.5007 4.74609C18.9149 4.74609 19.2507 5.08188 19.2507 5.49609L19.2507 18.497C19.2507 18.9112 18.9149 19.247 18.5007 19.247H15.1007ZM3.25073 11.9984C3.25073 12.2144 3.34204 12.4091 3.48817 12.546L8.09483 17.1556C8.38763 17.4485 8.86251 17.4487 9.15549 17.1559C9.44848 16.8631 9.44863 16.3882 9.15583 16.0952L5.81116 12.7484L16.0007 12.7484C16.4149 12.7484 16.7507 12.4127 16.7507 11.9984C16.7507 11.5842 16.4149 11.2484 16.0007 11.2484L5.81528 11.2484L9.15585 7.90554C9.44864 7.61255 9.44847 7.13767 9.15547 6.84488C8.86248 6.55209 8.3876 6.55226 8.09481 6.84525L3.52309 11.4202C3.35673 11.5577 3.25073 11.7657 3.25073 11.9984Z"
                                        fill=""
                                    />
                                </svg>
                                Sign out
                            </Link>
                        </button>
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
        </>

    );
};

export default ProfilePage;
