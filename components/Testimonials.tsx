import React from 'react';
import { Star } from 'lucide-react';

const reviews = [
  {
    content: "마케팅 대행사가 아니라 우리 회사의 사외 마케팅팀 같아요. 진정한 파트너십을 느낄 수 있었습니다.",
    author: "김OO",
    role: "글로우업 뷰티 대표",
    avatar: "https://picsum.photos/id/64/100/100"
  },
  {
    content: "3년간 4개사와 협업했는데, 골든웨이브만큼 성과를 만족스럽게 내준 곳은 없었어요. 데이터 기반으로 정확히 분석해줍니다.",
    author: "박OO",
    role: "쿡마스터 마케팅 팀장",
    avatar: "https://picsum.photos/id/65/100/100"
  },
  {
    content: "투자 유치 PR이 생각보다 훨씬 쉽지 않았는데, 골든웨이브 덕분에 성공할 수 있었습니다. 전문성이 남달랐습니다.",
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
    <section className="py-24 bg-white border-t border-slate-100">
      <div className="container mx-auto px-6 lg:px-12">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-16">
          <span className="text-primary-600">200+</span> 프로젝트의 고객들이<br />
          골든웨이브와 함께 성장하고 있습니다
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {reviews.map((review, index) => (
            <div key={index} className="bg-slate-50 p-8 rounded-3xl relative">
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                "{review.content}"
              </p>
              <div className="flex items-center gap-4">
                <img 
                  src={review.avatar} 
                  alt={review.author} 
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-white"
                />
                <div>
                  <h4 className="font-bold text-slate-900">{review.author}</h4>
                  <p className="text-sm text-slate-500">{review.role}</p>
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