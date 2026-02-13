import React, { useState, useMemo } from 'react';
import {
  Baby,
  TrendingUp,
  AlertTriangle,
  GraduationCap,
  Home,
  Utensils,
  Heart,
  BookOpen,
} from 'lucide-react';

/* ---------- 육아 비용 기준 데이터 (만원/연, 2024 기준 참고) ---------- */
interface AgeStageData {
  age: number;
  label: string;
  stage: string;
  food: number;
  clothing: number;
  medical: number;
  education: number;
  childcare: number;  // 보육료/돌봄
  etc: number;
}

const baseData: AgeStageData[] = [
  { age: 0, label: '신생아', stage: '영아기', food: 120, clothing: 60, medical: 80, education: 0, childcare: 120, etc: 100 },
  { age: 1, label: '1세', stage: '영아기', food: 100, clothing: 50, medical: 60, education: 0, childcare: 140, etc: 80 },
  { age: 2, label: '2세', stage: '영아기', food: 100, clothing: 50, medical: 50, education: 0, childcare: 140, etc: 80 },
  { age: 3, label: '3세', stage: '유아기', food: 100, clothing: 50, medical: 40, education: 50, childcare: 120, etc: 70 },
  { age: 4, label: '4세', stage: '유아기', food: 100, clothing: 50, medical: 40, education: 80, childcare: 120, etc: 70 },
  { age: 5, label: '5세', stage: '유아기', food: 100, clothing: 50, medical: 40, education: 80, childcare: 120, etc: 70 },
  { age: 6, label: '6세', stage: '유아기', food: 100, clothing: 50, medical: 40, education: 100, childcare: 100, etc: 70 },
  { age: 7, label: '초1', stage: '초등저', food: 120, clothing: 50, medical: 30, education: 150, childcare: 60, etc: 80 },
  { age: 8, label: '초2', stage: '초등저', food: 120, clothing: 50, medical: 30, education: 180, childcare: 60, etc: 80 },
  { age: 9, label: '초3', stage: '초등저', food: 120, clothing: 50, medical: 30, education: 200, childcare: 60, etc: 80 },
  { age: 10, label: '초4', stage: '초등고', food: 130, clothing: 60, medical: 30, education: 250, childcare: 50, etc: 90 },
  { age: 11, label: '초5', stage: '초등고', food: 130, clothing: 60, medical: 30, education: 280, childcare: 50, etc: 90 },
  { age: 12, label: '초6', stage: '초등고', food: 130, clothing: 60, medical: 30, education: 300, childcare: 50, etc: 90 },
  { age: 13, label: '중1', stage: '중학교', food: 150, clothing: 70, medical: 30, education: 350, childcare: 0, etc: 120 },
  { age: 14, label: '중2', stage: '중학교', food: 150, clothing: 70, medical: 30, education: 380, childcare: 0, etc: 120 },
  { age: 15, label: '중3', stage: '중학교', food: 150, clothing: 70, medical: 30, education: 400, childcare: 0, etc: 130 },
  { age: 16, label: '고1', stage: '고등학교', food: 160, clothing: 80, medical: 30, education: 450, childcare: 0, etc: 150 },
  { age: 17, label: '고2', stage: '고등학교', food: 160, clothing: 80, medical: 30, education: 500, childcare: 0, etc: 150 },
  { age: 18, label: '고3', stage: '고등학교', food: 160, clothing: 80, medical: 30, education: 550, childcare: 0, etc: 160 },
  { age: 19, label: '대1', stage: '대학교', food: 150, clothing: 80, medical: 30, education: 800, childcare: 0, etc: 200 },
  { age: 20, label: '대2', stage: '대학교', food: 150, clothing: 80, medical: 30, education: 800, childcare: 0, etc: 200 },
  { age: 21, label: '대3', stage: '대학교', food: 150, clothing: 80, medical: 30, education: 800, childcare: 0, etc: 200 },
  { age: 22, label: '대4', stage: '대학교', food: 150, clothing: 80, medical: 30, education: 800, childcare: 0, etc: 200 },
];

/* ---------- helpers ---------- */
const fmt = (n: number) => n.toLocaleString('ko-KR');
const fmtWon = (n: number) => {
  if (Math.abs(n) >= 10000) {
    const eok = Math.floor(n / 10000);
    const man = Math.round(n % 10000);
    return man > 0 ? `${fmt(eok)}억 ${fmt(man)}만원` : `${fmt(eok)}억원`;
  }
  return `${fmt(Math.round(n))}만원`;
};

