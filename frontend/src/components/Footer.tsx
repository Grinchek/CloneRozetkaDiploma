import { Link } from "react-router-dom";

const company = [
    "Про нас",
    "Умови використання сайту",
    "Вакансії",
    "Контакти",
];

const help = [
    "Доставка та оплата",
    "Кредит",
    "Гарантія",
    "Повернення товару",
    "Сервісні центри",
];

const services = [
    "Бонусний рахунок",
    "Подарункові сертифікати",
    "ZORYA Обмін",
];

const business = [
    "Партнерам",
    "Продавати на ZORYA",
    "Реклама на ZORYA",
    "Співпраця з нами",
    "Франчайзинг",
    "Оренда приміщень",
];

export default function Footer() {
    return (
        <footer className="mt-20 bg-[#3E3E33] text-white">
            <div className="mx-auto max-w-6xl px-8 py-12">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">

                    {/* Social */}
                    <div>
                        <div className="mb-4 text-sm font-semibold text-[#F5A623]">
                            Ми в соцмережах:
                        </div>

                        {/* 3 × 2 */}
                        <div className="grid grid-cols-3 gap-4 text-white text-lg">
                            <a href="#" className="flex h-8 w-8 items-center justify-center"><img
                                src="/icons/iconoir_tiktok.svg"
                            /></a>
                            <a href="#" className="flex h-8 w-8 items-center justify-center"><img
                                src="/icons/lets-icons_insta.svg"
                            /></a>
                            <a href="#" className="flex h-8 w-8 items-center justify-center"><img
                                src="/icons/line-md_youtube.svg"
                            /></a>

                            <a href="#" className="flex h-8 w-8 items-center justify-center"><img
                                src="/icons/stash_telegram.svg"
                            /></a>
                            <a href="#" className="flex h-8 w-8 items-center justify-center"><img
                                src="/icons/mingcute_threads-line.svg"
                            /></a>
                            <a href="#" className="flex h-8 w-8 items-center justify-center"><img
                                src="/icons/mingcute_facebook-line.svg"
                            /></a>
                            <a href="#" className="flex h-8 w-8 items-center justify-center"><img
                                src="/icons/prime_twitter.svg"
                            /></a>
                        </div>

                    </div>


                    {/* Columns */}
                    <div>
                        <div className="text-sm font-semibold">
                            Інформація про компанію
                        </div>
                        <ul className="mt-4 space-y-2 text-sm text-white/80">
                            {company.map((item) => (
                                <li key={item}>
                                    <Link to="#">{item}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <div className="text-sm font-semibold">
                            Допомога
                        </div>
                        <ul className="mt-4 space-y-2 text-sm text-white/80">
                            {help.map((item) => (
                                <li key={item}>
                                    <Link to="#">{item}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <div className="text-sm font-semibold">
                            Сервіси
                        </div>
                        <ul className="mt-4 space-y-2 text-sm text-white/80">
                            {services.map((item) => (
                                <li key={item}>
                                    <Link to="#">{item}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <div className="text-sm font-semibold">
                            Корпоративним клієнтам
                        </div>
                        <ul className="mt-4 space-y-2 text-sm text-white/80">
                            {business.map((item) => (
                                <li key={item}>
                                    <Link to="#">{item}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
}
