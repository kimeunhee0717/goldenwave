import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Youtube, ArrowUp, Mail } from 'lucide-react';

const categories = [
  { label: 'AI 머니', href: '/blog/category/ai-money' },
  { label: '재테크', href: '/blog/category/finance' },
  { label: '부업·N잡', href: '/blog/category/side-hustle' },
  { label: '부자마인드', href: '/blog/category/mindset' },
  { label: '디지털스킬', href: '/blog/category/digital-skill' },
  { label: '비즈니스', href: '/blog/category/business' },
];

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white border-t border-slate-100 pt-16 pb-8">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-tr from-moss-600 to-sage-400 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                B
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">
                부자타임
              </span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed">
              AI, 재테크, 부업 — 경제적 자유를 향한<br />
              매일의 인사이트를 전합니다.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-moss-50 hover:text-moss-600 transition-colors"><Instagram size={18} /></a>
              <a href="#" className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-moss-50 hover:text-moss-600 transition-colors"><Youtube size={18} /></a>
              <a href="mailto:hello@goldenwave.co.kr" className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-moss-50 hover:text-moss-600 transition-colors"><Mail size={18} /></a>
            </div>
          </div>

          {/* 카테고리 */}
          <div>
            <h4 className="font-bold text-slate-900 mb-6">카테고리</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              {categories.map((cat) => (
                <li key={cat.href}>
                  <Link to={cat.href} className="hover:text-moss-600 transition-colors">
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 서비스 */}
          <div>
            <h4 className="font-bold text-slate-900 mb-6">서비스</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><Link to="/blog" className="hover:text-moss-600 transition-colors">전체 뉴스</Link></li>
              <li><Link to="/tools/compound-interest" className="hover:text-moss-600 transition-colors">복리 계산기</Link></li>
              <li><a href="#" className="hover:text-moss-600 transition-colors">뉴스레터 구독</a></li>
            </ul>
          </div>

          {/* 문의 / 회사 */}
          <div>
            <h4 className="font-bold text-slate-900 mb-6">문의</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="mailto:hello@goldenwave.co.kr" className="hover:text-moss-600 transition-colors">hello@goldenwave.co.kr</a></li>
              <li><a href="tel:02-1234-5678" className="hover:text-moss-600 transition-colors">02-1234-5678</a></li>
              <li><Link to="/about" className="hover:text-moss-600 transition-colors">소개</Link></li>
              <li><Link to="/contact" className="hover:text-moss-600 transition-colors">문의하기</Link></li>
              <li><Link to="/privacy" className="hover:text-moss-600 transition-colors">개인정보처리방침</Link></li>
              <li><Link to="/terms" className="hover:text-moss-600 transition-colors">이용약관</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} 부자타임(BujaTime) by 골든웨이브 | All Rights Reserved.
          </p>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-sm font-bold text-slate-900 hover:text-moss-600 transition-colors"
          >
            맨 위로 <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
