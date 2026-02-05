import { Link } from 'react-router-dom';
import { Target, Users, Lightbulb, TrendingUp } from 'lucide-react';

const values = [
  {
    icon: Target,
    title: '정확한 정보',
    description: '검증된 데이터와 분석을 바탕으로 신뢰할 수 있는 콘텐츠를 제공합니다.',
  },
  {
    icon: Users,
    title: '독자 중심',
    description: '독자 여러분의 경제적 성장을 최우선으로 생각합니다.',
  },
  {
    icon: Lightbulb,
    title: '실용적 인사이트',
    description: '바로 실천할 수 있는 구체적이고 실용적인 정보를 전달합니다.',
  },
  {
    icon: TrendingUp,
    title: '트렌드 선도',
    description: 'AI, 디지털 경제 등 최신 트렌드를 가장 빠르게 분석합니다.',
  },
];

export default function AboutPage() {
  return (
    <div className="pt-28 pb-20 bg-white min-h-screen">
      <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
        {/* 헤더 */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-tr from-moss-600 to-sage-400 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-moss-500/30">
              B
            </div>
            <span className="font-bold text-2xl tracking-tight text-slate-900">
              부자타임
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            경제적 자유를 향한 매일의 인사이트
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed max-w-xl mx-auto">
            AI, 재테크, 부업, 비즈니스 — <br className="hidden md:inline" />
            부자가 되기 위해 알아야 할 모든 것을 전합니다.
          </p>
        </div>

        {/* 소개 본문 */}
        <div className="prose prose-slate max-w-none space-y-8 text-slate-700 leading-relaxed mb-16">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">부자타임은?</h2>
            <p>
              부자타임은 AI 시대의 경제적 자유를 꿈꾸는 모든 분들을 위한 콘텐츠 플랫폼입니다.
              빠르게 변화하는 디지털 경제 환경 속에서 재테크, AI 활용법, 부업·N잡, 비즈니스 전략 등
              실질적으로 도움이 되는 정보를 매일 전달합니다.
            </p>
            <p>
              단순한 뉴스 전달이 아닌, 독자 여러분이 바로 실천할 수 있는 구체적인 인사이트와
              전략을 제공하는 것이 부자타임의 목표입니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">운영사</h2>
            <div className="bg-slate-50 rounded-xl p-6 text-sm space-y-2">
              <p><strong>상호:</strong> 골든웨이브</p>
              <p><strong>대표:</strong> 김은희</p>
              <p><strong>사업자등록번호:</strong> 370-18-02799</p>
              <p><strong>주소:</strong> 부산광역시 부산진구 동평로 183번길 86-3</p>
              <p><strong>이메일:</strong> kimeunhee0717@gmail.com</p>
              <p><strong>전화:</strong> 010-6289-0101</p>
            </div>
          </section>
        </div>

        {/* 핵심 가치 */}
        <div className="mb-16">
          <h2 className="text-xl font-bold text-slate-900 mb-8 text-center">핵심 가치</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((v) => (
              <div
                key={v.title}
                className="p-6 rounded-2xl border border-slate-100 hover:border-moss-200 hover:shadow-lg transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-moss-50 flex items-center justify-center mb-4 group-hover:bg-moss-100 transition-colors">
                  <v.icon size={20} className="text-moss-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{v.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-br from-slate-50 to-moss-50 rounded-2xl p-10">
          <h3 className="text-lg font-bold text-slate-900 mb-3">
            함께 경제적 자유를 향해 나아가요
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            매일 업데이트되는 인사이트를 놓치지 마세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/blog"
              className="px-6 py-3 bg-slate-900 text-white font-medium rounded-full text-sm hover:bg-slate-800 transition-colors"
            >
              콘텐츠 보러가기
            </Link>
            <Link
              to="/contact"
              className="px-6 py-3 border border-slate-200 text-slate-700 font-medium rounded-full text-sm hover:border-moss-300 hover:text-moss-600 transition-colors"
            >
              문의하기
            </Link>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-100 text-center">
          <Link
            to="/"
            className="text-sm text-slate-500 hover:text-moss-600 transition-colors"
          >
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
