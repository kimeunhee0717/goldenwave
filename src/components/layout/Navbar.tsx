import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';

interface MenuItem {
  label: string;
  href: string;
}

const menuItems: MenuItem[] = [
  { label: 'AI 머니', href: '/blog/category/ai-money' },
  { label: '재테크', href: '/blog/category/finance' },
  { label: '부업·N잡', href: '/blog/category/side-hustle' },
  { label: '부자마인드', href: '/blog/category/mindset' },
  { label: '디지털스킬', href: '/blog/category/digital-skill' },
  { label: '비즈니스', href: '/blog/category/business' },
  { label: '유용한 도구', href: '/tools' },
];

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-2' : 'bg-white/80 backdrop-blur-sm py-2.5'
      }`}
    >
      <div className="container mx-auto px-6 lg:px-12 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-moss-600 to-sage-400 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-moss-500/30">
            B
          </div>
          <span className={`font-bold text-xl tracking-tight ${isScrolled ? 'text-slate-900' : 'text-slate-900'}`}>
            부자타임
          </span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden lg:flex items-center gap-6">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={`text-sm font-medium transition-colors ${
                location.pathname === item.href
                  ? 'text-moss-600'
                  : 'text-slate-600 hover:text-moss-600'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* CTA Button */}
        <div className="hidden lg:flex items-center gap-4">
          <Link
            to="/blog"
            className="text-sm font-medium text-slate-600 hover:text-moss-600 transition-colors"
          >
            전체 뉴스
          </Link>
          <button
            onClick={() => {
              const el = document.querySelector('[data-newsletter]');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all transform hover:scale-105 shadow-lg shadow-slate-900/20 flex items-center gap-2"
          >
            뉴스레터 구독 <ArrowRight size={14} />
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 text-slate-600"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-slate-100 shadow-xl p-6 flex flex-col gap-4">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-base font-medium py-2 border-b border-slate-50 last:border-0 ${
                location.pathname === item.href
                  ? 'text-moss-600'
                  : 'text-slate-600 hover:text-moss-600'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/blog"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-base font-medium text-slate-600 hover:text-moss-600 py-2 border-b border-slate-50"
          >
            전체 뉴스
          </Link>
          <div className="flex flex-col gap-3 mt-4">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                const el = document.querySelector('[data-newsletter]');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full py-3 bg-moss-600 text-white font-bold rounded-xl shadow-lg shadow-moss-600/30 text-center"
            >
              뉴스레터 구독
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
