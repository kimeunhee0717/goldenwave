import { Link } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

const links = [
  { label: '블로그', href: '/blog' },
  { label: '도구 모음', href: '/tools' },
  { label: '소개', href: '/about' },
  { label: '개인정보처리방침', href: '/privacy' },
  { label: '이용약관', href: '/terms' },
];

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100">
      <div className="container mx-auto px-6 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* 좌: 로고 + 링크 */}
          <div className="flex items-center gap-5 flex-wrap justify-center sm:justify-start">
            <Link to="/" className="font-bold text-sm text-slate-900 hover:text-moss-600 transition-colors">
              부자타임
            </Link>
            <span className="hidden sm:block w-px h-3 bg-slate-200" />
            {links.map((link, i) => (
              <Link
                key={i}
                to={link.href}
                className="text-xs text-slate-400 hover:text-slate-700 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* 우: 카피라이트 + 맨 위로 */}
          <div className="flex items-center gap-4">
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} 부자타임
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="p-1.5 rounded-md bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
              aria-label="맨 위로"
            >
              <ArrowUp size={13} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
