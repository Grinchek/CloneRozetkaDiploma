import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection: React.FC = () => {
    return (
        <section className="relative h-[450px] md:h-[600px] w-full overflow-hidden bg-[#404236] text-white flex items-center">
            {/* Background Layer */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-r from-[#404236] via-[#404236]/80 to-transparent z-10" />
                <img
                    src="https://images.unsplash.com/photo-1513694490825-ca34e1c49f8d?q=80&w=2600&auto=format&fit=crop"
                    alt="Interior Design"
                    className="h-full w-full object-cover object-center"
                />
            </div>

            <div className="relative z-20 mx-auto w-full max-w-7xl px-6 lg:px-12">
                <div className="max-w-2xl">
                    <div className="flex items-center gap-2 mb-6 animate-fade-in-down">
                        <span className="h-[2px] w-8 bg-[#F5A623]" />
                        <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#F5A623]">
                            Ексклюзивно в ZORYA
                        </span>
                    </div>

                    <h1 className="mb-8 text-5xl font-extrabold leading-[1.1] md:text-7xl lg:text-8xl tracking-tight">
                        Твій дім — <br />
                        <span className="text-[#FFD89F] italic font-serif">твоє сяйво</span>
                    </h1>

                    <p className="mb-10 max-w-lg text-lg md:text-xl text-white/70 leading-relaxed font-light">
                        Ми поєднуємо традиційну майстерність з інноваційними технологіями,
                        щоб кожна деталь вашого простору була бездоганною.
                    </p>

                    <div className="flex flex-wrap gap-5">
                        <Link
                            to="/#featured"
                            className="group relative overflow-hidden rounded-2xl bg-[#F5A623] px-12 py-5 font-bold text-white transition-all hover:pr-14 active:scale-95 shadow-2xl shadow-[#F5A623]/40 inline-block text-center"
                        >
                            <span>До каталогу</span>
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 transition-all group-hover:opacity-100 group-hover:right-5">
                                →
                            </span>
                        </Link>
                        <button className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md px-12 py-5 font-bold transition-all hover:bg-white/10 hover:border-white/40">
                            Наша історія
                        </button>
                    </div>
                </div>
            </div>

            {/* Pagination / Dots UI (Visual only) */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex gap-4">
                <div className="h-3 w-10 rounded-full bg-[#F5A623] transition-all" />
                <div className="h-3 w-3 rounded-full bg-white/20 hover:bg-white/40 cursor-pointer" />
                <div className="h-3 w-3 rounded-full bg-white/20 hover:bg-white/40 cursor-pointer" />
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-12 right-12 z-20 hidden lg:block animate-bounce">
                <div className="flex flex-col items-center gap-3">
                    <span className="text-[10px] uppercase tracking-widest text-white/40 rotate-90 mb-4 font-bold">Scroll</span>
                    <div className="h-12 w-[2px] bg-gradient-to-b from-[#F5A623] to-transparent" />
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
