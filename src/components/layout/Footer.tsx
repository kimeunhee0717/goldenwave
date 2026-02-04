import React from 'react';
import { Facebook, Instagram, Twitter, Youtube, ArrowUp } from 'lucide-react';

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
             <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                    G
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-900">
                    골든웨이브
                </span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              브랜드의 가치를 파도처럼 퍼트리는 마케팅 파트너.
              데이터 기반의 전략적 마케팅으로 브랜드의 성장을 가속화합니다.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"><Instagram size={18} /></a>
              <a href="#" className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"><Facebook size={18} /></a>
              <a href="#" className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"><Twitter size={18} /></a>
              <a href="#" className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"><Youtube size={18} /></a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-slate-900 mb-6">서비스</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="#" className="hover:text-primary-600 transition-colors">브랜드 전략</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">디지털 마케팅</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">크리에이티브 제작</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">PR & 커뮤니케이션</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6">문의</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="mailto:hello@goldenwave.co.kr" className="hover:text-primary-600 transition-colors">hello@goldenwave.co.kr</a></li>
              <li><a href="tel:02-1234-5678" className="hover:text-primary-600 transition-colors">02-1234-5678</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">카카오톡 @goldenwave</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">상담 신청</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6">회사</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="#" className="hover:text-primary-600 transition-colors">회사 소개</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">팀 소개</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">포트폴리오</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">개인정보처리방침</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            © 2024 골든웨이브(Golden Wave) All Rights Reserved. | 사업자등록번호: 123-45-67890
          </p>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-sm font-bold text-slate-900 hover:text-primary-600 transition-colors"
          >
            맨 위로 <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
