import React from 'react';
import { Target, TrendingUp, Palette, Megaphone, BarChart } from 'lucide-react';

const features = [
  {
    icon: <Target className="w-7 h-7" />,
    title: "브랜드 전략 수립",
    description: "브랜드 아이덴티티 개발, 포지셔닝 전략, 브랜드 스토리텔링, 리브랜딩 컨설팅을 제공합니다.",
    gradient: "from-blue-500 to-cyan-400",
    shadowColor: "shadow-blue-500/20",
    iconBg: "bg-gradient-to-br from-blue-500 to-cyan-400"
  },
  {
    icon: <TrendingUp className="w-7 h-7" />,
    title: "디지털 마케팅",
    description: "SEO/SEM 최적화, 소셜 미디어 마케팅, 인플루언서 마케팅, 퍼포먼스 마케팅을 수행합니다.",
    gradient: "from-violet-500 to-purple-400",
    shadowColor: "shadow-violet-500/20",
    iconBg: "bg-gradient-to-br from-violet-500 to-purple-400"
  },
  {
    icon: <Palette className="w-7 h-7" />,
    title: "크리에이티브 제작",
    description: "영상 제작, 그래픽 디자인, 웹/앱 디자인, 3D/Motion 그래픽을 전문적으로 제작합니다.",
    gradient: "from-fuchsia-500 to-pink-400",
    shadowColor: "shadow-fuchsia-500/20",
    iconBg: "bg-gradient-to-br from-fuchsia-500 to-pink-400"
  },
  {
    icon: <Megaphone className="w-7 h-7" />,
    title: "퍼블릭 리레이션",
    description: "미디어 언론 홍보, 크리시스 커뮤니케이션, 이벤트 기획, CEO 브랜딩을 지원합니다.",
    gradient: "from-rose-500 to-orange-400",
    shadowColor: "shadow-rose-500/20",
    iconBg: "bg-gradient-to-br from-rose-500 to-orange-400"
  },
  {
    icon: <BarChart className="w-7 h-7" />,
    title: "데이터 분석 & 인사이트",
    description: "마케팅 데이터 분석, 소비자 인사이트 리서치, 경쟁사 분석, A/B 테스트를 진행합니다.",
    gradient: "from-emerald-500 to-teal-400",
    shadowColor: "shadow-emerald-500/20",
    iconBg: "bg-gradient-to-br from-emerald-500 to-teal-400"
  }
];

const Features: React.FC = () => {
  return (
    <section id="services" className="py-28 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-30"></div>

      <div className="container mx-auto px-6 lg:px-12 relative">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-600 rounded-full text-sm font-semibold mb-4">
            Our Services
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 mb-6">
            핵심 서비스
          </h2>
          <p className="text-lg text-slate-500 leading-relaxed">
            전략부터 실행까지, 브랜드 성공을 위한 360° 통합 솔루션을 제공합니다. <br className="hidden md:block" />
            당신의 비즈니스 성공을 함께 설계하는 전략 파트너입니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative"
            >
              {/* Card */}
              <div className={`
                relative h-full p-8 rounded-3xl
                bg-white/80 backdrop-blur-sm
                border border-slate-100
                shadow-xl ${feature.shadowColor}
                hover:shadow-2xl hover:${feature.shadowColor}
                hover:-translate-y-2 hover:border-slate-200
                transition-all duration-500 ease-out
                overflow-hidden
              `}>
                {/* Gradient line at top */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                {/* Background gradient on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`}></div>

                {/* Icon */}
                <div className={`
                  relative w-16 h-16 rounded-2xl ${feature.iconBg}
                  flex items-center justify-center mb-6
                  text-white
                  shadow-lg ${feature.shadowColor}
                  group-hover:scale-110 group-hover:rotate-3
                  transition-all duration-500
                `}>
                  {feature.icon}
                </div>

                {/* Content */}
                <div className="relative">
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-slate-800 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-500 leading-relaxed text-[15px]">
                    {feature.description}
                  </p>
                </div>

                {/* Arrow indicator */}
                <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-2 group-hover:translate-x-0">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${feature.gradient} flex items-center justify-center text-white shadow-lg`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
