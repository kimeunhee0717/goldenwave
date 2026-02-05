import React, { useState, useMemo } from 'react';
import {
  Building2,
  Plus,
  X,
  RotateCcw,
  Info,
  TrendingUp,
  ArrowDown,
  ArrowUp,
  Minus,
  Copy,
} from 'lucide-react';

interface Scenario {
  id: number;
  label: string;
  color: string;
  loanRatio: string;       // 대출 비율 %
  loanRate: string;         // 대출 금리 %
  deposit: string;          // 보증금 (만원)
  monthlyRent: string;      // 월세 (만원)
  monthlyCost: string;      // 월 보유비용 (만원) - 관리비+재산세 등
  holdingYears: string;     // 보유 기간 (년)
  appreciationRate: string; // 연간 시세 상승률 %
}

interface ScenarioResult {
  realInvestment: number;   // 실투자금
  loanAmount: number;       // 대출금
  yearlyRent: number;       // 연 임대 수입
  yearlyLoanInterest: number; // 연 대출 이자
  yearlyHoldingCost: number;  // 연 보유 비용
  yearlyNetIncome: number;    // 연 순수익
  rentalYield: number;        // 임대 수익률 %
  expectedSalePrice: number;  // 매도 예상가
  capitalGain: number;        // 양도 차익
  totalNetProfit: number;     // 총 순수익
  totalROI: number;           // 총 투자 수익률 %
  annualizedROI: number;      // 연평균 수익률 %
  monthlyCashflow: number;    // 월 현금흐름
  yearlyCashflows: { year: number; cashflow: number; cumulative: number; assetValue: number }[];
}

const SCENARIO_COLORS = [
  { bg: 'bg-moss-50', border: 'border-moss-300', text: 'text-moss-700', accent: 'bg-moss-500', light: 'bg-moss-100', badge: 'bg-moss-100 text-moss-700' },
  { bg: 'bg-golden-50', border: 'border-golden-300', text: 'text-golden-700', accent: 'bg-golden-500', light: 'bg-golden-100', badge: 'bg-golden-100 text-golden-700' },
  { bg: 'bg-sky-50', border: 'border-sky-300', text: 'text-sky-700', accent: 'bg-sky-500', light: 'bg-sky-100', badge: 'bg-sky-100 text-sky-700' },
];

const defaultScenario = (id: number): Scenario => ({
  id,
  label: `시나리오 ${id}`,
  color: SCENARIO_COLORS[(id - 1) % 3].accent,
  loanRatio: id === 1 ? '60' : id === 2 ? '40' : '70',
  loanRate: id === 1 ? '4.5' : id === 2 ? '4.5' : '4.5',
  deposit: id === 1 ? '5000' : id === 2 ? '15000' : '0',
  monthlyRent: id === 1 ? '80' : id === 2 ? '30' : '120',
  monthlyCost: '30',
  holdingYears: id === 1 ? '5' : id === 2 ? '5' : '5',
  appreciationRate: id === 1 ? '3' : id === 2 ? '3' : '3',
});

