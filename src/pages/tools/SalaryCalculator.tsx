import React, { useState, useMemo } from 'react';
import { Wallet, DollarSign, Users, Baby, ShieldOff, Info, RotateCcw } from 'lucide-react';

interface DeductionItem {
  label: string;
  amount: number;
  rate?: string;
}

const SalaryCalculator: React.FC = () => {
  const [annualSalary, setAnnualSalary] = useState<string>('5000'); // 만원
  const [nonTaxable, setNonTaxable] = useState<string>('20'); // 월 비과세 (만원)
  const [dependents, setDependents] = useState<number>(1); // 부양가족 수 (본인 포함)
  const [children, setChildren] = useState<number>(0); // 20세 이하 자녀 수

  const result = useMemo(() => {
    const annual = (parseFloat(annualSalary) || 0) * 10000;
    const monthlyNonTax = (parseFloat(nonTaxable) || 0) * 10000;

    if (annual <= 0) {
      return { monthlyGross: 0, monthlyNet: 0, annualNet: 0, deductions: [], totalDeduction: 0 };
    }

    const monthlyGross = annual / 12;
    const annualNonTax = monthlyNonTax * 12;
    const annualTaxable = Math.max(annual - annualNonTax, 0);
    const monthlyTaxable = annualTaxable / 12;

    // 4대 보험 (월 기준, 과세 급여 기준)
    // 국민연금: 4.5% (상한 월 590만원)
    const pensionBase = Math.min(monthlyTaxable, 5900000);
    const pension = Math.floor(pensionBase * 0.045);

    // 건강보험: 3.545%
    const health = Math.floor(monthlyTaxable * 0.03545);

    // 장기요양보험: 건강보험의 12.81%
    const longTermCare = Math.floor(health * 0.1281);

    // 고용보험: 0.9%
    const employment = Math.floor(monthlyTaxable * 0.009);

    // 소득세 계산 (간이세액 근사)
    // 1) 근로소득공제
    let earnedIncomeDeduction = 0;
    if (annualTaxable <= 5000000) {
      earnedIncomeDeduction = annualTaxable * 0.7;
    } else if (annualTaxable <= 15000000) {
      earnedIncomeDeduction = 3500000 + (annualTaxable - 5000000) * 0.4;
    } else if (annualTaxable <= 45000000) {
      earnedIncomeDeduction = 7500000 + (annualTaxable - 15000000) * 0.15;
    } else if (annualTaxable <= 100000000) {
      earnedIncomeDeduction = 12000000 + (annualTaxable - 45000000) * 0.05;
    } else {
      earnedIncomeDeduction = 14750000 + (annualTaxable - 100000000) * 0.02;
    }

    const earnedIncome = annualTaxable - earnedIncomeDeduction;

    // 2) 인적공제 (본인 + 부양가족 1인당 150만원)
    const personalDeduction = dependents * 1500000;

    // 3) 연금보험료공제
    const pensionDeduction = pension * 12;

    // 4) 특별소득공제 근사 (건강보험 + 고용보험 연 합계)
    const specialDeduction = (health + longTermCare + employment) * 12;

    // 5) 과세표준
    const taxBase = Math.max(earnedIncome - personalDeduction - pensionDeduction - specialDeduction, 0);

    // 6) 산출세액 (2024 기준 세율)
    let annualTax = 0;
    if (taxBase <= 14000000) {
      annualTax = taxBase * 0.06;
    } else if (taxBase <= 50000000) {
      annualTax = 840000 + (taxBase - 14000000) * 0.15;
    } else if (taxBase <= 88000000) {
      annualTax = 6240000 + (taxBase - 50000000) * 0.24;
    } else if (taxBase <= 150000000) {
      annualTax = 15360000 + (taxBase - 88000000) * 0.35;
    } else if (taxBase <= 300000000) {
      annualTax = 37060000 + (taxBase - 150000000) * 0.38;
    } else if (taxBase <= 500000000) {
      annualTax = 94060000 + (taxBase - 300000000) * 0.4;
    } else if (taxBase <= 1000000000) {
      annualTax = 174060000 + (taxBase - 500000000) * 0.42;
    } else {
      annualTax = 384060000 + (taxBase - 1000000000) * 0.45;
    }

    // 7) 근로소득세액공제
    let taxCredit = 0;
    if (annualTax <= 1300000) {
      taxCredit = annualTax * 0.55;
    } else {
      taxCredit = 715000 + (annualTax - 1300000) * 0.3;
    }
    // 세액공제 한도
    if (annualTaxable <= 33000000) {
      taxCredit = Math.min(taxCredit, 740000);
    } else if (annualTaxable <= 70000000) {
      taxCredit = Math.min(taxCredit, 740000 - (annualTaxable - 33000000) * 0.008);
      taxCredit = Math.max(taxCredit, 660000);
    } else {
      taxCredit = Math.min(taxCredit, 660000 - (annualTaxable - 70000000) * 0.5);
      taxCredit = Math.max(taxCredit, 500000);
    }

    // 8) 자녀세액공제
    let childTaxCredit = 0;
    if (children === 1) childTaxCredit = 150000;
    else if (children === 2) childTaxCredit = 300000;
    else if (children >= 3) childTaxCredit = 300000 + (children - 2) * 300000;

    const finalAnnualTax = Math.max(annualTax - taxCredit - childTaxCredit, 0);
    const monthlyIncomeTax = Math.floor(finalAnnualTax / 12);

    // 지방소득세: 소득세의 10%
    const localTax = Math.floor(monthlyIncomeTax * 0.1);

    const totalDeduction = pension + health + longTermCare + employment + monthlyIncomeTax + localTax;
    const monthlyNet = monthlyGross - totalDeduction;
    const annualNet = monthlyNet * 12;

    const deductions: DeductionItem[] = [
      { label: '국민연금', amount: pension, rate: '4.5%' },
      { label: '건강보험', amount: health, rate: '3.545%' },
      { label: '장기요양보험', amount: longTermCare, rate: '건강보험의 12.81%' },
      { label: '고용보험', amount: employment, rate: '0.9%' },
      { label: '소득세', amount: monthlyIncomeTax },
      { label: '지방소득세', amount: localTax, rate: '소득세의 10%' },
    ];

    return { monthlyGross, monthlyNet, annualNet, deductions, totalDeduction };
  }, [annualSalary, nonTaxable, dependents, children]);

  const formatKRW = (amount: number): string => {
    if (amount >= 100000000) {
      const eok = Math.floor(amount / 100000000);
      const man = Math.floor((amount % 100000000) / 10000);
      return man > 0 ? `${eok}억 ${man.toLocaleString()}만원` : `${eok}억원`;
    } else if (amount >= 10000) {
      return `${Math.floor(amount / 10000).toLocaleString()}만원`;
    }
    return `${Math.floor(amount).toLocaleString()}원`;
  };

  const formatWon = (amount: number): string => {
    return `${Math.floor(amount).toLocaleString()}원`;
  };

  const handleReset = () => {
    setAnnualSalary('5000');
    setNonTaxable('20');
    setDependents(1);
    setChildren(0);
  };

  const annual = (parseFloat(annualSalary) || 0) * 10000;
  const deductionRate = annual > 0 ? ((result.totalDeduction * 12) / annual * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-golden-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-espresso-800 to-espresso-950 text-white py-16 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-golden-100 rounded-2xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-espresso-800" />
            </div>
            <span className="text-golden-200 text-sm font-medium tracking-wider uppercase">부자타임 도구</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">연봉 실수령액 계산기</h1>
          <p className="text-oatmeal-300 text-lg max-w-2xl">
            연봉에서 4대 보험과 세금을 제외한 실제 월급을 정확하게 계산해보세요.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-6 py-10">
        <div className="grid lg:grid-cols-5 gap-8">

          {/* 입력 패널 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-espresso-800">급여 정보 입력</h2>
                <button
                  onClick={handleReset}
                  className="text-cocoa-500 hover:text-cocoa-700 transition-colors p-1.5 rounded-lg hover:bg-oatmeal-100"
                  title="초기화"
                >
                  <RotateCcw size={18} />
                </button>
              </div>

              <div className="space-y-5">
                {/* 연봉 */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-espresso-700 mb-2">
                    <DollarSign size={16} className="text-golden-500" />
                    연봉 (세전)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={annualSalary}
                      onChange={(e) => setAnnualSalary(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border-2 border-oatmeal-200 rounded-xl focus:border-golden-400 focus:ring-2 focus:ring-golden-100 outline-none transition-all text-lg font-medium text-espresso-800"
                      placeholder="5000"
                      min="0"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-cocoa-400 font-medium">만원</span>
                  </div>
                  {parseFloat(annualSalary) > 0 && (
                    <p className="text-xs text-cocoa-400 mt-1 ml-1">월 세전 {formatKRW(annual / 12)}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {[3000, 4000, 5000, 7000, 10000].map((v) => (
                      <button
                        key={v}
                        onClick={() => setAnnualSalary(v.toString())}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          annualSalary === v.toString()
                            ? 'bg-golden-100 text-espresso-800 border border-golden-300'
                            : 'bg-oatmeal-100 text-cocoa-500 hover:bg-oatmeal-200 border border-transparent'
                        }`}
                      >
                        {formatKRW(v * 10000)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 비과세액 */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-espresso-700 mb-2">
                    <ShieldOff size={16} className="text-golden-500" />
                    월 비과세액
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={nonTaxable}
                      onChange={(e) => setNonTaxable(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border-2 border-oatmeal-200 rounded-xl focus:border-golden-400 focus:ring-2 focus:ring-golden-100 outline-none transition-all text-lg font-medium text-espresso-800"
                      placeholder="20"
                      min="0"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-cocoa-400 font-medium">만원</span>
                  </div>
                  <p className="text-xs text-cocoa-400 mt-1 ml-1">식대 20만원이 일반적</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {[0, 10, 20, 30].map((v) => (
                      <button
                        key={v}
                        onClick={() => setNonTaxable(v.toString())}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          nonTaxable === v.toString()
                            ? 'bg-golden-100 text-espresso-800 border border-golden-300'
                            : 'bg-oatmeal-100 text-cocoa-500 hover:bg-oatmeal-200 border border-transparent'
                        }`}
                      >
                        {v === 0 ? '없음' : `${v}만원`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 부양가족 수 */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-espresso-700 mb-2">
                    <Users size={16} className="text-golden-500" />
                    부양가족 수 (본인 포함)
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setDependents(Math.max(1, dependents - 1))}
                      className="w-10 h-10 rounded-xl border-2 border-oatmeal-200 flex items-center justify-center text-lg font-bold text-cocoa-500 hover:border-golden-400 transition-all"
                    >
                      -
                    </button>
                    <span className="text-2xl font-bold text-espresso-800 w-10 text-center">{dependents}</span>
                    <button
                      onClick={() => setDependents(Math.min(10, dependents + 1))}
                      className="w-10 h-10 rounded-xl border-2 border-oatmeal-200 flex items-center justify-center text-lg font-bold text-cocoa-500 hover:border-golden-400 transition-all"
                    >
                      +
                    </button>
                    <span className="text-xs text-cocoa-400">명</span>
                  </div>
                </div>

                {/* 20세 이하 자녀 수 */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-espresso-700 mb-2">
                    <Baby size={16} className="text-golden-500" />
                    20세 이하 자녀 수
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      className="w-10 h-10 rounded-xl border-2 border-oatmeal-200 flex items-center justify-center text-lg font-bold text-cocoa-500 hover:border-golden-400 transition-all"
                    >
                      -
                    </button>
                    <span className="text-2xl font-bold text-espresso-800 w-10 text-center">{children}</span>
                    <button
                      onClick={() => setChildren(Math.min(10, children + 1))}
                      className="w-10 h-10 rounded-xl border-2 border-oatmeal-200 flex items-center justify-center text-lg font-bold text-cocoa-500 hover:border-golden-400 transition-all"
                    >
                      +
                    </button>
                    <span className="text-xs text-cocoa-400">명</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 결과 패널 */}
          <div className="lg:col-span-3 space-y-6">

            {/* 핵심 결과 */}
            <div className="bg-gradient-to-br from-espresso-800 to-espresso-950 rounded-2xl p-6 text-white shadow-xl">
              <h3 className="text-sm font-medium text-golden-200 mb-4 tracking-wider uppercase">
                월 실수령액
              </h3>
              <div className="text-4xl md:text-5xl font-bold mb-2 text-golden-100">
                {formatWon(result.monthlyNet)}
              </div>
              <p className="text-oatmeal-300 text-sm mb-6">
                연 실수령액 {formatKRW(result.annualNet)}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <p className="text-xs text-oatmeal-300 mb-1">월 세전 급여</p>
                  <p className="text-base sm:text-lg font-bold">{formatWon(result.monthlyGross)}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <p className="text-xs text-golden-200 mb-1">월 공제 합계</p>
                  <p className="text-base sm:text-lg font-bold text-golden-100">{formatWon(result.totalDeduction)}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <p className="text-xs text-oatmeal-300 mb-1">공제율</p>
                  <p className="text-base sm:text-lg font-bold">{deductionRate}%</p>
                </div>
              </div>
            </div>

            {/* 실수령 vs 공제 비율 */}
            <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-6">
              <h3 className="text-sm font-semibold text-espresso-700 mb-4">실수령 vs 공제 비율</h3>
              <div className="w-full h-8 rounded-full overflow-hidden flex bg-oatmeal-100">
                {result.monthlyGross > 0 && (
                  <>
                    <div
                      className="bg-gradient-to-r from-golden-400 to-golden-500 h-full transition-all duration-700 ease-out flex items-center justify-center"
                      style={{ width: `${(result.monthlyNet / result.monthlyGross) * 100}%` }}
                    >
                      {(result.monthlyNet / result.monthlyGross) * 100 > 20 && (
                        <span className="text-xs text-white font-medium">
                          {((result.monthlyNet / result.monthlyGross) * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                    <div
                      className="bg-cocoa-400 h-full transition-all duration-700 ease-out flex items-center justify-center"
                      style={{ width: `${(result.totalDeduction / result.monthlyGross) * 100}%` }}
                    >
                      {(result.totalDeduction / result.monthlyGross) * 100 > 10 && (
                        <span className="text-xs text-white font-medium">
                          {((result.totalDeduction / result.monthlyGross) * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
              <div className="flex justify-between mt-3 text-xs text-cocoa-500">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-golden-400"></div>
                  <span>실수령액</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cocoa-400"></div>
                  <span>공제 합계</span>
                </div>
              </div>
            </div>

            {/* 공제 항목 상세 */}
            <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-6">
              <h3 className="text-sm font-semibold text-espresso-700 mb-4">공제 항목 상세 (월 기준)</h3>

              {/* 4대 보험 */}
              <div className="mb-6">
                <h4 className="text-xs font-bold text-cocoa-400 uppercase tracking-wider mb-3">4대 보험</h4>
                <div className="space-y-3">
                  {result.deductions.slice(0, 4).map((d) => (
                    <div key={d.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-cocoa-300"></div>
                        <span className="text-sm text-espresso-700">{d.label}</span>
                        {d.rate && <span className="text-xs text-cocoa-400">({d.rate})</span>}
                      </div>
                      <span className="text-sm font-semibold text-espresso-800">{formatWon(d.amount)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2 border-t border-oatmeal-100">
                    <span className="text-sm font-semibold text-cocoa-600">4대 보험 소계</span>
                    <span className="text-sm font-bold text-espresso-800">
                      {formatWon(result.deductions.slice(0, 4).reduce((s, d) => s + d.amount, 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* 세금 */}
              <div className="mb-6">
                <h4 className="text-xs font-bold text-cocoa-400 uppercase tracking-wider mb-3">세금</h4>
                <div className="space-y-3">
                  {result.deductions.slice(4).map((d) => (
                    <div key={d.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-golden-400"></div>
                        <span className="text-sm text-espresso-700">{d.label}</span>
                        {d.rate && <span className="text-xs text-cocoa-400">({d.rate})</span>}
                      </div>
                      <span className="text-sm font-semibold text-espresso-800">{formatWon(d.amount)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2 border-t border-oatmeal-100">
                    <span className="text-sm font-semibold text-cocoa-600">세금 소계</span>
                    <span className="text-sm font-bold text-espresso-800">
                      {formatWon(result.deductions.slice(4).reduce((s, d) => s + d.amount, 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* 총 공제 합계 */}
              <div className="bg-oatmeal-50 rounded-xl p-4 flex items-center justify-between">
                <span className="font-bold text-espresso-800">월 공제 합계</span>
                <span className="text-lg font-bold text-espresso-900">{formatWon(result.totalDeduction)}</span>
              </div>
            </div>

            {/* 공제 항목 비율 바 */}
            <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-6">
              <h3 className="text-sm font-semibold text-espresso-700 mb-4">공제 항목별 비율</h3>
              <div className="space-y-3">
                {result.deductions.map((d) => {
                  const pct = result.totalDeduction > 0 ? (d.amount / result.totalDeduction) * 100 : 0;
                  return (
                    <div key={d.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-cocoa-600">{d.label}</span>
                        <span className="font-medium text-espresso-700">{formatWon(d.amount)} ({pct.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-oatmeal-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cocoa-300 to-cocoa-400 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 연봉 구간별 비교 테이블 */}
            <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-6">
              <h3 className="text-sm font-semibold text-espresso-700 mb-4">연봉 구간별 실수령액 비교</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-oatmeal-200">
                      <th className="text-left py-3 px-2 text-cocoa-500 font-semibold">연봉</th>
                      <th className="text-right py-3 px-2 text-cocoa-500 font-semibold">월 세전</th>
                      <th className="text-right py-3 px-2 text-cocoa-500 font-semibold">월 공제</th>
                      <th className="text-right py-3 px-2 text-cocoa-500 font-semibold">월 실수령</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[3000, 4000, 5000, 6000, 7000, 8000, 10000].map((sal) => {
                      const a = sal * 10000;
                      const mGross = a / 12;
                      const mntNT = (parseFloat(nonTaxable) || 0) * 10000;
                      const aTaxable = Math.max(a - mntNT * 12, 0);
                      const mTaxable = aTaxable / 12;

                      const pBase = Math.min(mTaxable, 5900000);
                      const p = Math.floor(pBase * 0.045);
                      const h = Math.floor(mTaxable * 0.03545);
                      const ltc = Math.floor(h * 0.1281);
                      const emp = Math.floor(mTaxable * 0.009);

                      let eid = 0;
                      if (aTaxable <= 5000000) eid = aTaxable * 0.7;
                      else if (aTaxable <= 15000000) eid = 3500000 + (aTaxable - 5000000) * 0.4;
                      else if (aTaxable <= 45000000) eid = 7500000 + (aTaxable - 15000000) * 0.15;
                      else if (aTaxable <= 100000000) eid = 12000000 + (aTaxable - 45000000) * 0.05;
                      else eid = 14750000 + (aTaxable - 100000000) * 0.02;

                      const ei = aTaxable - eid;
                      const pd = dependents * 1500000;
                      const pDed = p * 12;
                      const sDed = (h + ltc + emp) * 12;
                      const tb = Math.max(ei - pd - pDed - sDed, 0);

                      let at = 0;
                      if (tb <= 14000000) at = tb * 0.06;
                      else if (tb <= 50000000) at = 840000 + (tb - 14000000) * 0.15;
                      else if (tb <= 88000000) at = 6240000 + (tb - 50000000) * 0.24;
                      else if (tb <= 150000000) at = 15360000 + (tb - 88000000) * 0.35;
                      else at = 37060000 + (tb - 150000000) * 0.38;

                      let tc = at <= 1300000 ? at * 0.55 : 715000 + (at - 1300000) * 0.3;
                      if (aTaxable <= 33000000) tc = Math.min(tc, 740000);
                      else if (aTaxable <= 70000000) { tc = Math.min(tc, 740000 - (aTaxable - 33000000) * 0.008); tc = Math.max(tc, 660000); }
                      else { tc = Math.min(tc, 660000 - (aTaxable - 70000000) * 0.5); tc = Math.max(tc, 500000); }

                      let ctc = 0;
                      if (children === 1) ctc = 150000;
                      else if (children === 2) ctc = 300000;
                      else if (children >= 3) ctc = 300000 + (children - 2) * 300000;

                      const mIT = Math.floor(Math.max(at - tc - ctc, 0) / 12);
                      const lt = Math.floor(mIT * 0.1);
                      const totalDed = p + h + ltc + emp + mIT + lt;
                      const mNet = mGross - totalDed;

                      const isCurrent = annualSalary === sal.toString();

                      return (
                        <tr
                          key={sal}
                          className={`border-b border-oatmeal-100 transition-colors ${
                            isCurrent ? 'bg-golden-50 font-bold' : 'hover:bg-cream-50'
                          }`}
                        >
                          <td className="py-2.5 px-2 text-espresso-700">{formatKRW(a)}</td>
                          <td className="py-2.5 px-2 text-right text-cocoa-600">{formatWon(mGross)}</td>
                          <td className="py-2.5 px-2 text-right text-golden-600">{formatWon(totalDed)}</td>
                          <td className="py-2.5 px-2 text-right text-espresso-800 font-bold">{formatWon(mNet)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tip */}
            <div className="bg-gradient-to-br from-golden-50 to-cream-100 rounded-2xl border border-golden-200 p-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-golden-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-espresso-800 mb-2">💡 연봉 실수령 팁</h4>
                  <ul className="text-sm text-cocoa-600 space-y-1.5">
                    <li>• <strong>비과세 항목</strong> (식대, 차량유지비 등)이 많을수록 실수령액이 늘어납니다.</li>
                    <li>• <strong>부양가족</strong>이 많으면 인적공제로 소득세가 줄어듭니다.</li>
                    <li>• 연말정산 시 추가 공제(의료비, 교육비, 기부금 등)로 환급받을 수 있습니다.</li>
                    <li>• 본 계산기는 <strong>간이세액</strong> 기준 근사치이며, 실제 금액과 차이가 있을 수 있습니다.</li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryCalculator;
