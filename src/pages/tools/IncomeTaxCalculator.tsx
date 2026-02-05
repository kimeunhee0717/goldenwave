import React, { useState, useMemo } from 'react';
import {
  FileText,
  Calculator,
  AlertTriangle,
  Info,
  TrendingDown,
} from 'lucide-react';

/* ---------- 2024 종합소득세율 (과세표준 기준) ---------- */
interface TaxBracket {
  from: number;      // 만원
  to: number;        // 만원 (Infinity = 초과)
  rate: number;      // %
  deduction: number; // 누진공제 (만원)
}

const TAX_BRACKETS: TaxBracket[] = [
  { from: 0, to: 1400, rate: 6, deduction: 0 },
  { from: 1400, to: 5000, rate: 15, deduction: 126 },
  { from: 5000, to: 8800, rate: 24, deduction: 576 },
  { from: 8800, to: 15000, rate: 35, deduction: 1544 },
  { from: 15000, to: 30000, rate: 38, deduction: 1994 },
  { from: 30000, to: 50000, rate: 40, deduction: 2594 },
  { from: 50000, to: 100000, rate: 42, deduction: 3594 },
  { from: 100000, to: Infinity, rate: 45, deduction: 6594 },
];

type ExpenseMethod = 'simple' | 'standard';
type BusinessType = 'service' | 'manufacturing' | 'freelance' | 'retail';