const categoryColors: Record<string, string> = {
  food: 'bg-amber-400',
  clothing: 'bg-purple-400',
  medical: 'bg-red-400',
  education: 'bg-blue-400',
  childcare: 'bg-teal-400',
  etc: 'bg-slate-400',
};

const categoryLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  food: { label: '식비', icon: <Utensils size={14} /> },
  clothing: { label: '의류', icon: <Baby size={14} /> },
  medical: { label: '의료', icon: <Heart size={14} /> },
  education: { label: '교육', icon: <BookOpen size={14} /> },
  childcare: { label: '보육/돌봄', icon: <Home size={14} /> },
  etc: { label: '기타', icon: <Baby size={14} /> },
};

/* ---------- component ---------- */
const ChildCostCalculator: React.FC = () => {
  const [numChildren, setNumChildren] = useState(1);
  const [inflation, setInflation] = useState(3.0);
  const [costMultiplier, setCostMultiplier] = useState(1.0); // 생활 수준 배율
  const [untilAge, setUntilAge] = useState(22); // 계산 종료 나이

  const result = useMemo(() => {
    const data = baseData.filter((d) => d.age <= untilAge);

    // 각 연도별 비용 (물가상승 + 배율 + 자녀수)
    const yearly = data.map((d) => {
      const inflationFactor = Math.pow(1 + inflation / 100, d.age);
      const total = (d.food + d.clothing + d.medical + d.education + d.childcare + d.etc)
        * costMultiplier * inflationFactor * numChildren;
      return {
        ...d,
        food: Math.round(d.food * costMultiplier * inflationFactor * numChildren),
        clothing: Math.round(d.clothing * costMultiplier * inflationFactor * numChildren),
        medical: Math.round(d.medical * costMultiplier * inflationFactor * numChildren),
        education: Math.round(d.education * costMultiplier * inflationFactor * numChildren),
        childcare: Math.round(d.childcare * costMultiplier * inflationFactor * numChildren),
        etc: Math.round(d.etc * costMultiplier * inflationFactor * numChildren),
        total: Math.round(total),
      };
    });

    const grandTotal = yearly.reduce((s, y) => s + y.total, 0);
    const monthlyAvg = grandTotal / ((untilAge + 1) * 12);

    // 단계별 소계
    const stages = ['영아기', '유아기', '초등저', '초등고', '중학교', '고등학교', '대학교'];
    const stageTotals = stages.map((stage) => {
      const stageData = yearly.filter((y) => y.stage === stage);
      const total = stageData.reduce((s, y) => s + y.total, 0);
      return { stage, total, years: stageData.length };
    }).filter((s) => s.years > 0);

    // 카테고리별 합계
    const catTotals = {
      food: yearly.reduce((s, y) => s + y.food, 0),
      clothing: yearly.reduce((s, y) => s + y.clothing, 0),
      medical: yearly.reduce((s, y) => s + y.medical, 0),
      education: yearly.reduce((s, y) => s + y.education, 0),
      childcare: yearly.reduce((s, y) => s + y.childcare, 0),
      etc: yearly.reduce((s, y) => s + y.etc, 0),
    };

    return { yearly, grandTotal, monthlyAvg: Math.round(monthlyAvg), stageTotals, catTotals };
  }, [numChildren, inflation, costMultiplier, untilAge]);

  const maxYearly = Math.max(...result.yearly.map((y) => y.total), 1);

  return (
    <>
      <SEOHead
        title="육아 비용 계산기"
        description="자녀 양육에 드는 비용을 단계별로 계산합니다. 영유아기부터 대학까지 교육비, 생활비, 의료비 등 총 비용을 확인하세요."
        url="/tools/child-cost"
      />
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero */}
      <section className="bg-gradient-to-r from-espresso-800 to-espresso-950 text-white pt-28 pb-12 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Baby size={22} />
            </div>
            <span className="text-oatmeal-300 text-sm font-medium">부자타임 도구</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">육아 비용 계산기</h1>
          <p className="text-oatmeal-300 text-base md:text-lg">
            출산부터 대학까지 연차별 예상 육아 비용을 시뮬레이션합니다.
          </p>
        </div>
      </section>

      {/* Main */}
      <section className="px-4 sm:px-6 py-8 lg:py-12">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* 입력 패널 */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h2 className="text-lg font-bold text-slate-800 mb-5">설정</h2>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">자녀 수</label>
                      <div className="flex gap-2">
                        {[1, 2, 3].map((n) => (
                          <button
                            key={n}
                            onClick={() => setNumChildren(n)}
                            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                              numChildren === n
                                ? 'bg-espresso-800 text-white shadow-md'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {n}명
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">계산 범위</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: 6, label: '유아기까지' },
                          { value: 12, label: '초등까지' },
                          { value: 18, label: '고등까지' },
                          { value: 22, label: '대학까지' },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => setUntilAge(opt.value)}
                            className={`px-2 py-2.5 rounded-xl text-xs font-medium transition-all ${
                              untilAge === opt.value
                                ? 'bg-espresso-800 text-white shadow-md'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">생활 수준</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: 0.7, label: '절약형' },
                          { value: 1.0, label: '보통' },
                          { value: 1.5, label: '여유형' },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => setCostMultiplier(opt.value)}
                            className={`px-2 py-2.5 rounded-xl text-xs font-medium transition-all ${
                              costMultiplier === opt.value
                                ? 'bg-espresso-800 text-white shadow-md'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {opt.label}
                            <span className="block text-[10px] opacity-70">×{opt.value}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">물가상승률 (연)</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={inflation}
                          onChange={(e) => setInflation(Number(e.target.value))}
                          min={0}
                          max={10}
                          step={0.5}
                          className="w-full border-2 border-oatmeal-200 rounded-xl px-4 py-3 text-right pr-10 focus:border-espresso-400 focus:outline-none transition-colors"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 카테고리별 비중 */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h3 className="text-sm font-bold text-slate-700 mb-3">카테고리별 총 비용</h3>
                  <div className="space-y-2">
                    {Object.entries(result.catTotals).map(([key, val]) => {
                      const pct = result.grandTotal > 0 ? (val / result.grandTotal) * 100 : 0;
                      return (
                        <div key={key} className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${categoryColors[key]}`} />
                          <span className="text-xs text-slate-600 flex-1">{categoryLabels[key].label}</span>
                          <span className="text-xs font-semibold text-slate-800">{fmtWon(val)}</span>
                          <span className="text-[10px] text-slate-400 w-8 text-right">{Math.round(pct)}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* 결과 패널 */}
            <div className="lg:col-span-3 space-y-6">

              {/* 핵심 결과 */}
              <div className="bg-gradient-to-r from-espresso-800 to-espresso-950 text-white rounded-2xl p-6 sm:p-8">
                <p className="text-oatmeal-300 text-sm mb-1">총 예상 육아 비용 (0~{untilAge}세)</p>
                <p className="text-3xl sm:text-4xl font-bold mb-1">{fmtWon(result.grandTotal)}</p>
                <p className="text-oatmeal-400 text-sm mb-5">
                  월 평균 {fmtWon(result.monthlyAvg)} · 자녀 {numChildren}명 · 물가상승 {inflation}% 반영
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {result.stageTotals.slice(0, 4).map((s) => (
                    <div key={s.stage} className="bg-white/10 rounded-xl p-3">
                      <p className="text-xs text-oatmeal-300 mb-1">{s.stage}</p>
                      <p className="text-lg font-bold">{fmtWon(s.total)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 단계별 소계 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
                <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <GraduationCap size={18} className="text-espresso-500" />
                  성장 단계별 비용
                </h3>
                <div className="space-y-3">
                  {result.stageTotals.map((s) => {
                    const pct = result.grandTotal > 0 ? (s.total / result.grandTotal) * 100 : 0;
                    const stageColors: Record<string, string> = {
                      '영아기': 'bg-pink-400',
                      '유아기': 'bg-orange-400',
                      '초등저': 'bg-amber-400',
                      '초등고': 'bg-yellow-400',
                      '중학교': 'bg-emerald-400',
                      '고등학교': 'bg-blue-400',
                      '대학교': 'bg-purple-400',
                    };
                    return (
                      <div key={s.stage}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-slate-700">{s.stage} ({s.years}년)</span>
                          <span className="text-sm font-bold text-slate-800">{fmtWon(s.total)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${stageColors[s.stage] ?? 'bg-slate-400'} transition-all duration-500`}
                              style={{ width: `${Math.max(pct, 3)}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400 w-10 text-right">{Math.round(pct)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 연도별 바 차트 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
                <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-espresso-500" />
                  연도별 육아 비용
                </h3>
                <div className="space-y-1.5">
                  {result.yearly.map((y) => {
                    const pct = (y.total / maxYearly) * 100;
                    return (
                      <div key={y.age} className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 w-8 text-right shrink-0">{y.label}</span>
                        <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
                          {/* 스택 바 */}
                          <div className="h-full flex" style={{ width: `${Math.max(pct, 3)}%` }}>
                            {y.total > 0 && (
                              <>
                                <div className="bg-amber-400 h-full" style={{ width: `${(y.food / y.total) * 100}%` }} />
                                <div className="bg-purple-400 h-full" style={{ width: `${(y.clothing / y.total) * 100}%` }} />
                                <div className="bg-red-400 h-full" style={{ width: `${(y.medical / y.total) * 100}%` }} />
                                <div className="bg-blue-400 h-full" style={{ width: `${(y.education / y.total) * 100}%` }} />
                                <div className="bg-teal-400 h-full" style={{ width: `${(y.childcare / y.total) * 100}%` }} />
                                <div className="bg-slate-400 h-full" style={{ width: `${(y.etc / y.total) * 100}%` }} />
                              </>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-slate-500 w-16 text-right shrink-0">{fmtWon(y.total)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-3 mt-4 text-xs text-slate-400">
                  {Object.entries(categoryLabels).map(([key, { label }]) => (
                    <div key={key} className="flex items-center gap-1">
                      <div className={`w-2.5 h-2.5 rounded-full ${categoryColors[key]}`} />
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              {/* 연도별 상세 테이블 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
                <h3 className="text-base font-bold text-slate-800 mb-4">연도별 상세 (단위: 만원)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b-2 border-slate-200">
                        <th className="text-left py-2 px-1 font-medium text-slate-500">나이</th>
                        <th className="text-right py-2 px-1 font-medium text-amber-600">식비</th>
                        <th className="text-right py-2 px-1 font-medium text-purple-600">의류</th>
                        <th className="text-right py-2 px-1 font-medium text-red-600">의료</th>
                        <th className="text-right py-2 px-1 font-medium text-blue-600">교육</th>
                        <th className="text-right py-2 px-1 font-medium text-teal-600">보육</th>
                        <th className="text-right py-2 px-1 font-medium text-slate-500">기타</th>
                        <th className="text-right py-2 px-1 font-bold text-slate-700">합계</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {result.yearly.map((y) => (
                        <tr key={y.age} className="hover:bg-slate-50">
                          <td className="py-2 px-1 text-slate-700 font-medium">{y.label}</td>
                          <td className="py-2 px-1 text-right">{fmt(y.food)}</td>
                          <td className="py-2 px-1 text-right">{fmt(y.clothing)}</td>
                          <td className="py-2 px-1 text-right">{fmt(y.medical)}</td>
                          <td className="py-2 px-1 text-right">{fmt(y.education)}</td>
                          <td className="py-2 px-1 text-right">{fmt(y.childcare)}</td>
                          <td className="py-2 px-1 text-right">{fmt(y.etc)}</td>
                          <td className="py-2 px-1 text-right font-bold">{fmt(y.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-200 font-bold">
                        <td className="py-2 px-1 text-espresso-800">합계</td>
                        <td className="py-2 px-1 text-right">{fmt(result.catTotals.food)}</td>
                        <td className="py-2 px-1 text-right">{fmt(result.catTotals.clothing)}</td>
                        <td className="py-2 px-1 text-right">{fmt(result.catTotals.medical)}</td>
                        <td className="py-2 px-1 text-right">{fmt(result.catTotals.education)}</td>
                        <td className="py-2 px-1 text-right">{fmt(result.catTotals.childcare)}</td>
                        <td className="py-2 px-1 text-right">{fmt(result.catTotals.etc)}</td>
                        <td className="py-2 px-1 text-right text-espresso-800">{fmt(result.grandTotal)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* 팁 */}
              <div className="bg-gradient-to-br from-golden-50 to-cream-100 rounded-2xl border border-golden-200 p-5 sm:p-8">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <AlertTriangle size={20} className="text-golden-600" />
                  육아 비용 절감 팁
                </h3>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-golden-500 mt-0.5">👶</span>
                    <span><strong>정부 지원</strong>: 영아수당(월 100만원), 아동수당(월 10만원), 양육수당 등을 반드시 신청하세요.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-golden-500 mt-0.5">📚</span>
                    <span><strong>교육비</strong>: 무상보육(어린이집), 누리과정(유치원), 무상교육(초·중·고) 혜택을 활용하세요.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-golden-500 mt-0.5">🎓</span>
                    <span><strong>대학 등록금</strong>: 국가장학금, 교내장학금, 학자금대출 등을 미리 알아보세요.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-golden-500 mt-0.5">💰</span>
                    <span><strong>자녀 적금</strong>: 출생 직후부터 월 10~30만원씩 자녀 명의 적금을 시작하면 큰 도움이 됩니다.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-golden-500 mt-0.5">•</span>
                    <span>본 계산기는 통계청·보건사회연구원 자료를 참고한 추정치이며, 실제 비용은 가정 상황에 따라 달라집니다.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  
    </>);
};

export default ChildCostCalculator;