const RealEstateCalculator: React.FC = () => {
  // 공통 입력
  const [purchasePrice, setPurchasePrice] = useState<string>('30000'); // 매입가 (만원)
  const [acquisitionTaxRate, setAcquisitionTaxRate] = useState<string>('1.1'); // 취득세율 %

  // 시나리오
  const [scenarios, setScenarios] = useState<Scenario[]>([
    defaultScenario(1),
    defaultScenario(2),
  ]);

  // 모바일 탭
  const [activeTab, setActiveTab] = useState(0);

  const addScenario = () => {
    if (scenarios.length >= 3) return;
    const newId = Math.max(...scenarios.map((s) => s.id)) + 1;
    setScenarios([...scenarios, defaultScenario(newId)]);
  };

  const removeScenario = (id: number) => {
    if (scenarios.length <= 2) return;
    const idx = scenarios.findIndex((s) => s.id === id);
    setScenarios(scenarios.filter((s) => s.id !== id));
    if (activeTab >= scenarios.length - 1) setActiveTab(Math.max(0, scenarios.length - 2));
  };

  const duplicateScenario = (id: number) => {
    if (scenarios.length >= 3) return;
    const source = scenarios.find((s) => s.id === id);
    if (!source) return;
    const newId = Math.max(...scenarios.map((s) => s.id)) + 1;
    setScenarios([...scenarios, { ...source, id: newId, label: `시나리오 ${newId}` }]);
  };

  const updateScenario = (id: number, field: keyof Scenario, value: string) => {
    setScenarios(scenarios.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const handleReset = () => {
    setPurchasePrice('30000');
    setAcquisitionTaxRate('1.1');
    setScenarios([defaultScenario(1), defaultScenario(2)]);
    setActiveTab(0);
  };

  // 계산
  const results = useMemo<ScenarioResult[]>(() => {
    const price = (parseFloat(purchasePrice) || 0) * 10000; // 원
    const taxRate = (parseFloat(acquisitionTaxRate) || 0) / 100;
    const acquisitionTax = price * taxRate;

    return scenarios.map((s) => {
      const loanRatio = (parseFloat(s.loanRatio) || 0) / 100;
      const loanRate = (parseFloat(s.loanRate) || 0) / 100;
      const deposit = (parseFloat(s.deposit) || 0) * 10000;
      const monthlyRent = (parseFloat(s.monthlyRent) || 0) * 10000;
      const monthlyCost = (parseFloat(s.monthlyCost) || 0) * 10000;
      const holdingYears = parseInt(s.holdingYears) || 1;
      const appreciation = (parseFloat(s.appreciationRate) || 0) / 100;

      const loanAmount = price * loanRatio;
      const realInvestment = price + acquisitionTax - loanAmount - deposit;

      const yearlyRent = monthlyRent * 12;
      const yearlyLoanInterest = loanAmount * loanRate;
      const yearlyHoldingCost = monthlyCost * 12;
      const yearlyNetIncome = yearlyRent - yearlyLoanInterest - yearlyHoldingCost;

      const rentalYield = realInvestment > 0 ? (yearlyNetIncome / realInvestment) * 100 : 0;

      const expectedSalePrice = price * Math.pow(1 + appreciation, holdingYears);
      const capitalGain = expectedSalePrice - price;
      const totalNetProfit = yearlyNetIncome * holdingYears + capitalGain;
      const totalROI = realInvestment > 0 ? (totalNetProfit / realInvestment) * 100 : 0;
      const annualizedROI = realInvestment > 0
        ? (Math.pow((realInvestment + totalNetProfit) / realInvestment, 1 / holdingYears) - 1) * 100
        : 0;

      const monthlyCashflow = monthlyRent - (loanAmount * loanRate) / 12 - monthlyCost;

      // 연도별 현금흐름
      const yearlyCashflows = [];
      let cumulative = 0;
      for (let yr = 1; yr <= holdingYears; yr++) {
        cumulative += yearlyNetIncome;
        const assetValue = price * Math.pow(1 + appreciation, yr);
        yearlyCashflows.push({
          year: yr,
          cashflow: yearlyNetIncome,
          cumulative,
          assetValue,
        });
      }

      return {
        realInvestment,
        loanAmount,
        yearlyRent,
        yearlyLoanInterest,
        yearlyHoldingCost,
        yearlyNetIncome,
        rentalYield,
        expectedSalePrice,
        capitalGain,
        totalNetProfit,
        totalROI,
        annualizedROI,
        monthlyCashflow,
        yearlyCashflows,
      };
    });
  }, [purchasePrice, acquisitionTaxRate, scenarios]);

  const formatKRW = (amount: number): string => {
    const abs = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';
    if (abs >= 100000000) {
      const eok = Math.floor(abs / 100000000);
      const man = Math.floor((abs % 100000000) / 10000);
      return man > 0 ? `${sign}${eok}억 ${man.toLocaleString()}만원` : `${sign}${eok}억원`;
    } else if (abs >= 10000) {
      return `${sign}${Math.floor(abs / 10000).toLocaleString()}만원`;
    }
    return `${sign}${Math.floor(abs).toLocaleString()}원`;
  };

  const getColorSet = (idx: number) => SCENARIO_COLORS[idx % 3];

  // 비교 결과 중 최고값 표시용
  const bestIdx = (values: number[], higher = true) => {
    if (values.length === 0) return -1;
    let best = 0;
    for (let i = 1; i < values.length; i++) {
      if (higher ? values[i] > values[best] : values[i] < values[best]) best = i;
    }
    return best;
  };

  const InputField = ({
    label,
    value,
    onChange,
    unit,
    step,
    min,
    max,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    unit: string;
    step?: string;
    min?: string;
    max?: string;
  }) => (
    <div>
      <label className="block text-xs font-semibold text-espresso-600 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2.5 pr-10 border-2 border-oatmeal-200 rounded-xl focus:border-golden-400 focus:ring-2 focus:ring-golden-100 outline-none transition-all text-sm font-medium text-espresso-800"
          step={step || '1'}
          min={min || '0'}
          max={max}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-cocoa-400 text-xs font-medium">
          {unit}
        </span>
      </div>
    </div>
  );

  // 시나리오 입력 카드 (공통)
  const ScenarioInputCard = ({ scenario, idx }: { scenario: Scenario; idx: number }) => {
    const colors = getColorSet(idx);
    return (
      <div className={`rounded-2xl border-2 ${colors.border} ${colors.bg} p-5`}>
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${colors.accent}`} />
            <input
              type="text"
              value={scenario.label}
              onChange={(e) => updateScenario(scenario.id, 'label', e.target.value)}
              className={`text-sm font-bold ${colors.text} bg-transparent border-none outline-none w-28`}
            />
          </div>
          <div className="flex items-center gap-1">
            {scenarios.length < 3 && (
              <button
                onClick={() => duplicateScenario(scenario.id)}
                className="p-1 rounded-lg text-cocoa-400 hover:text-cocoa-600 hover:bg-white/60 transition-colors"
                title="복제"
              >
                <Copy size={14} />
              </button>
            )}
            {scenarios.length > 2 && (
              <button
                onClick={() => removeScenario(scenario.id)}
                className="p-1 rounded-lg text-cocoa-400 hover:text-red-500 hover:bg-white/60 transition-colors"
                title="삭제"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <InputField
            label="대출 비율"
            value={scenario.loanRatio}
            onChange={(v) => updateScenario(scenario.id, 'loanRatio', v)}
            unit="%"
            step="5"
            max="80"
          />
          <InputField
            label="대출 금리"
            value={scenario.loanRate}
            onChange={(v) => updateScenario(scenario.id, 'loanRate', v)}
            unit="%"
            step="0.1"
          />
          <InputField
            label="보증금"
            value={scenario.deposit}
            onChange={(v) => updateScenario(scenario.id, 'deposit', v)}
            unit="만원"
          />
          <InputField
            label="월세"
            value={scenario.monthlyRent}
            onChange={(v) => updateScenario(scenario.id, 'monthlyRent', v)}
            unit="만원"
          />
          <InputField
            label="월 보유비용 (관리비+세금 등)"
            value={scenario.monthlyCost}
            onChange={(v) => updateScenario(scenario.id, 'monthlyCost', v)}
            unit="만원"
          />
          <InputField
            label="보유 기간"
            value={scenario.holdingYears}
            onChange={(v) => updateScenario(scenario.id, 'holdingYears', v)}
            unit="년"
            min="1"
            max="30"
          />
          <InputField
            label="연간 시세 상승률"
            value={scenario.appreciationRate}
            onChange={(v) => updateScenario(scenario.id, 'appreciationRate', v)}
            unit="%"
            step="0.5"
          />
        </div>
      </div>
    );
  };

  // 비교 행 컴포넌트
  const CompareRow = ({
    label,
    values,
    format,
    highlight,
    highlightHigher = true,
    subtext,
  }: {
    label: string;
    values: (number | string)[];
    format?: (v: number | string) => string;
    highlight?: boolean;
    highlightHigher?: boolean;
    subtext?: string;
  }) => {
    const numValues = values.map((v) => (typeof v === 'number' ? v : parseFloat(v as string) || 0));
    const bestI = highlight ? bestIdx(numValues, highlightHigher) : -1;

    return (
      <tr className="border-b border-oatmeal-100 hover:bg-cream-50/50 transition-colors">
        <td className="py-3 px-3 text-sm text-espresso-700 font-medium whitespace-nowrap">
          {label}
          {subtext && <span className="block text-xs text-cocoa-400 font-normal">{subtext}</span>}
        </td>
        {values.map((v, i) => {
          const formatted = format ? format(v) : String(v);
          const isBest = i === bestI;
          const numVal = typeof v === 'number' ? v : 0;
          return (
            <td key={i} className="py-3 px-3 text-sm text-right font-medium whitespace-nowrap">
              <span
                className={
                  isBest
                    ? `${getColorSet(i).text} font-bold`
                    : numVal < 0
                    ? 'text-red-500'
                    : 'text-espresso-700'
                }
              >
                {formatted}
                {isBest && ' ★'}
              </span>
            </td>
          );
        })}
      </tr>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-golden-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-espresso-800 to-espresso-950 text-white py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-golden-100 rounded-2xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-espresso-800" />
            </div>
            <span className="text-golden-200 text-sm font-medium tracking-wider uppercase">
              부자타임 도구
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">부동산 수익률 계산기</h1>
          <p className="text-oatmeal-300 text-base sm:text-lg max-w-2xl">
            투자 조건을 바꿔가며 최대 3개 시나리오를 나란히 비교하세요.
            <br className="hidden sm:block" />
            대출 비율, 임대 조건, 보유 기간별 수익률을 한눈에 확인할 수 있습니다.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        {/* ── 공통 조건 입력 ── */}
        <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-espresso-800">공통 매입 조건</h2>
            <button
              onClick={handleReset}
              className="text-cocoa-500 hover:text-cocoa-700 transition-colors p-1.5 rounded-lg hover:bg-oatmeal-100"
              title="전체 초기화"
            >
              <RotateCcw size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
            <div>
              <label className="block text-xs font-semibold text-espresso-600 mb-1.5">매입가</label>
              <div className="relative">
                <input
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border-2 border-oatmeal-200 rounded-xl focus:border-golden-400 focus:ring-2 focus:ring-golden-100 outline-none transition-all text-lg font-medium text-espresso-800"
                  min="0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-cocoa-400 font-medium text-sm">
                  만원
                </span>
              </div>
              {parseFloat(purchasePrice) > 0 && (
                <p className="text-xs text-cocoa-400 mt-1 ml-1">
                  = {formatKRW((parseFloat(purchasePrice) || 0) * 10000)}
                </p>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                {['10000', '20000', '30000', '50000', '70000'].map((v) => (
                  <button
                    key={v}
                    onClick={() => setPurchasePrice(v)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      purchasePrice === v
                        ? 'bg-golden-100 text-espresso-800 border border-golden-300'
                        : 'bg-oatmeal-100 text-cocoa-500 hover:bg-oatmeal-200 border border-transparent'
                    }`}
                  >
                    {formatKRW(parseInt(v) * 10000)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-espresso-600 mb-1.5">취득세율</label>
              <div className="relative">
                <input
                  type="number"
                  value={acquisitionTaxRate}
                  onChange={(e) => setAcquisitionTaxRate(e.target.value)}
                  className="w-full px-4 py-3 pr-8 border-2 border-oatmeal-200 rounded-xl focus:border-golden-400 focus:ring-2 focus:ring-golden-100 outline-none transition-all text-lg font-medium text-espresso-800"
                  step="0.1"
                  min="0"
                  max="15"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-cocoa-400 font-medium text-sm">
                  %
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {[
                  { label: '1주택 (1.1%)', val: '1.1' },
                  { label: '2주택 (8%)', val: '8' },
                  { label: '3주택 (12%)', val: '12' },
                ].map(({ label, val }) => (
                  <button
                    key={val}
                    onClick={() => setAcquisitionTaxRate(val)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      acquisitionTaxRate === val
                        ? 'bg-golden-100 text-espresso-800 border border-golden-300'
                        : 'bg-oatmeal-100 text-cocoa-500 hover:bg-oatmeal-200 border border-transparent'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── 시나리오 입력 ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-espresso-800">시나리오 설정</h2>
            {scenarios.length < 3 && (
              <button
                onClick={addScenario}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-moss-50 text-moss-700 rounded-xl text-sm font-medium hover:bg-moss-100 transition-colors border border-moss-200"
              >
                <Plus size={16} /> 시나리오 추가
              </button>
            )}
          </div>

          {/* 모바일: 탭 */}
          <div className="sm:hidden flex gap-2 mb-4">
            {scenarios.map((s, i) => {
              const colors = getColorSet(i);
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveTab(i)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === i
                      ? `${colors.bg} ${colors.text} border-2 ${colors.border}`
                      : 'bg-oatmeal-50 text-cocoa-400 border-2 border-transparent'
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>

          {/* 모바일: 선택된 시나리오만 */}
          <div className="sm:hidden">
            <ScenarioInputCard scenario={scenarios[activeTab]} idx={activeTab} />
          </div>

          {/* PC: 나란히 */}
          <div className="hidden sm:grid gap-4" style={{ gridTemplateColumns: `repeat(${scenarios.length}, 1fr)` }}>
            {scenarios.map((s, i) => (
              <ScenarioInputCard key={s.id} scenario={s} idx={i} />
            ))}
          </div>
        </div>

        {/* ── 핵심 비교 카드 ── */}
        <div className="bg-gradient-to-br from-espresso-800 to-espresso-950 rounded-2xl p-5 sm:p-6 text-white shadow-xl">
          <h3 className="text-sm font-medium text-golden-200 mb-5 tracking-wider uppercase">
            시나리오 비교 결과
          </h3>

          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${scenarios.length}, 1fr)` }}>
            {scenarios.map((s, i) => {
              const r = results[i];
              const colors = getColorSet(i);
              return (
                <div key={s.id} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${colors.accent}`} />
                    <span className="text-xs text-oatmeal-300 font-medium">{s.label}</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-golden-100 mb-1">
                    {r.annualizedROI.toFixed(1)}%
                  </div>
                  <p className="text-xs text-oatmeal-400">연평균 수익률</p>
                  <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-oatmeal-400">월 현금흐름</span>
                      <span className={r.monthlyCashflow >= 0 ? 'text-green-300' : 'text-red-300'}>
                        {r.monthlyCashflow >= 0 ? '+' : ''}
                        {formatKRW(r.monthlyCashflow)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-oatmeal-400">임대 수익률</span>
                      <span className="text-golden-200">{r.rentalYield.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-oatmeal-400">총 순수익</span>
                      <span className="text-white font-medium">{formatKRW(r.totalNetProfit)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 상세 비교 테이블 ── */}
        <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-5 sm:p-6">
          <h3 className="text-sm font-semibold text-espresso-700 mb-4">항목별 상세 비교</h3>
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="border-b-2 border-oatmeal-200">
                  <th className="text-left py-3 px-3 text-cocoa-500 font-semibold">항목</th>
                  {scenarios.map((s, i) => (
                    <th key={s.id} className="text-right py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${getColorSet(i).badge}`}
                      >
                        <span className={`w-2 h-2 rounded-full ${getColorSet(i).accent}`} />
                        {s.label}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* 투자 구조 */}
                <tr className="bg-oatmeal-50/50">
                  <td colSpan={scenarios.length + 1} className="py-2 px-3 text-xs font-bold text-cocoa-500 uppercase tracking-wider">
                    투자 구조
                  </td>
                </tr>
                <CompareRow
                  label="대출금"
                  values={results.map((r) => r.loanAmount)}
                  format={(v) => formatKRW(v as number)}
                />
                <CompareRow
                  label="실투자금"
                  subtext="매입가+취득세-대출-보증금"
                  values={results.map((r) => r.realInvestment)}
                  format={(v) => formatKRW(v as number)}
                  highlight
                  highlightHigher={false}
                />

                {/* 수익 */}
                <tr className="bg-oatmeal-50/50">
                  <td colSpan={scenarios.length + 1} className="py-2 px-3 text-xs font-bold text-cocoa-500 uppercase tracking-wider">
                    수익
                  </td>
                </tr>
                <CompareRow
                  label="연 임대 수입"
                  values={results.map((r) => r.yearlyRent)}
                  format={(v) => formatKRW(v as number)}
                  highlight
                />
                <CompareRow
                  label="연 대출 이자"
                  values={results.map((r) => r.yearlyLoanInterest)}
                  format={(v) => formatKRW(v as number)}
                />
                <CompareRow
                  label="연 보유 비용"
                  values={results.map((r) => r.yearlyHoldingCost)}
                  format={(v) => formatKRW(v as number)}
                />
                <CompareRow
                  label="연 순수익"
                  values={results.map((r) => r.yearlyNetIncome)}
                  format={(v) => formatKRW(v as number)}
                  highlight
                />
                <CompareRow
                  label="월 현금흐름"
                  values={results.map((r) => r.monthlyCashflow)}
                  format={(v) => {
                    const n = v as number;
                    return `${n >= 0 ? '+' : ''}${formatKRW(n)}`;
                  }}
                  highlight
                />

                {/* 수익률 */}
                <tr className="bg-oatmeal-50/50">
                  <td colSpan={scenarios.length + 1} className="py-2 px-3 text-xs font-bold text-cocoa-500 uppercase tracking-wider">
                    수익률
                  </td>
                </tr>
                <CompareRow
                  label="임대 수익률"
                  subtext="연 순수익 / 실투자금"
                  values={results.map((r) => r.rentalYield)}
                  format={(v) => `${(v as number).toFixed(2)}%`}
                  highlight
                />
                <CompareRow
                  label="양도 차익"
                  values={results.map((r) => r.capitalGain)}
                  format={(v) => formatKRW(v as number)}
                  highlight
                />
                <CompareRow
                  label="총 순수익"
                  subtext="임대 순수익 + 양도 차익"
                  values={results.map((r) => r.totalNetProfit)}
                  format={(v) => formatKRW(v as number)}
                  highlight
                />
                <CompareRow
                  label="총 투자 수익률"
                  values={results.map((r) => r.totalROI)}
                  format={(v) => `${(v as number).toFixed(1)}%`}
                  highlight
                />
                <CompareRow
                  label="연평균 수익률 (CAGR)"
                  values={results.map((r) => r.annualizedROI)}
                  format={(v) => `${(v as number).toFixed(2)}%`}
                  highlight
                />
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 연도별 현금흐름 비교 차트 ── */}
        <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-5 sm:p-6">
          <h3 className="text-sm font-semibold text-espresso-700 mb-4">연도별 누적 현금흐름 비교</h3>

          {(() => {
            const maxYears = Math.max(...scenarios.map((s) => parseInt(s.holdingYears) || 1));
            const allCumulative = results.flatMap((r) => r.yearlyCashflows.map((c) => c.cumulative));
            const maxCum = Math.max(...allCumulative, 1);
            const minCum = Math.min(...allCumulative, 0);
            const range = maxCum - minCum || 1;

            return (
              <div className="space-y-3">
                {Array.from({ length: maxYears }, (_, yr) => yr + 1).map((year) => (
                  <div key={year} className="flex items-center gap-3">
                    <span className="text-xs text-cocoa-400 w-8 text-right font-mono shrink-0">
                      {year}년
                    </span>
                    <div className="flex-1 flex gap-1.5">
                      {results.map((r, i) => {
                        const cf = r.yearlyCashflows.find((c) => c.year === year);
                        if (!cf) return <div key={i} className="flex-1 h-6" />;
                        const width = Math.max(((cf.cumulative - minCum) / range) * 100, 2);
                        const colors = getColorSet(i);
                        return (
                          <div key={i} className="flex-1 relative h-6 bg-oatmeal-50 rounded-md overflow-hidden group">
                            <div
                              className={`${colors.accent} h-full rounded-md transition-all duration-500 opacity-80`}
                              style={{ width: `${width}%` }}
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium text-espresso-700 opacity-0 group-hover:opacity-100 transition-opacity">
                              {formatKRW(cf.cumulative)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {/* 범례 */}
                <div className="flex flex-wrap gap-4 mt-2 pt-2 border-t border-oatmeal-100">
                  {scenarios.map((s, i) => {
                    const colors = getColorSet(i);
                    return (
                      <div key={s.id} className="flex items-center gap-1.5 text-xs text-cocoa-500">
                        <div className={`w-3 h-3 rounded-full ${colors.accent}`} />
                        {s.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>

        {/* ── 시나리오별 투자 구조 시각화 ── */}
        <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-5 sm:p-6">
          <h3 className="text-sm font-semibold text-espresso-700 mb-4">투자 구조 비교</h3>
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${scenarios.length}, 1fr)` }}>
            {scenarios.map((s, i) => {
              const r = results[i];
              const price = (parseFloat(purchasePrice) || 0) * 10000;
              const taxRate = (parseFloat(acquisitionTaxRate) || 0) / 100;
              const tax = price * taxRate;
              const total = price + tax;
              const deposit = (parseFloat(s.deposit) || 0) * 10000;
              const colors = getColorSet(i);

              const segments = [
                { label: '자기자본', value: r.realInvestment, color: colors.accent },
                { label: '대출금', value: r.loanAmount, color: 'bg-cocoa-300' },
                { label: '보증금', value: deposit, color: 'bg-oatmeal-300' },
              ];

              return (
                <div key={s.id}>
                  <div className="flex items-center gap-1.5 mb-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${colors.accent}`} />
                    <span className="text-xs font-bold text-espresso-700">{s.label}</span>
                  </div>
                  {/* 스택형 바 */}
                  <div className="w-full h-8 rounded-lg overflow-hidden flex bg-oatmeal-50">
                    {segments.map((seg, j) =>
                      seg.value > 0 ? (
                        <div
                          key={j}
                          className={`${seg.color} h-full transition-all duration-500 flex items-center justify-center`}
                          style={{ width: `${(seg.value / total) * 100}%` }}
                        >
                          {(seg.value / total) * 100 > 12 && (
                            <span className="text-[10px] text-white font-medium">
                              {((seg.value / total) * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>
                      ) : null,
                    )}
                  </div>
                  <div className="mt-2 space-y-1">
                    {segments.map((seg, j) => (
                      <div key={j} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-sm ${seg.color}`} />
                          <span className="text-cocoa-500">{seg.label}</span>
                        </div>
                        <span className="text-espresso-700 font-medium">{formatKRW(seg.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 팁 ── */}
        <div className="bg-gradient-to-br from-golden-50 to-cream-100 rounded-2xl border border-golden-200 p-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-golden-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-bold text-espresso-800 mb-2">부동산 투자 체크포인트</h4>
              <ul className="text-sm text-cocoa-600 space-y-1.5">
                <li>
                  • <strong>레버리지 효과:</strong> 대출 비율이 높을수록 자기자본 수익률은 올라가지만, 금리
                  인상 리스크도 커집니다.
                </li>
                <li>
                  • <strong>월 현금흐름이 마이너스</strong>라면 매달 추가 자금이 필요합니다. 여유 자금을 반드시
                  확보하세요.
                </li>
                <li>
                  • <strong>시세 상승률은 보수적으로</strong> 잡는 것이 안전합니다. 최근 10년 전국 평균은 연
                  2~4% 수준입니다.
                </li>
                <li>
                  • <strong>양도소득세</strong>는 보유 기간·다주택 여부에 따라 크게 달라집니다. 세후 수익률도
                  반드시 확인하세요.
                </li>
                <li>
                  • 이 계산기는 단순화된 시뮬레이션이며, 실제 투자 시 세금·공실률·수선비 등을 종합적으로
                  고려해야 합니다.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealEstateCalculator;