const businessTypes: { value: BusinessType; label: string; simpleRate: number; standardRate: number }[] = [
  { value: 'freelance', label: '프리랜서 (인적용역)', simpleRate: 64.1, standardRate: 42.6 },
  { value: 'service', label: '서비스업', simpleRate: 63.0, standardRate: 38.6 },
  { value: 'retail', label: '도·소매업', simpleRate: 79.6, standardRate: 62.1 },
  { value: 'manufacturing', label: '제조업', simpleRate: 74.5, standardRate: 53.7 },
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

function calcIncomeTax(taxableIncome: number): { tax: number; breakdown: { bracket: TaxBracket; amount: number; tax: number }[] } {
  if (taxableIncome <= 0) return { tax: 0, breakdown: [] };

  const breakdown: { bracket: TaxBracket; amount: number; tax: number }[] = [];
  let remaining = taxableIncome;

  for (const bracket of TAX_BRACKETS) {
    if (remaining <= 0) break;
    const bracketRange = bracket.to === Infinity ? remaining : bracket.to - bracket.from;
    const amount = Math.min(remaining, bracketRange);
    const tax = amount * (bracket.rate / 100);
    breakdown.push({ bracket, amount, tax });
    remaining -= amount;
  }

  const totalTax = breakdown.reduce((s, b) => s + b.tax, 0);
  return { tax: Math.round(totalTax), breakdown };
}

/* ---------- component ---------- */
const IncomeTaxCalculator: React.FC = () => {
  const [revenue, setRevenue] = useState(5000); // 수입금액 (만원)
  const [expenseMethod, setExpenseMethod] = useState<ExpenseMethod>('simple');
  const [businessType, setBusinessType] = useState<BusinessType>('freelance');
  const [customExpenseRate, setCustomExpenseRate] = useState<number | null>(null);
  const [personalDeduction, setPersonalDeduction] = useState(150); // 인적공제 (만원) - 본인 150
  const [additionalDeduction, setAdditionalDeduction] = useState(0); // 추가공제 (만원)
  const [prepaidTax, setPrepaidTax] = useState(0); // 기납부세액 (만원)

  const selectedBusiness = businessTypes.find((b) => b.value === businessType)!;

  const result = useMemo(() => {
    // 경비율
    const expenseRate = customExpenseRate !== null
      ? customExpenseRate
      : expenseMethod === 'simple'
        ? selectedBusiness.simpleRate
        : selectedBusiness.standardRate;

    // 필요경비
    const expenses = Math.round(revenue * (expenseRate / 100));

    // 소득금액
    const income = revenue - expenses;

    // 과세표준 = 소득금액 - 인적공제 - 추가공제
    const totalDeductions = personalDeduction + additionalDeduction;
    const taxableIncome = Math.max(0, income - totalDeductions);

    // 산출세액
    const { tax: incomeTax, breakdown } = calcIncomeTax(taxableIncome);

    // 지방소득세 (10%)
    const localTax = Math.round(incomeTax * 0.1);

    // 총 세액
    const totalTax = incomeTax + localTax;

    // 납부/환급
    const netTax = totalTax - prepaidTax;

    // 실효세율
    const effectiveRate = revenue > 0 ? (totalTax / revenue) * 100 : 0;

    // 적용 세율 구간
    let appliedBracket = TAX_BRACKETS[0];
    for (const b of TAX_BRACKETS) {
      if (taxableIncome > b.from) appliedBracket = b;
    }

    return {
      expenseRate,
      expenses,
      income,
      totalDeductions,
      taxableIncome,
      incomeTax,
      localTax,
      totalTax,
      netTax,
      effectiveRate: Math.round(effectiveRate * 10) / 10,
      breakdown,
      appliedBracket,
    };
  }, [revenue, expenseMethod, businessType, customExpenseRate, personalDeduction, additionalDeduction, prepaidTax, selectedBusiness]);

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
              <FileText size={22} />
            </div>
            <span className="text-oatmeal-300 text-sm font-medium">부자타임 도구</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">종합소득세 계산기</h1>
          <p className="text-oatmeal-300 text-base md:text-lg">
            프리랜서·자영업자의 종합소득세를 간이 계산합니다. (2024년 귀속)
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
                  <h2 className="text-lg font-bold text-slate-800 mb-5">소득 정보</h2>

                  {/* 업종 */}
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">업종</label>
                    <select
                      value={businessType}
                      onChange={(e) => {
                        setBusinessType(e.target.value as BusinessType);
                        setCustomExpenseRate(null);
                      }}
                      className="w-full border-2 border-oatmeal-200 rounded-xl px-4 py-3 focus:border-espresso-400 focus:outline-none transition-colors bg-white"
                    >
                      {businessTypes.map((b) => (
                        <option key={b.value} value={b.value}>{b.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* 수입금액 */}
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">연간 수입금액</label>
                    {numInput(revenue, setRevenue, { min: 0, suffix: '만원' })}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {[3000, 5000, 8000, 10000, 20000].map((v) => (
                        <button
                          key={v}
                          onClick={() => setRevenue(v)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                            revenue === v
                              ? 'bg-espresso-800 text-white'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          {fmtWon(v)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 경비율 방식 */}
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">경비율 방식</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'simple' as ExpenseMethod, label: '단순경비율', rate: selectedBusiness.simpleRate },
                        { value: 'standard' as ExpenseMethod, label: '기준경비율', rate: selectedBusiness.standardRate },
                      ].map((m) => (
                        <button
                          key={m.value}
                          onClick={() => {
                            setExpenseMethod(m.value);
                            setCustomExpenseRate(null);
                          }}
                          className={`px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                            expenseMethod === m.value && customExpenseRate === null
                              ? 'bg-espresso-800 text-white shadow-md'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <span className="block">{m.label}</span>
                          <span className="block text-xs mt-0.5 opacity-80">{m.rate}%</span>
                        </button>
                      ))}
                    </div>
                    <div className="mt-3">
                      <label className="block text-xs text-slate-400 mb-1">직접 입력 (선택)</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={customExpenseRate ?? ''}
                          onChange={(e) => {
                            const v = e.target.value;
                            setCustomExpenseRate(v === '' ? null : Number(v));
                          }}
                          placeholder="자동 적용"
                          min={0}
                          max={100}
                          step={0.1}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-right pr-8 text-sm focus:border-espresso-400 focus:outline-none"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">%</span>
                      </div>
                    </div>
                  </div>

                  {/* 공제 */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h3 className="text-sm font-bold text-slate-700">소득공제</h3>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">인적공제 (본인 150만원 기본)</label>
                      {numInput(personalDeduction, setPersonalDeduction, { min: 0, suffix: '만원' })}
                      <p className="text-xs text-slate-400 mt-1">부양가족 1인당 150만원 추가</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">추가 소득공제</label>
                      {numInput(additionalDeduction, setAdditionalDeduction, { min: 0, suffix: '만원' })}
                      <p className="text-xs text-slate-400 mt-1">국민연금, 건강보험료, 개인연금 등</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">기납부세액 (원천징수 등)</label>
                      {numInput(prepaidTax, setPrepaidTax, { min: 0, suffix: '만원' })}
                      <p className="text-xs text-slate-400 mt-1">3.3% 원천징수 등 이미 납부한 세금</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 결과 패널 */}
            <div className="lg:col-span-3 space-y-6">

              {/* 핵심 결과 */}
              <div className="bg-gradient-to-r from-espresso-800 to-espresso-950 text-white rounded-2xl p-6 sm:p-8">
                <p className="text-oatmeal-300 text-sm mb-1">예상 종합소득세</p>
                <p className="text-3xl sm:text-4xl font-bold mb-1">
                  {fmtWon(result.totalTax)}
                </p>
                <p className="text-oatmeal-400 text-sm mb-4">
                  소득세 {fmtWon(result.incomeTax)} + 지방소득세 {fmtWon(result.localTax)}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-xs text-oatmeal-300 mb-1">실효세율</p>
                    <p className="text-xl font-bold">{result.effectiveRate}%</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-xs text-oatmeal-300 mb-1">적용 세율</p>
                    <p className="text-xl font-bold">{result.appliedBracket.rate}%</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-xs text-oatmeal-300 mb-1">경비율</p>
                    <p className="text-xl font-bold">{result.expenseRate}%</p>
                  </div>
                  <div className={`rounded-xl p-3 ${result.netTax > 0 ? 'bg-red-500/20' : 'bg-moss-500/20'}`}>
                    <p className="text-xs text-oatmeal-300 mb-1">{result.netTax > 0 ? '추가 납부' : '환급 예상'}</p>
                    <p className="text-xl font-bold">
                      {result.netTax > 0 ? fmtWon(result.netTax) : fmtWon(Math.abs(result.netTax))}
                    </p>
                  </div>
                </div>
              </div>

              {/* 계산 과정 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
                <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Calculator size={18} className="text-espresso-500" />
                  계산 과정
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-2.5 border-b border-slate-100">
                    <span className="text-sm text-slate-600">수입금액</span>
                    <span className="text-sm font-medium text-slate-800">{fmtWon(revenue)}</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-slate-100">
                    <span className="text-sm text-slate-600">(-) 필요경비 ({result.expenseRate}%)</span>
                    <span className="text-sm font-medium text-red-500">-{fmtWon(result.expenses)}</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-slate-200 font-medium">
                    <span className="text-sm text-slate-700">소득금액</span>
                    <span className="text-sm text-slate-800">{fmtWon(result.income)}</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-slate-100">
                    <span className="text-sm text-slate-600">(-) 인적공제</span>
                    <span className="text-sm font-medium text-red-500">-{fmtWon(personalDeduction)}</span>
                  </div>
                  {additionalDeduction > 0 && (
                    <div className="flex justify-between py-2.5 border-b border-slate-100">
                      <span className="text-sm text-slate-600">(-) 추가 소득공제</span>
                      <span className="text-sm font-medium text-red-500">-{fmtWon(additionalDeduction)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2.5 border-b border-slate-200 font-medium">
                    <span className="text-sm text-slate-700">과세표준</span>
                    <span className="text-sm text-slate-800">{fmtWon(result.taxableIncome)}</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-slate-100">
                    <span className="text-sm text-slate-600">산출세액 (소득세)</span>
                    <span className="text-sm font-medium text-slate-800">{fmtWon(result.incomeTax)}</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-slate-100">
                    <span className="text-sm text-slate-600">(+) 지방소득세 (10%)</span>
                    <span className="text-sm font-medium text-slate-800">{fmtWon(result.localTax)}</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-slate-200 font-medium">
                    <span className="text-sm text-slate-700">총 세액</span>
                    <span className="text-sm text-slate-800">{fmtWon(result.totalTax)}</span>
                  </div>
                  {prepaidTax > 0 && (
                    <div className="flex justify-between py-2.5 border-b border-slate-100">
                      <span className="text-sm text-slate-600">(-) 기납부세액</span>
                      <span className="text-sm font-medium text-moss-600">-{fmtWon(prepaidTax)}</span>
                    </div>
                  )}
                  <div className={`flex justify-between py-3 rounded-xl px-3 mt-2 ${
                    result.netTax > 0 ? 'bg-red-50' : 'bg-moss-50'
                  }`}>
                    <span className="font-bold text-slate-800">
                      {result.netTax > 0 ? '추가 납부세액' : '환급 예상액'}
                    </span>
                    <span className={`font-bold text-lg ${result.netTax > 0 ? 'text-red-600' : 'text-moss-700'}`}>
                      {fmtWon(Math.abs(result.netTax))}
                    </span>
                  </div>
                </div>
              </div>

              {/* 세율 구간 시각화 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
                <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <TrendingDown size={18} className="text-espresso-500" />
                  과세표준 구간별 세금
                </h3>
                {result.breakdown.length === 0 ? (
                  <p className="text-sm text-slate-400">과세표준이 0원입니다.</p>
                ) : (
                  <div className="space-y-3">
                    {result.breakdown.map((b, i) => {
                      const pct = result.incomeTax > 0 ? (b.tax / result.incomeTax) * 100 : 0;
                      const colors = [
                        'bg-emerald-400', 'bg-teal-400', 'bg-blue-400', 'bg-indigo-400',
                        'bg-purple-400', 'bg-pink-400', 'bg-red-400', 'bg-red-600',
                      ];
                      return (
                        <div key={i}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-slate-600">
                              {fmtWon(b.bracket.from)}~{b.bracket.to === Infinity ? '' : fmtWon(b.bracket.to)} ({b.bracket.rate}%)
                            </span>
                            <span className="text-sm font-bold text-slate-800">{fmtWon(Math.round(b.tax))}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${colors[i]} transition-all duration-500`}
                                style={{ width: `${Math.max(pct, 3)}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-400 w-14 text-right">{fmtWon(Math.round(b.amount))}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 세율 테이블 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
                <h3 className="text-base font-bold text-slate-800 mb-4">2024년 종합소득세율표</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-slate-200">
                        <th className="text-left py-2 px-2 font-medium text-slate-500">과세표준</th>
                        <th className="text-right py-2 px-2 font-medium text-slate-500">세율</th>
                        <th className="text-right py-2 px-2 font-medium text-slate-500">누진공제</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {TAX_BRACKETS.map((b, i) => {
                        const isActive = result.taxableIncome > b.from && (b.to === Infinity || result.taxableIncome <= b.to);
                        return (
                          <tr key={i} className={isActive ? 'bg-espresso-50 font-semibold' : ''}>
                            <td className="py-2.5 px-2 text-slate-700">
                              {fmtWon(b.from)} ~ {b.to === Infinity ? '' : fmtWon(b.to)}
                            </td>
                            <td className="py-2.5 px-2 text-right">{b.rate}%</td>
                            <td className="py-2.5 px-2 text-right">{b.deduction > 0 ? fmtWon(b.deduction) : '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 수입별 비교 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
                <h3 className="text-base font-bold text-slate-800 mb-4">수입금액별 세금 비교</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-slate-200">
                        <th className="text-left py-2 px-2 font-medium text-slate-500">수입금액</th>
                        <th className="text-right py-2 px-2 font-medium text-slate-500">소득세+지방세</th>
                        <th className="text-right py-2 px-2 font-medium text-slate-500">실효세율</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {[2000, 3000, 5000, 8000, 10000, 15000, 20000, 30000, 50000].map((r) => {
                        const expenses = Math.round(r * (result.expenseRate / 100));
                        const income = r - expenses;
                        const taxable = Math.max(0, income - personalDeduction - additionalDeduction);
                        const { tax: it } = calcIncomeTax(taxable);
                        const lt = Math.round(it * 0.1);
                        const total = it + lt;
                        const eff = r > 0 ? Math.round((total / r) * 1000) / 10 : 0;
                        const isActive = r === revenue;
                        return (
                          <tr key={r} className={isActive ? 'bg-espresso-50 font-bold' : ''}>
                            <td className="py-2.5 px-2 text-slate-700">{fmtWon(r)}</td>
                            <td className="py-2.5 px-2 text-right">{fmtWon(total)}</td>
                            <td className="py-2.5 px-2 text-right">{eff}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 주의사항 */}
              <div className="bg-gradient-to-br from-golden-50 to-cream-100 rounded-2xl border border-golden-200 p-5 sm:p-8">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <AlertTriangle size={20} className="text-golden-600" />
                  참고 사항
                </h3>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-golden-500 mt-0.5">•</span>
                    <span><strong>단순경비율</strong>: 직전 연도 수입금액이 일정 금액 이하인 사업자에게 적용됩니다. (인적용역: 2,400만원 이하)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-golden-500 mt-0.5">•</span>
                    <span><strong>기준경비율</strong>: 단순경비율 적용 대상이 아닌 경우 적용됩니다. 주요경비(매입비용, 임차료, 인건비)는 별도 증빙이 필요합니다.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-golden-500 mt-0.5">•</span>
                    <span><strong>세액공제</strong>: 본 계산기는 기본적인 소득공제만 반영합니다. 세액공제(자녀, 연금, 보험료 등)는 포함되지 않습니다.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-golden-500 mt-0.5">•</span>
                    <span>정확한 세금 계산은 세무사 상담 또는 국세청 홈택스를 이용하시기 바랍니다.</span>
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

export default IncomeTaxCalculator;
