import { Link, useNavigate } from 'react-router-dom';
import { useMeQuery } from '../features/account/apiAccount';
import { useGetCartQuery } from '../features/cart/api/cartApi';
import { useGetFavoritesQuery } from '../features/favorites/api/favoritesApi';
import { useGetCompareIdsQuery } from '../features/compare/api/compareApi';
import CitySelector from './CitySelector';

const topLinks = ["Акції", "Тренди", "Для бізнесу", "Допомога"];
const categories = [
    "Дім і сад",
    "Електроніка",
    "Авто",
    "Інструменти",
    "Дитячі товари",
    "Їжа",
];

export default function Navbar() {
    const navigate = useNavigate();
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const { data: me } = useMeQuery(undefined, { skip: !token });
    const isAdmin = me?.role === 'Admin';
    const { data: cart } = useGetCartQuery(undefined, { skip: !token });
    const { data: favorites = [] } = useGetFavoritesQuery(undefined, { skip: !token });
    const { data: compareIds = [] } = useGetCompareIdsQuery(undefined, { skip: !token });
    const cartCount = cart?.totalQuantity ?? 0;
    const favoritesCount = favorites.length;
    const compareCount = compareIds.length;

    return (
        <header className="site-header">
            {/* Верхня смуга: Акції, Тренди, тощо */}
            <div className="site-header__top">
                <nav className="site-header__top-nav">
                    {topLinks.map((l) => (
                        <span key={l} className="site-header__top-link">{l}</span>
                    ))}
                </nav>
            </div>

            {/* Основний ряд: лого, пошук, іконки */}
            <div className="site-header__main">
                <div className="site-header__main-inner">
                    <Link to="/" className="site-header__logo" aria-label="ZORYA — на головну">
                        <img src="/icons/ZORYA-LOGO.svg" alt="ZORYA" />
                    </Link>

                    <button type="button" className="site-header__burger" aria-label="Меню">
                        <img src="/icons/navbar-burger.svg" alt="" />
                    </button>

                    <div className="site-header__search-wrap">
                        <input
                            type="search"
                            placeholder="Пошук"
                            className="site-header__search"
                            aria-label="Пошук"
                        />
                        <span className="site-header__search-icon" aria-hidden>
                            <img src="/icons/navbar-search.svg" alt="" />
                        </span>
                    </div>

                    <div className="site-header__actions">
                        <CitySelector />
                        <Link to="/compare" className="site-header__icon-btn" title="Порівняння">
                            <img src="/icons/navbar-ri_scales.svg" alt="Порівняння" />
                            {compareCount > 0 && (
                                <span className="site-header__badge">
                                    {compareCount > 4 ? "4" : compareCount}
                                </span>
                            )}
                        </Link>
                        <Link to="/favorites" className="site-header__icon-btn" title="Улюблене">
                            <img src="/icons/navbar-ion_eye-off.svg" alt="Улюблене" />
                            {favoritesCount > 0 && (
                                <span className="site-header__badge">
                                    {favoritesCount > 99 ? "99+" : favoritesCount}
                                </span>
                            )}
                        </Link>
                        {token ? (
                            <Link to={isAdmin ? '/admin' : '/account'} className="site-header__icon-btn" title="Профіль">
                                <img src="/icons/navbar-profile.svg" alt="Профіль" />
                            </Link>
                        ) : (
                            <button
                                type="button"
                                className="site-header__icon-btn"
                                onClick={() => navigate('/login', { replace: true })}
                                title="Увійти"
                            >
                                <img src="/icons/navbar-profile.svg" alt="Увійти" />
                            </button>
                        )}
                        <Link to="/cart" className="site-header__icon-btn site-header__icon-btn--cart" title="Кошик">
                            <img src="/icons/navbar-cart.svg" alt="Кошик" />
                            {cartCount > 0 && (
                                <span className="site-header__badge site-header__badge--cart">{cartCount}</span>
                            )}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Нижня смуга: категорії */}
            <div className="site-header__bottom">
                <nav className="site-header__categories">
                    {categories.map((c) => (
                        <span key={c} className="site-header__category">{c}</span>
                    ))}
                </nav>
            </div>
        </header>
    );
}
