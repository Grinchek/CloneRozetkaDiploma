// src/components/Navbar.tsx
import { Link, useNavigate } from 'react-router-dom';
import { useMeQuery } from '../features/account/apiAccount';
import { buildAvatarCandidates } from '../utils/image';
import '../styles/navbar.css';
import { useMemo, useState } from 'react';

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const { data: me } = useMeQuery(undefined, { skip: !token });

    const candidates = useMemo(() => buildAvatarCandidates(me?.avatarUrl), [me?.avatarUrl]);
    const [idx, setIdx] = useState(0);
    const src = candidates[idx];

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/', { replace: true });
    };

    return (
            <nav className="navbar">
                <div className="navbar-logo">Clone<span style={{ color: '#2563eb' }}>Rozetka</span></div>

                <div className="navbar-links">
                    <Link to="/">Головна</Link>
                    <Link to="/categories">Категорії</Link>
                    <Link to="/about">Про нас</Link>
                </div>

                <div className="navbar-actions">
                    {token ? (
                        <>
                            <div className="navbar-user">
                                {src ? (
                                    <img
                                        src={src}
                                        alt="avatar"
                                        className="navbar-avatar"
                                        onError={() => setIdx(i => i + 1)} // якщо 404 — перейти на наступний варіант
                                    />
                                ) : (
                                    <div className="navbar-avatar" />
                                )}
                                <span>{me?.name ?? 'Користувач'}</span>
                            </div>
                            <button className="navbar-btn" onClick={handleLogout}>Вийти</button>
                        </>
                    ) : (
                        <button className="navbar-btn" onClick={() => navigate('/login', { replace: true })}>
                            Увійти
                        </button>
                    )}
                </div>
            </nav>


    );
};

export default Navbar;
