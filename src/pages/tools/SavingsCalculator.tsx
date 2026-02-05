import React, { useState, useMemo } from 'react';
import { PiggyBank, DollarSign, Percent, Calendar, Info, RotateCcw } from 'lucide-react';

type ProductType = 'deposit' | 'savings';
type InterestType = 'simple' | 'compound';
type TaxType = 'normal' | 'preferential' | 'exempt';

const SavingsCalculator: React.FC = () => {
  const [productType, setProductType] = useState<ProductType>('savings');
  const [amount, setAmount] = useState<string>('50'); // 만원 (적금: 월납입, 예금: 원금)
  const [rate, setRate] = useState<string>('3.5');
  const [months, setMonths] = useState<string>('12');
  const [interestType, setInterestType] = useState<InterestType>('simple');
  const [taxType, setTaxType] = useState<TaxType>('normal');

  const taxRates: Record<TaxType, { label: string; rate: number }> = {
    normal: { label: '일반과세 (15.4%)', rate: 0.154 },
    preferential: { label: '세금우대 (9.5%)', rate: 0.095 },
    exempt: { label: '비과세 (0%)', rate: 0 },
  };

  const result = useMemo(() => {
    const principal = (parseFloat(amount) || 0) * 10000;
    const annualRate = (parseFloat(rate) || 0) / 100;
    const monthlyRate = annualRate / 12;
    const m = parseInt(months) || 0;
    const taxRate = taxRates[taxType].rate;

    if (principal <= 0 || annualRate <= 0 || m <= 0) {
      return { totalPrincipal: 0, grossInterest: 0, tax: 0, netInterest: 0, maturityAmount: 0, monthlyData: [] };
    }

    let totalPrincipal = 0;
    let grossInterest = 0;
    const monthlyData: { month: number; cumPrincipal: number; cumInterest: number; balance: number }[] = [];

    if (productType === 'deposit') {
      // 예금: 목돈 일시 예치
      totalPrincipal = principal;

      if (interestType === 'simple') {
        // 단리: 이자 = 원금 × 연이율 × (개월/12)
        grossInterest = principal * annualRate * (m / 12);
        for (let i = 1; i <= m; i++) {
          const cumInt = principal * annualRate * (i / 12);
          monthlyData.push({
            month: i,
            cumPrincipal: principal,
            cumInterest: cumInt,
            balance: principal + cumInt,
          });
        }
      } else {
        // 복리: 매월 복리
        let balance = principal;
        for (let i = 1; i <= m; i++) {
          balance = balance * (1 + monthlyRate);
          monthlyData.push({
            month: i,
            cumPrincipal: principal,
            cumInterest: balance - principal,
            balance,
          });
        }
        grossInterest = balance - principal;
      }
    } else {
      // 적금: 매월 납입
      totalPrincipal = principal * m;

      if (interestType === 'simple') {
        // 단리 적금: 각 회차 이자 = 납입금 × 연이율 × 잔여개월/12
        let cumInt = 0;
        for (let i = 1; i <= m; i++) {
          // i번째 달 납입 → 만기까지 (m - i) 개월 남음...
          // 실제 적금 단리: 각 납입분에 대해 남은 기간만큼 이자 적용
          // 누적 이자 = Σ(납입금 × 연이율 × (m - i + 1) / 12) for i=1..currentMonth
          // 하지만 월별 누적을 보여주려면:
          const monthInterest = principal * annualRate * ((m - i + 1) / 12);
          cumInt += monthInterest; // 이건 총 이자 기여분
        }
        // 위 로직은 총 이자 계산용이고, 월별 누적은 다시 계산
        grossInterest = 0;
        for (let i = 1; i <= m; i++) {
          grossInterest += principal * annualRate * ((m - i + 1) / 12);
        }

        // 월별 데이터: 각 월까지 납입된 원금과 누적 이자(만기 시점 기준 기여분)
        let runningInterest = 0;
        for (let i = 1; i <= m; i++) {
          runningInterest += principal * annualRate * ((m - i + 1) / 12);
          monthlyData.push({
            month: i,
            cumPrincipal: principal * i,
            cumInterest: runningInterest,
            balance: principal * i + runningInterest,
          });
        }
      } else {
        // 복리 적금: 매월 납입, 매월 복리
        let balance = 0;
        for (let i = 1; i <= m; i++) {
          balance = (balance + principal) * (1 + monthlyRate);
          monthlyData.push({
            month: i,
            cumPrincipal: principal * i,
            cumInterest: balance - principal * i,
            balance,
          });
        }
        grossInterest = balance - totalPrincipal;
      }
    }

    const tax = Math.floor(grossInterest * taxRate);
    const netInterest = grossInterest - tax;
    const maturityAmount = totalPrincipal + netInterest;

    return { totalPrincipal, grossInterest, tax, netInterest, maturityAmount, monthlyData };
  }, [amount, rate, months, productType, interestType, taxType]);

  const formatKRW = (v: number): string => {
    if (v >= 100000000) {
      const eok = Math.floor(v / 100000000);
      const man = Math.floor((v % 100000000) / 10000);
      return man > 0 ? `${eok}억 ${man.toLocaleString()}만원` : `${eok}억원`;
    } else if (v >= 10000) {
      return `${Math.floor(v / 10000).toLocaleString()}만원`;
    }
    return `${Math.floor(v).toLocaleString()}원`;
  };

  const formatWon = (v: number): string => `${Math.floor(v).toLocaleString()}원`;

  const handleReset = () => {
    setProductType('savings');
    setAmount('50');
    setRate('3.5');
    setMonths('12');
    setInterestType('simple');
    setTaxType('normal');
  };

  // 6개월 간격 요약
  const summaryData = useMemo(() => {
    const m = parseInt(months) || 0;
    if (m <= 12) return result.monthlyData;
    const interval = m <= 24 ? 3 : 6;
    return result.monthlyData.filter((d) => d.month % interval === 0 || d.month === m);
  }, [result.monthlyData, months]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-golden-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-espresso-800 to-espresso-950 text-white py-16 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-golden-100 rounded-2xl flex items-center justify-center">
              <PiggyBank className="w-6 h-6 text-espresso-800" />
            </div>
            <span className="text-golden-200 text-sm font-medium tracking-wider uppercase">부자타임 도구</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">적금·예금 이자 계산기</h1>
          <p className="text-oatmeal-300 text-lg max-w-2xl">
            적금과 예금의 만기 수령액, 세후 이자를 한눈에 비교해보세요.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-6 py-10">
        <div className="grid lg:grid-cols-5 gap-8">

          {/* 입력 패널 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-espresso-800">조건 입력</h2>
                <button
                  onClick={handleReset}
                  className="text-cocoa-500 hover:text-cocoa-700 transition-colors p-1.5 rounded-lg hover:bg-oatmeal-100"
                  title="초기화"
                >
                  <RotateCcw size={18} />
                </button>
              </div>

              <div className="space-y-5">
                {/* 상품 유형 */}
                <div>
                  <label className="text-sm font-semibold text-espresso-700 mb-3 block">상품 유형</label>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { key: 'savings' as ProductType, label: '적금', desc: '매월 납입' },
                      { key: 'deposit' as ProductType, label: '예금', desc: '일시 예치' },
                    ]).map((p) => (
                      <button
                        key={p.key}
                        onClick={() => {
                          setProductType(p.key);
                          if (p.key === 'deposit' && parseFloat(amount) < 100) setAmount('1000');
                          if (p.key === 'savings' && parseFloat(amount) > 500) setAmount('50');
                        }}
                        className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all border-2 ${
                          productType === p.key
                            ? 'border-golden-400 bg-golden-50 text-espresso-800'
                            : 'border-oatmeal-200 text-cocoa-500 hover:border-oatmeal-300'
                        }`}
                      >
                        <div className="font-bold">{p.label}</div>
                        <div className="text-xs mt-0.5 opacity-70">{p.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 금액 */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-espresso-700 mb-2">
                    <DollarSign size={16} className="text-golden-500" />
                    {productType === 'savings' ? '월 납입금' : '예치 금액'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border-2 border-oatmeal-200 rounded-xl focus:border-golden-400 focus:ring-2 focus:ring-golden-100 outline-none transition-all text-lg font-medium text-espresso-800"
                      min="0"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-cocoa-400 font-medium">만원</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(productType === 'savings'
                      ? [10, 30, 50, 100]
                      : [500, 1000, 3000, 5000]
                    ).map((v) => (
                      <button
                        key={v}
                        onClick={() => setAmount(v.toString())}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          amount === v.toString()
                            ? 'bg-golden-100 text-espresso-800 border border-golden-300'
                            : 'bg-oatmeal-100 text-cocoa-500 hover:bg-oatmeal-200 border border-transparent'
                        }`}
                      >
                        {v}만원
                      </button>
                    ))}
                  </div>
                </div>

                {/* 금리 */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-espresso-700 mb-2">
                    <Percent size={16} className="text-golden-500" />
                    연 이자율
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                      className="w-full px-4 py-3 pr-8 border-2 border-oatmeal-200 rounded-xl focus:border-golden-400 focus:ring-2 focus:ring-golden-100 outline-none transition-all text-lg font-medium text-espresso-800"
                      min="0"
                      max="20"
                      step="0.1"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-cocoa-400 font-medium">%</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {[2, 3, 3.5, 4, 5].map((r) => (
                      <button
                        key={r}
                        onClick={() => setRate(r.toString())}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          rate === r.toString()
                            ? 'bg-golden-100 text-espresso-800 border border-golden-300'
                            : 'bg-oatmeal-100 text-cocoa-500 hover:bg-oatmeal-200 border border-transparent'
                        }`}
                      >
                        {r}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* 기간 */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-espresso-700 mb-2">
                    <Calendar size={16} className="text-golden-500" />
                    가입 기간
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={months}
                      onChange={(e) => setMonths(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border-2 border-oatmeal-200 rounded-xl focus:border-golden-400 focus:ring-2 focus:ring-golden-100 outline-none transition-all text-lg font-medium text-espresso-800"
                      min="1"
                      max="120"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-cocoa-400 font-medium">개월</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {[6, 12, 24, 36].map((m) => (
                      <button
                        key={m}
                        onClick={() => setMonths(m.toString())}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          months === m.toString()
                            ? 'bg-golden-100 text-espresso-800 border border-golden-300'
                            : 'bg-oatmeal-100 text-cocoa-500 hover:bg-oatmeal-200 border border-transparent'
                        }`}
                      >
                        {m}개월
                      </button>
                    ))}
                  </div>
                </div>

                {/* 이자 방식 */}
                <div>
                  <label className="text-sm font-semibold text-espresso-700 mb-3 block">이자 방식</label>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { key: 'simple' as InterestType, label: '단리' },
                      { key: 'compound' as InterestType, label: '월복리' },
                    ]).map((t) => (
                      <button
                        key={t.key}
                        onClick={() => setInterestType(t.key)}
                        className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border-2 ${
                          interestType === t.key
                            ? 'border-golden-400 bg-golden-50 text-espresso-800'
                            : 'border-oatmeal-200 text-cocoa-500 hover:border-oatmeal-300'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 과세 방식 */}
                <div>
                  <label className="text-sm font-semibold text-espresso-700 mb-3 block">이자 과세</label>
                  <div className="space-y-2">
                    {(Object.keys(taxRates) as TaxType[]).map((key) => (
                      <button
                        key={key}
                        onClick={() => setTaxType(key)}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all border-2 ${
                          taxType === key
                            ? 'border-golden-400 bg-golden-50 text-espresso-800'
                            : 'border-oatmeal-200 text-cocoa-500 hover:border-oatmeal-300'
                        }`}
                      >
                        {taxRates[key].label}
                      </button>
                    ))}
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
                만기 수령액 (세후)
              </h3>
              <div className="text-4xl md:text-5xl font-bold mb-2 text-golden-100">
                {formatWon(result.maturityAmount)}
              </div>
              <p className="text-oatmeal-300 text-sm mb-6">
                {productType === 'savings' ? '적금' : '예금'} · {interestType === 'simple' ? '단리' : '월복리'} · {taxRates[taxType].label}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white/10 rounded-xl p-3 sm:p-4 backdrop-blur-sm">
                  <p className="text-xs text-oatmeal-300 mb-1">총 원금</p>
                  <p className="text-sm sm:text-base font-bold">{formatKRW(result.totalPrincipal)}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 sm:p-4 backdrop-blur-sm">
                  <p className="text-xs text-golden-200 mb-1">세전 이자</p>
                  <p className="text-sm sm:text-base font-bold text-golden-100">{formatWon(result.grossInterest)}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 sm:p-4 backdrop-blur-sm">
                  <p className="text-xs text-oatmeal-300 mb-1">이자 과세</p>
                  <p className="text-sm sm:text-base font-bold">{formatWon(result.tax)}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 sm:p-4 backdrop-blur-sm">
                  <p className="text-xs text-golden-200 mb-1">세후 이자</p>
                  <p className="text-sm sm:text-base font-bold text-golden-100">{formatWon(result.netInterest)}</p>
                </div>
              </div>
            </div>

            {/* 원금 vs 이자 비율 */}
            <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-6">
              <h3 className="text-sm font-semibold text-espresso-700 mb-4">원금 vs 세후 이자</h3>
              <div className="w-full h-8 rounded-full overflow-hidden flex bg-oatmeal-100">
                {result.maturityAmount > 0 && (
                  <>
                    <div
                      className="bg-cocoa-400 h-full transition-all duration-700 ease-out flex items-center justify-center"
                      style={{ width: `${(result.totalPrincipal / result.maturityAmount) * 100}%` }}
                    >
                      {(result.totalPrincipal / result.maturityAmount) * 100 > 15 && (
                        <span className="text-xs text-white font-medium">
                          원금 {((result.totalPrincipal / result.maturityAmount) * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                    <div
                      className="bg-gradient-to-r from-golden-400 to-golden-500 h-full transition-all duration-700 ease-out flex items-center justify-center"
                      style={{ width: `${(result.netInterest / result.maturityAmount) * 100}%` }}
                    >
                      {(result.netInterest / result.maturityAmount) * 100 > 5 && (
                        <span className="text-xs text-white font-medium">
                          이자 {((result.netInterest / result.maturityAmount) * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
              <div className="flex justify-between mt-3 text-xs text-cocoa-500">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cocoa-400"></div>
                  <span>원금</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-golden-400"></div>
                  <span>세후 이자</span>
                </div>
              </div>
            </div>

            {/* 월별 성장 차트 */}
            <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-6">
              <h3 className="text-sm font-semibold text-espresso-700 mb-4">월별 잔액 추이</h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {(() => {
                  const maxBal = result.monthlyData.length > 0
                    ? result.monthlyData[result.monthlyData.length - 1].balance
                    : 1;
                  return summaryData.map((d) => {
                    const principalW = (d.cumPrincipal / maxBal) * 100;
                    const interestW = (d.cumInterest / maxBal) * 100;
                    return (
                      <div key={d.month} className="flex items-center gap-3 group">
                        <span className="text-xs text-cocoa-400 w-10 text-right font-mono shrink-0">
                          {d.month}개월
                        </span>
                        <div className="flex-1 h-6 rounded-md overflow-hidden flex bg-oatmeal-50">
                          <div
                            className="bg-cocoa-300 h-full transition-all duration-500"
                            style={{ width: `${principalW}%` }}
                          />
                          <div
                            className="bg-golden-400 h-full transition-all duration-500"
                            style={{ width: `${interestW}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-espresso-700 w-20 text-right shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          {formatKRW(d.balance)}
                        </span>
                      </div>
                    );
                  });
                })()}
              </div>
              <div className="flex gap-4 mt-3 text-xs text-cocoa-500">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cocoa-300"></div>
                  <span>원금</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-golden-400"></div>
                  <span>이자</span>
                </div>
              </div>
            </div>

            {/* 상세 테이블 */}
            <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-6">
              <h3 className="text-sm font-semibold text-espresso-700 mb-4">월별 상세 내역</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-oatmeal-200">
                      <th className="text-left py-3 px-2 text-cocoa-500 font-semibold">개월</th>
                      <th className="text-right py-3 px-2 text-cocoa-500 font-semibold">누적 원금</th>
                      <th className="text-right py-3 px-2 text-cocoa-500 font-semibold">누적 이자</th>
                      <th className="text-right py-3 px-2 text-cocoa-500 font-semibold">잔액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryData.map((d) => (
                      <tr key={d.month} className="border-b border-oatmeal-100 hover:bg-cream-50 transition-colors">
                        <td className="py-2.5 px-2 text-espresso-700 font-medium">{d.month}개월</td>
                        <td className="py-2.5 px-2 text-right text-cocoa-600">{formatWon(d.cumPrincipal)}</td>
                        <td className="py-2.5 px-2 text-right text-golden-600 font-medium">{formatWon(d.cumInterest)}</td>
                        <td className="py-2.5 px-2 text-right text-espresso-800 font-bold">{formatWon(d.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 과세 방식 비교 */}
            <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-6">
              <h3 className="text-sm font-semibold text-espresso-700 mb-4">과세 방식별 만기 수령액 비교</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-oatmeal-200">
                      <th className="text-left py-3 px-2 text-cocoa-500 font-semibold">과세 방식</th>
                      <th className="text-right py-3 px-2 text-cocoa-500 font-semibold">세금</th>
                      <th className="text-right py-3 px-2 text-cocoa-500 font-semibold">세후 이자</th>
                      <th className="text-right py-3 px-2 text-cocoa-500 font-semibold">만기 수령액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Object.keys(taxRates) as TaxType[]).map((key) => {
                      const t = Math.floor(result.grossInterest * taxRates[key].rate);
                      const ni = result.grossInterest - t;
                      const ma = result.totalPrincipal + ni;
                      const isCurrent = taxType === key;
                      return (
                        <tr
                          key={key}
                          className={`border-b border-oatmeal-100 transition-colors ${
                            isCurrent ? 'bg-golden-50 font-bold' : 'hover:bg-cream-50'
                          }`}
                        >
                          <td className="py-2.5 px-2 text-espresso-700">{taxRates[key].label}</td>
                          <td className="py-2.5 px-2 text-right text-cocoa-600">{formatWon(t)}</td>
                          <td className="py-2.5 px-2 text-right text-golden-600">{formatWon(ni)}</td>
                          <td className="py-2.5 px-2 text-right text-espresso-800 font-bold">{formatWon(ma)}</td>
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
                  <h4 className="font-bold text-espresso-800 mb-2">💡 적금·예금 팁</h4>
                  <ul className="text-sm text-cocoa-600 space-y-1.5">
                    <li>• <strong>적금</strong>은 매월 일정 금액을 납입하고, <strong>예금</strong>은 목돈을 한 번에 예치합니다.</li>
                    <li>• 같은 금리라면 <strong>예금</strong>이 더 많은 이자를 받습니다 (원금 전체가 처음부터 이자 적용).</li>
                    <li>• <strong>비과세</strong> 상품은 만 65세 이상, 장애인 등 조건이 있으니 확인하세요.</li>
                    <li>• <strong>세금우대</strong>는 조합(농협, 신협 등) 예탁금에서 1인당 3천만원까지 가능합니다.</li>
                    <li>• 복리 적금은 시중에 많지 않지만, 있다면 <strong>장기일수록 유리</strong>합니다.</li>
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

export default SavingsCalculator;
