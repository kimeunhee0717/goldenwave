import React, { useState, useMemo } from 'react';
import {
  Umbrella,
  TrendingUp,
  AlertTriangle,
  Target,
  Wallet,
  Calendar,
} from 'lucide-react';

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

/* ---------- component ---------- */
const RetirementCalculator: React.FC = () => {
  const [currentAge, setCurrentAge] = useState(35);
  const [retireAge, setRetireAge] = useState(55);
  const [lifeExpect, setLifeExpect] = useState(85);
  const [monthlyLiving, setMonthlyLiving] = useState(300); // 만원/월
  const [inflation, setInflation] = useState(3.0); // %
  const [investReturn, setInvestReturn] = useState(5.0); // %
  const [currentSaving, setCurrentSaving] = useState(5000); // 만원
  const [monthlySaving, setMonthlySaving] = useState(100); // 만원/월
  const [pensionMonthly, setPensionMonthly] = useState(80); // 만원/월 (연금 수령)

  const result = useMemo(() => {
    const yearsToRetire = Math.max(0, retireAge - currentAge);
    const retirementYears = Math.max(0, lifeExpect - retireAge);

    // 은퇴 시점 물가 반영 월 생활비
    const inflatedMonthlyLiving = monthlyLiving * Math.pow(1 + inflation / 100, yearsToRetire);

    // 은퇴 기간 동안 필요한 총 자금 (실질 수익률 반영)
    // 실질 수익률 = 명목수익률 - 인플레이션 (근사)
    const realReturn = (investReturn - inflation) / 100;
    const monthlyRealReturn = realReturn / 12;

    let totalNeeded = 0;
    if (monthlyRealReturn === 0) {
      totalNeeded = inflatedMonthlyLiving * retirementYears * 12;
    } else {
      // 현가 계산: 은퇴 시점 기준 연금의 현재가치
      const n = retirementYears * 12;
      totalNeeded = inflatedMonthlyLiving * (1 - Math.pow(1 + monthlyRealReturn, -n)) / monthlyRealReturn;
    }

    // 연금으로 충당되는 금액 (현가)
    const inflatedPension = pensionMonthly * Math.pow(1 + inflation / 100, yearsToRetire);
    let pensionCover = 0;
    if (monthlyRealReturn === 0) {
      pensionCover = inflatedPension * retirementYears * 12;
    } else {
      const n = retirementYears * 12;
      pensionCover = inflatedPension * (1 - Math.pow(1 + monthlyRealReturn, -n)) / monthlyRealReturn;
    }

    // 실제 필요 자금 = 총 필요 - 연금 충당
    const netNeeded = Math.max(0, totalNeeded - pensionCover);

    // 현재 저축으로 은퇴 시점 가치
    const monthlyInvestReturn = investReturn / 100 / 12;
    const futureCurrentSaving = currentSaving * Math.pow(1 + investReturn / 100, yearsToRetire);

    // 월 적금으로 은퇴 시점 가치 (적립식)
    let futureMonthlySaving = 0;
    if (monthlyInvestReturn === 0) {
      futureMonthlySaving = monthlySaving * yearsToRetire * 12;
    } else {
      const n = yearsToRetire * 12;
      futureMonthlySaving = monthlySaving * ((Math.pow(1 + monthlyInvestReturn, n) - 1) / monthlyInvestReturn);
    }

    const totalAtRetire = futureCurrentSaving + futureMonthlySaving;

    // 부족/여유
    const shortage = netNeeded - totalAtRetire;
    const isSufficient = shortage <= 0;

    // 부족분 해소를 위한 추가 월 저축액
    let additionalMonthlySaving = 0;
    if (shortage > 0 && yearsToRetire > 0) {
      if (monthlyInvestReturn === 0) {
        additionalMonthlySaving = shortage / (yearsToRetire * 12);
      } else {
        const n = yearsToRetire * 12;
        additionalMonthlySaving = shortage * monthlyInvestReturn / (Math.pow(1 + monthlyInvestReturn, n) - 1);
      }
    }

    // 은퇴 가능 나이 (현재 저축 + 월 적금으로 필요 자금 도달 시점)
    let possibleRetireAge = retireAge;
    if (!isSufficient) {
      for (let testAge = currentAge + 1; testAge <= 80; testAge++) {
        const ytr = testAge - currentAge;
        const retYrs = Math.max(0, lifeExpect - testAge);
        const infML = monthlyLiving * Math.pow(1 + inflation / 100, ytr);
        const mRR = realReturn / 12;

        let needed = 0;
        if (mRR === 0) {
          needed = infML * retYrs * 12;
        } else {
          const nn = retYrs * 12;
          needed = infML * (1 - Math.pow(1 + mRR, -nn)) / mRR;
        }

        const infPen = pensionMonthly * Math.pow(1 + inflation / 100, ytr);
        let penCov = 0;
        if (mRR === 0) {
          penCov = infPen * retYrs * 12;
        } else {
          const nn = retYrs * 12;
          penCov = infPen * (1 - Math.pow(1 + mRR, -nn)) / mRR;
        }

        const netNeed = Math.max(0, needed - penCov);

        const futCS = currentSaving * Math.pow(1 + investReturn / 100, ytr);
        let futMS = 0;
        if (monthlyInvestReturn === 0) {
          futMS = monthlySaving * ytr * 12;
        } else {
          const nn = ytr * 12;
          futMS = monthlySaving * ((Math.pow(1 + monthlyInvestReturn, nn) - 1) / monthlyInvestReturn);
        }

        if (futCS + futMS >= netNeed) {
          possibleRetireAge = testAge;
          break;
        }
      }
    }

    // 연도별 자산 추이 (은퇴 전 적립 + 은퇴 후 인출)
    const timeline: { age: number; assets: number; event: string }[] = [];
    let assets = currentSaving;
    for (let age = currentAge; age <= lifeExpect; age++) {
      if (age < retireAge) {
        // 적립기
        assets = assets * (1 + investReturn / 100) + monthlySaving * 12;
        timeline.push({ age, assets: Math.round(assets), event: '적립' });
      } else {
        // 인출기
        const yearsSinceStart = age - currentAge;
        const livingAtAge = monthlyLiving * Math.pow(1 + inflation / 100, yearsSinceStart) * 12;
        const pensionAtAge = pensionMonthly * Math.pow(1 + inflation / 100, yearsSinceStart) * 12;
        assets = assets * (1 + investReturn / 100) - livingAtAge + pensionAtAge;
        if (assets < 0) assets = 0;
        timeline.push({ age, assets: Math.round(assets), event: '인출' });
      }
    }

    // 자산 고갈 나이
    const depletionAge = timeline.find((t) => t.assets <= 0)?.age ?? lifeExpect + 1;

    return {
      yearsToRetire,
      retirementYears,
      inflatedMonthlyLiving: Math.round(inflatedMonthlyLiving),
      totalNeeded: Math.round(totalNeeded),
      pensionCover: Math.round(pensionCover),
      netNeeded: Math.round(netNeeded),
      futureCurrentSaving: Math.round(futureCurrentSaving),
      futureMonthlySaving: Math.round(futureMonthlySaving),
      totalAtRetire: Math.round(totalAtRetire),
      shortage: Math.round(shortage),
      isSufficient,
      additionalMonthlySaving: Math.round(additionalMonthlySaving),
      possibleRetireAge,
      timeline,
      depletionAge,
    };
  }, [currentAge, retireAge, lifeExpect, monthlyLiving, inflation, investReturn, currentSaving, monthlySaving, pensionMonthly]);

  const maxAsset = Math.max(...result.timeline.map((t) => t.assets), 1);

  const numInput = (
    value: number,
    onChange: (v: number) => void,
    opts?: { min?: number; max?: number; step?: number; suffix?: string }
  ) => (
    <div className="relative">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={opts?.min}
        max={opts?.max}
        step={opts?.step ?? 1}
        className="w-full border-2 border-oatmeal-200 rounded-xl px-4 py-3 text-right pr-12 focus:border-espresso-400 focus:outline-none transition-colors text-base"
      />
      {opts?.suffix && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{opts.suffix}</span>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero */}
      <section className="bg-gradient-to-r from-espresso-800 to-espresso-950 text-white pt-28 pb-12 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Umbrella size={22} />
            </div>
            <span className="text-oatmeal-300 text-sm font-medium">부자타임 도구</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">은퇴 자금 계산기</h1>
          <p className="text-oatmeal-300 text-base md:text-lg">
            목표 은퇴 나이와 월 생활비로 필요 자금을 역산합니다.
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
                  <h2 className="text-lg font-bold text-slate-800 mb-5">기본 정보</h2>

                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">현재 나이</label>
                        {numInput(currentAge, setCurrentAge, { min: 20, max: 70, suffix: '세' })}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">은퇴 나이</label>
                        {numInput(retireAge, setRetireAge, { min: currentAge + 1, max: 80, suffix: '세' })}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">기대 수명</label>
                        {numInput(lifeExpect, setLifeExpect, { min: retireAge + 1, max: 110, suffix: '세' })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">은퇴 후 월 생활비</label>
                      {numInput(monthlyLiving, setMonthlyLiving, { min: 0, suffix: '만원' })}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {[200, 300, 400, 500].map((v) => (
                          <button
                            key={v}
                            onClick={() => setMonthlyLiving(v)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                              monthlyLiving === v ? 'bg-espresso-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            {v}만원
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">예상 연금 수령액 (월)</label>
                      {numInput(pensionMonthly, setPensionMonthly, { min: 0, suffix: '만원' })}
                      <p className="text-xs text-slate-400 mt-1">국민연금 + 개인연금 등 합산</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h2 className="text-lg font-bold text-slate-800 mb-5">재무 현황</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">현재 금융자산</label>
                      {numInput(currentSaving, setCurrentSaving, { min: 0, suffix: '만원' })}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">월 저축/투자액</label>
                      {numInput(monthlySaving, setMonthlySaving, { min: 0, suffix: '만원' })}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">투자 수익률 (연)</label>
                        {numInput(investReturn, setInvestReturn, { min: 0, max: 20, step: 0.5, suffix: '%' })}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">물가상승률 (연)</label>
                        {numInput(inflation, setInflation, { min: 0, max: 10, step: 0.5, suffix: '%' })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 결과 패널 */}
            <div className="lg:col-span-3 space-y-6">

              {/* 핵심 결과 */}
              <div className={`rounded-2xl p-6 sm:p-8 text-white ${
                result.isSufficient
                  ? 'bg-gradient-to-r from-moss-700 to-moss-900'
                  : 'bg-gradient-to-r from-espresso-800 to-espresso-950'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <Target size={24} />
                  <p className="text-sm text-oatmeal-300">
                    {result.isSufficient ? '은퇴 준비 충분!' : '은퇴 자금 부족'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white/10 rounded-xl p-4">
                    <p className="text-xs opacity-80 mb-1">필요 은퇴 자금</p>
                    <p className="text-xl sm:text-2xl font-bold">{fmtWon(result.netNeeded)}</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <p className="text-xs opacity-80 mb-1">은퇴 시점 예상 자산</p>
                    <p className="text-xl sm:text-2xl font-bold">{fmtWon(result.totalAtRetire)}</p>
                  </div>
                </div>

                <div className={`rounded-xl p-4 ${result.isSufficient ? 'bg-white/10' : 'bg-red-500/20'}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{result.isSufficient ? '여유 자금' : '부족 자금'}</span>
                    <span className="text-xl font-bold">
                      {result.isSufficient ? '+' : ''}{fmtWon(Math.abs(result.shortage))}
                    </span>
                  </div>
                  {!result.isSufficient && result.additionalMonthlySaving > 0 && (
                    <p className="text-xs mt-2 opacity-80">
                      매월 <strong>{fmtWon(result.additionalMonthlySaving)}</strong>을 추가 저축하면 해소됩니다.
                    </p>
                  )}
                </div>
              </div>

              {/* 계산 상세 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
                <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Wallet size={18} className="text-espresso-500" />
                  계산 상세
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-600">은퇴까지</span>
                    <span className="text-sm font-medium">{result.yearsToRetire}년</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-600">은퇴 후 생활기간</span>
                    <span className="text-sm font-medium">{result.retirementYears}년</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-600">은퇴 시점 월 생활비 (물가반영)</span>
                    <span className="text-sm font-medium">{fmtWon(result.inflatedMonthlyLiving)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-200 font-medium">
                    <span className="text-sm text-slate-700">총 필요 자금</span>
                    <span className="text-sm">{fmtWon(result.totalNeeded)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-600">(-) 연금으로 충당</span>
                    <span className="text-sm font-medium text-moss-600">-{fmtWon(result.pensionCover)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-200 font-medium">
                    <span className="text-sm text-slate-700">순 필요 자금</span>
                    <span className="text-sm">{fmtWon(result.netNeeded)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-600">현재 자산 → 은퇴 시점 가치</span>
                    <span className="text-sm font-medium">{fmtWon(result.futureCurrentSaving)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-600">월 적금 → 은퇴 시점 누적</span>
                    <span className="text-sm font-medium">{fmtWon(result.futureMonthlySaving)}</span>
                  </div>
                  <div className="flex justify-between py-2 bg-espresso-50 rounded-xl px-3">
                    <span className="font-bold text-espresso-800">은퇴 시점 예상 자산</span>
                    <span className="font-bold text-espresso-800">{fmtWon(result.totalAtRetire)}</span>
                  </div>
                </div>
              </div>

              {/* 자산 추이 차트 (바 차트) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
                <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-espresso-500" />
                  자산 추이 (5년 간격)
                </h3>
                <div className="space-y-2">
                  {result.timeline
                    .filter((_, i) => i % 5 === 0 || i === result.timeline.length - 1)
                    .map((t) => {
                      const pct = (t.assets / maxAsset) * 100;
                      const isRetire = t.age === retireAge;
                      const isDepleted = t.assets <= 0;
                      return (
                        <div key={t.age} className="flex items-center gap-3">
                          <span className={`text-sm w-10 text-right shrink-0 ${isRetire ? 'font-bold text-espresso-800' : 'text-slate-500'}`}>
                            {t.age}세
                          </span>
                          <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden">
                            <div
                              className={`h-full rounded-full flex items-center justify-end pr-2 transition-all duration-300 ${
                                isDepleted
                                  ? 'bg-red-300'
                                  : t.event === '적립'
                                    ? 'bg-moss-400'
                                    : 'bg-amber-400'
                              }`}
                              style={{ width: `${Math.max(pct, 2)}%` }}
                            >
                              {pct > 15 && (
                                <span className="text-xs font-bold text-white whitespace-nowrap">
                                  {fmtWon(t.assets)}
                                </span>
                              )}
                            </div>
                          </div>
                          {pct <= 15 && (
                            <span className="text-xs text-slate-400 shrink-0">{fmtWon(t.assets)}</span>
                          )}
                        </div>
                      );
                    })}
                </div>
                <div className="flex items-center gap-4 mt-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-moss-400" /> 적립기</div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-amber-400" /> 인출기</div>
                  {result.depletionAge <= lifeExpect && (
                    <div className="flex items-center gap-1.5 text-red-400"><div className="w-3 h-3 rounded-full bg-red-300" /> 자산 고갈 ({result.depletionAge}세)</div>
                  )}
                </div>
              </div>

              {/* 핵심 수치 카드 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                  <Calendar size={20} className="text-espresso-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">자산 유지 가능</p>
                  <p className="text-lg font-bold text-slate-800">
                    {result.depletionAge > lifeExpect ? `${lifeExpect}세+` : `${result.depletionAge}세`}
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                  <Target size={20} className="text-espresso-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">가능 은퇴 나이</p>
                  <p className="text-lg font-bold text-slate-800">
                    {result.isSufficient ? `${retireAge}세` : `${result.possibleRetireAge}세`}
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                  <TrendingUp size={20} className="text-espresso-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">실질 수익률</p>
                  <p className="text-lg font-bold text-slate-800">
                    {(investReturn - inflation).toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* 팁 */}
              <div className="bg-gradient-to-br from-golden-50 to-cream-100 rounded-2xl border border-golden-200 p-5 sm:p-8">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <AlertTriangle size={20} className="text-golden-600" />
                  은퇴 준비 팁
                </h3>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-golden-500 mt-0.5">•</span>
                    <span><strong>3층 연금 활용</strong>: 국민연금 + 퇴직연금 + 개인연금(IRP/연금저축)으로 안정적 노후를 준비하세요.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-golden-500 mt-0.5">•</span>
                    <span><strong>인플레이션</strong>: 물가상승률을 반드시 고려해야 합니다. 현재 300만원 생활비는 20년 후 약 {fmt(Math.round(300 * Math.pow(1.03, 20)))}만원에 해당합니다.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-golden-500 mt-0.5">•</span>
                    <span><strong>일찍 시작</strong>: 복리 효과로 매월 50만원을 5% 수익률로 30년 투자하면 약 4억원이 됩니다.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-golden-500 mt-0.5">•</span>
                    <span>의료비, 주거비, 여가비 등 예비 비용도 별도로 준비하시기 바랍니다.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RetirementCalculator;
