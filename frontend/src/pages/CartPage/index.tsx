import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { removeFromCart, updateQuantity, type CartItem } from '../../store/cartSlice';
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE;

export default function CartPage() {
    const { items } = useSelector((state: RootState) => state.cart);
    const dispatch = useDispatch();

    const totalPrice = items.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);

    const buildImageSrc = (value?: string | null): string => {
        if (!value) return "/icons/ZORYA-LOGO.svg";
        if (value.startsWith("http")) return value;
        return `${API_BASE}${value.startsWith("/") ? "" : "/"}${value}`;
    };

    if (items.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-20 text-center">
                <h1 className="text-3xl font-bold mb-6">Ваш кошик порожній</h1>
                <p className="text-gray-500 mb-8">Схоже, ви ще нічого не додали до кошика.</p>
                <Link to="/" className="bg-[#F5A623] text-white px-8 py-3 rounded-full font-bold hover:bg-[#e6951d] transition-colors shadow-md">
                    Перейти до покупок
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <h1 className="text-3xl font-bold mb-10 text-[#404236]">Кошик</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-6">
                    {items.map((item) => (
                        <div key={item.id} className="flex gap-6 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-24 h-24 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border">
                                <img src={buildImageSrc(item.mainImageUrl)} alt={item.name} className="w-full h-full object-contain" />
                            </div>

                            <div className="flex-grow flex flex-col justify-between">
                                <div>
                                    <h3 className="font-semibold text-lg text-[#1a1a1a]">{item.name}</h3>
                                    <p className="text-[#F5A623] font-bold mt-1">{item.price.toLocaleString("uk-UA")} ₴</p>
                                </div>

                                <div className="flex items-center gap-4 mt-2">
                                    <div className="flex items-center border rounded-full px-2 py-1 bg-gray-50">
                                        <button
                                            onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}
                                            className="w-8 h-8 flex items-center justify-center font-bold hover:text-[#F5A623]"
                                        >
                                            -
                                        </button>
                                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                                        <button
                                            onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                                            className="w-8 h-8 flex items-center justify-center font-bold hover:text-[#F5A623]"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => dispatch(removeFromCart(item.id))}
                                        className="text-gray-400 hover:text-red-500 text-sm font-medium transition-colors"
                                    >
                                        Видалити
                                    </button>
                                </div>
                            </div>

                            <div className="text-right flex flex-col justify-center">
                                <p className="font-bold text-xl">{(item.price * item.quantity).toLocaleString("uk-UA")} ₴</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-[#404236] text-white p-8 rounded-2xl shadow-xl sticky top-6">
                        <h2 className="text-xl font-bold mb-6">Разом</h2>
                        <div className="space-y-4 text-[#FFD89F]/80">
                            <div className="flex justify-between">
                                <span>Кількість товарів:</span>
                                <span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Доставка:</span>
                                <span className="text-green-400">Безкоштовно</span>
                            </div>
                            <div className="border-t border-white/10 pt-4 mt-4 flex justify-between text-white">
                                <span className="text-lg font-bold">До сплати:</span>
                                <span className="text-2xl font-bold text-[#F5A623]">{totalPrice.toLocaleString("uk-UA")} ₴</span>
                            </div>
                        </div>
                        <button className="w-full bg-[#f5a623] text-white font-bold py-4 rounded-full mt-8 hover:bg-[#ffb945] transition-colors shadow-lg active:scale-95 duration-75">
                            Оформити замовлення
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
