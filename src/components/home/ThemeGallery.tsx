import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const themes = [
  {
    id: 1,
    title: "글로우업 SNS 캠페인",
    category: "뷰티 브랜드",
    image: "https://picsum.photos/id/48/600/800",
    stats: "팔로워 0→10만 (3개월), 매출 280% 상승"
  },
  {
    id: 2,
    title: "쿡마스터 리브랜딩",
    category: "주방가전",
    image: "https://picsum.photos/id/201/600/800",
    stats: "브랜드 인지도 65%→92%, 연 매출 50억 돌파"
  },
  {
    id: 3,
    title: "핏플레이스 투자 유치 PR",
    category: "스타트업",
    image: "https://picsum.photos/id/3/600/800",
    stats: "15개 미디어 보도, 30억 시리즈 A 유치"
  },
  {
    id: 4,
    title: "스트릿라이프 글로벌 진출",
    category: "패션 브랜드",
    image: "https://picsum.photos/id/1080/600/800",
    stats: "6개월 만에 현지 시장 점유율 5% 달성"
  },
];

const ThemeGallery: React.FC = () => {
  return (
    <section id="portfolio" className="py-24 bg-slate-50">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <span className="text-primary-600 font-bold tracking-wider text-sm uppercase mb-2 block">Portfolio</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              성공 사례
            </h2>
          </div>
          <a href="#" className="inline-flex items-center font-bold text-slate-900 hover:text-primary-600 transition-colors border-b-2 border-slate-900 hover:border-primary-600 pb-1">
            더 많은 사례 보기 <ArrowUpRight className="ml-2 w-5 h-5" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {themes.map((theme) => (
            <div key={theme.id} className="group relative cursor-pointer">
              <div className="overflow-hidden rounded-2xl shadow-lg bg-white aspect-[3/4]">
                <img 
                  src={theme.image} 
                  alt={theme.title} 
                  className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="px-6 py-3 bg-white rounded-full text-slate-900 font-bold transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    자세히 보기
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs font-medium text-primary-600 mb-1">{theme.category}</p>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{theme.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ThemeGallery;