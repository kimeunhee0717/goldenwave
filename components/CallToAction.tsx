import React from 'react';

const CallToAction: React.FC = () => {
  return (
    <section className="py-20 lg:py-32 bg-slate-900 relative overflow-hidden">
      {/* Abstract Background */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-800 skew-x-12 translate-x-20 opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-full bg-primary-900/20 -skew-x-12 -translate-x-10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10 text-center">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-8 tracking-tight">
          무료 마케팅 진단을 받아보세요
        </h2>
        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-12">
          첫 상담 고객 전원에게 무료 마케팅 진단 리포트를 제공합니다.<br className="hidden md:block"/>
          브랜드 상태 분석, 경쟁사 비교, 개선 방향 제안까지 한 번에!
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="w-full sm:w-auto px-8 py-5 bg-primary-600 hover:bg-primary-500 text-white rounded-full font-bold text-lg shadow-xl shadow-primary-600/30 transition-all transform hover:-translate-y-1">
            상담 신청하기
          </button>
          <button className="w-full sm:w-auto px-8 py-5 bg-transparent border border-slate-600 hover:bg-slate-800 text-white rounded-full font-bold text-lg transition-colors">
            서비스 요금 보기
          </button>
        </div>
        <p className="mt-6 text-sm text-slate-500">
          * 상담 신청 후 7일 내 계약 시, 첫 달 서비스 20% 할인
        </p>
      </div>
    </section>
  );
};

export default CallToAction;