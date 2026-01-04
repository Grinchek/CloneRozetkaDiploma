// src/components/Navbar.tsx
import { Link, useNavigate } from 'react-router-dom';

import '../styles/navbar.css';
import UserDropdown from "../admin/components/header/UserDropdown.tsx";

type NavbarProps = {
    onHomeClick?: () => void;
};

const Navbar = ({ onHomeClick }: NavbarProps) => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');







    return (
        <nav className="navbar">
            <div className="navbar-logo">
                Clone<span style={{ color: '#2563eb' }}>Rozetka</span>
            </div>

            <div className="navbar-links">
                <Link to="/" onClick={onHomeClick}>Головна</Link>
                <Link to="/categories">Категорії</Link>
                <Link to="/about">Про нас</Link>
            </div>

            <div className="navbar-actions">

                {token ? (
                    <>
                        <UserDropdown />
                    </>
                ) : (

                    <button
                        className="flex items-center text-gray-700 dropdown-toggle dark:text-gray-400"
                        onClick={() => navigate('/signin', { replace: true })}
                    >

                         <span className="mr-3 overflow-hidden rounded-full h-11 w-11">
                             <svg
                                 className="fill-gray-500 group-hover:fill-gray-700 dark:fill-gray-400 dark:group-hover:fill-gray-300"
                                 width="45"
                                 height="46"
                                 viewBox="0 0 24 24"
                                 fill="none"
                                 xmlns="http://www.w3.org/2000/svg"
                             >
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4 22a8 8 0 1 1 16 0H4zm8-9c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6z"
                            fill=""
                        />
                    </svg>
                        </span>

                        <span>Увійти</span>
                    </button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
