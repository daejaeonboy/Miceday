import React from 'react';
import { Briefcase, Home, LayoutGrid, Phone, Search } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export const BottomNav: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { icon: <Home size={22} />, label: '홈', path: '/' },
        { icon: <Search size={22} />, label: '제품', path: '/products' },
        { icon: <LayoutGrid size={22} />, label: '사례', path: '/cases' },
        { icon: <Briefcase size={22} />, label: '회사', path: '/company' },
        { icon: <Phone size={22} />, label: '문의', path: '/quote-request' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white/80 px-2 backdrop-blur-lg pb-safe-area md:hidden">
            <div className="flex h-16 items-center justify-around">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <button
                            key={item.label}
                            onClick={() => navigate(item.path)}
                            className={`flex min-w-[64px] flex-col items-center gap-1 transition-all duration-300 ${
                                isActive ? 'scale-105 text-[#001e45]' : 'text-slate-400'
                            }`}
                        >
                            <div className={isActive ? 'animate-pulse' : ''}>{item.icon}</div>
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};
