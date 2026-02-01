import React from 'react';
import { ArrowRight, Play } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-b from-blue-50/50 to-white">
      {/* Background Shapes */}
      <div className="absolute top-20 right-0 -mr-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-40 left-0 -ml-20 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="container mx-auto px-6 lg:px-12 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-100 shadow-sm text-sm font-medium text-slate-600 mb-8 animate-fade-in-up">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          데이터 기반 마케팅 전문
          <ArrowRight size={14} className="text-slate-400" />
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-slate-900 tracking-tight leading-tight mb-6 animate-fade-in-up animation-delay-100">
          브랜드의 가치를 <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">
            파도처럼 퍼트리는
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up animation-delay-200">
          모든 브랜드가 금빛 파도를 타고 성공의 해변에 도달하도록.
          데이터 기반의 전략적 마케팅으로 브랜드의 성장을 가속화합니다.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-300">
          <button className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-bold text-lg shadow-xl shadow-slate-900/20 transition-transform transform hover:-translate-y-1">
            무료 마케팅 진단 신청
          </button>
          <button className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-colors">
            <Play size={20} fill="currentColor" className="text-slate-900" />
            서비스 자세히 보기
          </button>
        </div>

        {/* Hero Image Mockup */}
        <div className="mt-20 relative animate-fade-in-up animation-delay-400">
            <div className="relative mx-auto max-w-5xl rounded-2xl shadow-2xl bg-white border border-slate-200 overflow-hidden aspect-[16/9] group">
                <img 
                    src="https://picsum.photos/id/20/1920/1080" 
                    alt="Dashboard Interface" 
                    className="w-full h-full object-cover"
                />
                
                {/* Floating Elements */}
                <div className="absolute bottom-10 left-10 p-4 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-white/50 flex items-center gap-4 transform transition-transform group-hover:scale-105 duration-500">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium">평균 ROI</p>
                        <p className="text-lg font-bold text-slate-900">320%</p>
                    </div>
                </div>

                 <div className="absolute top-10 right-10 p-4 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-white/50 transform transition-transform group-hover:translate-y-2 duration-500">
                    <div className="text-center">
                        <p className="text-xs text-slate-500 font-medium">누적 프로젝트</p>
                        <p className="text-lg font-bold text-slate-900">200+</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;