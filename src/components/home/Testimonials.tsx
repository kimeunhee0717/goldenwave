import React from 'react';
import { Star, Quote } from 'lucide-react';

const reviews = [
  {
    content: "마케팅 대행사가 아니라 우리 회사의 사외 마케팅팀 같아요. 진정한 파트너십을 느낄 수 있었습니다.",
    author: "김OO",
    role: "글로우업 뷰티 대표",
    avatar: "https://picsum.photos/id/64/100/100"
  },
  {
    content: "3년간 4개사와 협업했는데, 부자타임만큼 실질적인 정보를 주는 곳은 없었어요. 데이터 기반으로 정확히 분석해줍니다.",
    author: "박OO",
    role: "쿡마스터 마케팅 팀장",
    avatar: "https://picsum.photos/id/65/100/100"
  },
  {
    content: "재테크 공부가 막막했는데, 부자타임 덕분에 체계적으로 시작할 수 있었습니다. 콘텐츠 퀄리티가 남달랐습니다.",
    author: "이OO",
    role: "핏플레이스 CEO",
    avatar: "https://picsum.photos/id/91/100/100"
  },
  {
    content: "일본 시장 진출이 막막했는데, 현지 문화를 정확히 이해하고 전략을 짜주셔서 큰 도움이 됐어요.",
    author: "장OO",
    role: "스트릿라이프 글로벌팀",
    avatar: "https://picsum.photos/id/96/100/100"
  }
];

const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="py-28 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 left-0 w-72 h-72 bg-skyblue-300/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-0 w-72 h-72 bg-linen-200/50 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-6 lg:px-12 relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-sm font-bold tracking-widest text-skyblue-400 uppercase mb-4">Testimonials</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-steel-700 mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-steel-700 to-skyblue-300">200+</span> 프로젝트의 고객들이<br />
            부자타임과 함께 성장하고 있습니다
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {reviews.map((review, index) => (
            <div key={index} className="group bg-gradient-to-br from-alice-100/80 to-linen-100/50 p-8 rounded-3xl relative border border-alice-200 hover:shadow-xl hover:shadow-steel-700/10 transition-all duration-500 hover:-translate-y-1">
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 text-skyblue-300/30">
                <Quote size={32} />
              </div>

              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-linen-400 fill-current" />
                ))}
              </div>
              <p className="text-steel-600 text-lg mb-8 leading-relaxed relative">
                "{review.content}"
              </p>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={review.avatar}
                    alt={review.author}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white shadow-lg"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-skyblue-300 to-glaucous-400 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-steel-700">{review.author}</h4>
                  <p className="text-sm text-glaucous-400">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
