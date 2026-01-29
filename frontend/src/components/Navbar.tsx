import { Link , useNavigate} from 'react-router-dom';
import { useMeQuery } from '../features/account/apiAccount';


const topLinks = ["Акції", "Тренди", "Для бізнесу", "Допомога"];
const categories = [
    "Дім і сад",
    "Електроніка",
    "Авто",
    "Інструменти",
    "Дитячі товари",
    "Дитячі товари",
    "Дитячі товари",
    "Дитячі товари",
    "Їжа",
];

export default function Navbar() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const { data: me } = useMeQuery(undefined, { skip: !token });
    const isAdmin = me?.role === 'Admin';
    return (
        <header className="w-full">
            {/* TOP LINE */}
            <div className="bg-[#404236] text-[#FFD89F]">
                <div className="mx-auto flex h-10 max-w-7xl items-center justify-center gap-8 px-6 text-sm">
                    {topLinks.map((l) => (
                        <span key={l} className="cursor-pointer hover:opacity-80">
              {l}
            </span>
                    ))}
                </div>
            </div>

            {/* MAIN NAV */}
            <div className="bg-[#404236]">
                <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-6">
                    {/* Logo */}
                    <div className="text-2xl font-bold text-[#F5A623]">
                        <img
                            src="/icons/ZORYA-LOGO.svg"
                        />
                    </div>

                    {/* Burger */}
                    <button className="text-[#F5A623] text-2xl">
                        <img
                            src="/icons/navbar-burger.svg"
                        />
                    </button>

                    {/* Search */}
                    <div className="relative flex-1">
                        <input
                            placeholder="Пошук"
                            className="
                h-10 w-full rounded-full
                bg-[#4E4B3D]
                px-5 pr-12
                text-sm text-white
                placeholder:text-[#FFD89F]/60
                outline-none
              "
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#F5A623]">
               <img
                   src="/icons/navbar-search.svg"
               />
            </span>
                    </div>

                    {/* Icons */}
                    <div className="flex items-center gap-5 text-[#F5A623] text-xl">
                        <span><img
                            src="/icons/navbar-location-line.svg"
                        /></span>
                        <span><img
                            src="/icons/navbar-ri_scales.svg"
                        /></span>
                        <span><img
                            src="/icons/navbar-ion_eye-off.svg"
                        /></span>
                        <div className="navbar-actions">
                            {token ? (
                                <>
                                    <Link to={isAdmin ? '/admin' : '/profile'} className="navbar-user">
                                       <span>
                            <Link to={isAdmin ? '/admin' : '/profile'} className="navbar-user">

                                <img
                                    src="/icons/navbar-profile.svg"
                                />


                        </Link></span>
                                    </Link>

                                </>
                            ) : (
                                <button
                                    className="navbar-btn"
                                    onClick={() => navigate('/login', { replace: true })}
                                >
                                    <img
                                        src="/icons/navbar-profile.svg"
                                    />
                                </button>
                            )}
                        </div>

                        <span><img
                            src="/icons/navbar-cart.svg"
                        /></span>
                    </div>
                </div>
            </div>

            {/* CATEGORIES */}
            <div className="bg-[#4E4B3D]">
                <div className="mx-auto flex h-12 max-w-7xl items-center justify-center gap-10 px-6 text-sm text-[#F1F1F1]">
                    {categories.map((c) => (
                        <span key={c} className="cursor-pointer hover:text-[#F5A623]">
              {c}
            </span>
                    ))}
                </div>
            </div>
        </header>
    );
}
