import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Calculator, TrendingUp } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden" style={{ background: 'linear-gradient(180deg, #FBEAD6 0%, #fdf6f7 40%, #FFFFFF 100%)' }}>
      {/* Background Shapes */}
      <div className="absolute top-20 right-0 -mr-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ backgroundColor: '#F0C4CB' }}></div>
      <div className="absolute top-40 left-0 -ml-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" style={{ backgroundColor: '#E5BCA9' }}></div>
      <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" style={{ backgroundColor: '#FBEAD6' }}></div>

      <div className="container mx-auto px-6 lg:px-12 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold mb-8 animate-fade-in-up" style={{ backgroundColor: '#F0C4CB', color: '#9c3f56' }}>
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#6B7556' }}></span>
          AI 시대의 경제적 자유
          <ArrowRight size={14} />
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight leading-tight mb-6 animate-fade-in-up animation-delay-100" style={{ color: '#544339' }}>
          매일의 인사이트로 <br />
          <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #6B7556, #939D83)' }}>
            부자가 되는 시간
          </span>
        </h1>

        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up animation-delay-200" style={{ color: '#7a695f' }}>
          AI, 재테크, 부업, 비즈니스 —<br className="hidden sm:block" />
          경제적 자유를 향한 실용적인 인사이트를 매일 전합니다.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-300">
          <Link to="/blog" className="w-full sm:w-auto px-8 py-4 text-white rounded-full font-bold text-lg shadow-xl transition-transform transform hover:-translate-y-1 flex items-center justify-center gap-2" style={{ backgroundColor: '#6B7556', boxShadow: '0 10px 25px -5px rgba(107,117,86,0.3)' }}>
            <BookOpen size={20} />
            인사이트 읽기
          </Link>
          <Link to="/tools" className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 border rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-colors" style={{ borderColor: '#E5BCA9', color: '#544339' }}>
            <Calculator size={20} />
            무료 계산기
          </Link>
        </div>

        {/* Stats Section */}
        <div className="mt-20 relative animate-fade-in-up animation-delay-400">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-100 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 mx-auto" style={{ backgroundColor: '#F0C4CB' }}>
                <BookOpen size={20} style={{ color: '#9c3f56' }} />
              </div>
              <p className="text-2xl font-bold" style={{ color: '#544339' }}>70+</p>
              <p className="text-sm" style={{ color: '#7a695f' }}>인사이트 아티클</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-100 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 mx-auto" style={{ backgroundColor: '#FBEAD6' }}>
                <Calculator size={20} style={{ color: '#6B7556' }} />
              </div>
              <p className="text-2xl font-bold" style={{ color: '#544339' }}>20+</p>
              <p className="text-sm" style={{ color: '#7a695f' }}>무료 계산기</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-100 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 mx-auto" style={{ backgroundColor: '#E5BCA9' }}>
                <TrendingUp size={20} style={{ color: '#544339' }} />
              </div>
              <p className="text-2xl font-bold" style={{ color: '#544339' }}>6</p>
              <p className="text-sm" style={{ color: '#7a695f' }}>전문 카테고리</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
