import { ReactNode } from "react";
import logoSmall from "@/assets/logo-small.svg";

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-white">
            <div className="relative pt-24">
            {/* маленький логотип зверху */}
            <div className="absolute left-8 top-8">
                <img
                    src={logoSmall}
                    alt="ZORYA logo"
                    className="h-[52px] w-[52px]"
                />
            </div>

            <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-between px-10">
                {/* LEFT */}
                <div className="hidden lg:flex">
                    <div className="text-5xl font-bold tracking-wide text-amber-500">
                        ZORYA
                    </div>
                </div>

                {/* RIGHT */}
                <div className="flex w-full justify-center lg:w-auto">
                    {children}
                </div>
            </div>
            </div>
        </div>
    );
}
