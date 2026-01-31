import React from 'react';
import { Target, TrendingUp, Palette, Megaphone, BarChart } from 'lucide-react';

const features = [
  {
    icon: <Target className="w-6 h-6 text-white" />,
    title: "브랜드 전략 수립",
    description: "브랜드 아이덴티티 개발, 포지셔닝 전략, 브랜드 스토리텔링, 리브랜딩 컨설팅을 제공합니다.",
    color: "bg-blue-500"
  },
  {
    icon: <TrendingUp className="w-6 h-6 text-white" />,
    title: "디지털 마케팅",
    description: "SEO/SEM 최적화, 소셜 미디어 마케팅, 인플루언서 마케팅, 퍼포먼스 마케팅을 수행합니다.",
    color: "bg-indigo-500"
  },
  {
    icon: <Palette className="w-6 h-6 text-white" />,
    title: "크리에이티브 제작",
    description: "영상 제작, 그래픽 디자인, 웹/앱 디자인, 3D/Motion 그래픽을 전문적으로 제작합니다.",
    color: "bg-purple-500"
  },
  {
    icon: <Megaphone className="w-6 h-6 text-white" />,
    title: "퍼블릭 리레이션",
    description: "미디어 언론 홍보, 크리시스 커뮤니케이션, 이벤트 기획, CEO 브랜딩을 지원합니다.",
    color: "bg-pink-500"
  },
  {
    icon: <BarChart className="w-6 h-6 text-white" />,
    title: "데이터 분석 & 인사이트",
    description: "마케팅 데이터 분석, 소비자 인사이트 리서치, 경쟁사 분석, A/B 테스트를 진행합니다.",
    color: "bg-green-500"
  }
];

const Features: React.FC = () => {
  return (
    <section className="py-24 bg-white relative">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
            핵심 서비스
          </h2>
          <p className="text-lg text-slate-500">
            전략부터 실행까지, 브랜드 성공을 위한 360° 통합 솔루션을 제공합니다. <br />
            당신의 비즈니스 성공을 함께 설계하는 전략 파트너입니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group p-8 rounded-3xl bg-white border border-slate-100 hover:border-transparent hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6 shadow-lg shadow-slate-200 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;