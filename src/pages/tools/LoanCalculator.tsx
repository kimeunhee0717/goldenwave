import React, { useState, useMemo } from 'react';
import { Landmark, DollarSign, Percent, Calendar, Info, RotateCcw } from 'lucide-react';

type RepaymentMethod = 'equal-principal-interest' | 'equal-principal' | 'bullet';

interface MonthlyData {
  month: number;
  payment: number;
  principalPay: number;
  interestPay: number;
  remainingBalance: number;
}

const LoanCalculator: React.FC = () => {
  const [loanAmount, setLoanAmount] = useState<string>('30000'); // 만원
  const [rate, setRate] = useState<string>('4.5'); // 연이율 %
  const [termYears, setTermYears] = useState<string>('30'); // 기간 (년)
  const [method, setMethod] = useState<RepaymentMethod>('equal-principal-interest');

  const result = useMemo(() => {
    const P = (parseFloat(loanAmount) || 0) * 10000;
    const annualRate = (parseFloat(rate) || 0) / 100;
    const monthlyRate = annualRate / 12;
    const totalMonths = (parseInt(termYears) || 0) * 12;

    if (P <= 0 || annualRate <= 0 || totalMonths <= 0) {
      return { totalPayment: 0, totalInterest: 0, monthlyFirst: 0, monthlyData: [] };
    }

    const monthlyData: MonthlyData[] = [];
    let totalPayment = 0;
    let totalInterest = 0;
    let remaining = P;

    if (method === 'equal-principal-interest') {
      // 원리금균등상환
      const monthlyPay = P * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1);

      for (let m = 1; m <= totalMonths; m++) {
        const interestPay = remaining * monthlyRate;
        const principalPay = monthlyPay - interestPay;
        remaining -= principalPay;
        totalPayment += monthlyPay;
        totalInterest += interestPay;

        monthlyData.push({
          month: m,
          payment: monthlyPay,
          principalPay,
          interestPay,
          remainingBalance: Math.max(remaining, 0),
        });
      }
    } else if (method === 'equal-principal') {
      // 원금균등상환
      const monthlyPrincipal = P / totalMonths;

      for (let m = 1; m <= totalMonths; m++) {
        const interestPay = remaining * monthlyRate;
        const payment = monthlyPrincipal + interestPay;
        remaining -= monthlyPrincipal;
        totalPayment += payment;
        totalInterest += interestPay;

        monthlyData.push({
          month: m,
          payment,
          principalPay: monthlyPrincipal,
          interestPay,
          remainingBalance: Math.max(remaining, 0),
        });
      }
    } else {
      // 만기일시상환
      for (let m = 1; m <= totalMonths; m++) {
        const interestPay = P * monthlyRate;
        const isLast = m === totalMonths;
        const principalPay = isLast ? P : 0;
        const payment = interestPay + principalPay;
        remaining = isLast ? 0 : P;
        totalPayment += payment;
        totalInterest += interestPay;

        monthlyData.push({
          month: m,
          payment,
          principalPay,
          interestPay,
          remainingBalance: remaining,
        });
      }
    }

    return {
      totalPayment,
      totalInterest,
      monthlyFirst: monthlyData.length > 0 ? monthlyData[0].payment : 0,
      monthlyData,
    };
  }, [loanAmount, rate, termYears, method]);

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

  const handleReset = () => {
    setLoanAmount('30000');
    setRate('4.5');
    setTermYears('30');
    setMethod('equal-principal-interest');
  };

  const methodLabels: Record<RepaymentMethod, string> = {
    'equal-principal-interest': '원리금균등상환',
    'equal-principal': '원금균등상환',
    'bullet': '만기일시상환',
  };

  // 연도별 요약 (12개월씩 묶기)
  const yearlyData = useMemo(() => {
    const years: { year: number; payment: number; principal: number; interest: number; remaining: number }[] = [];
    const totalYears = parseInt(termYears) || 0;

    for (let y = 0; y < totalYears; y++) {
      const start = y * 12;
      const end = start + 12;
      const slice = result.monthlyData.slice(start, end);
      if (slice.length === 0) break;

      years.push({
        year: y + 1,
        payment: slice.reduce((s, d) => s + d.payment, 0),
        principal: slice.reduce((s, d) => s + d.principalPay, 0),
        interest: slice.reduce((s, d) => s + d.interestPay, 0),
        remaining: slice[slice.length - 1].remainingBalance,
      });
    }
    return years;
  }, [result.monthlyData, termYears]);

  const loanP = (parseFloat(loanAmount) || 0) * 10000;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-golden-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-espresso-800 to-espresso-950 text-white py-16 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-golden-100 rounded-2xl flex items-center justify-center">
              <Landmark className="w-6 h-6 text-espresso-800" />
            </div>
            <span className="text-golden-200 text-sm font-medium tracking-wider uppercase">부자타임 도구</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">대출 이자 계산기</h1>
          <p className="text-oatmeal-300 text-lg max-w-2xl">
            대출 금액, 금리, 상환 방식에 따른 월 상환금과 총 이자를 한눈에 비교하세요.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-6 py-10">
        <div className="grid lg:grid-cols-5 gap-8">

          {/* 입력 패널 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-espresso-800">대출 조건 입력</h2>
                <button
                  onClick={handleReset}
                  className="text-cocoa-500 hover:text-cocoa-700 transition-colors p-1.5 rounded-lg hover:bg-oatmeal-100"
                  title="초기화"
                >
                  <RotateCcw size={18} />
                </button>
              </div>

              <div className="space-y-5">
                {/* 대출 금액 */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-espresso-700 mb-2">
                    <DollarSign size={16} className="text-golden-500" />
                    대출 금액
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border-2 border-oatmeal-200 rounded-xl focus:border-golden-400 focus:ring-2 focus:ring-golden-100 outline-none transition-all text-lg font-medium text-espresso-800"
                      placeholder="30000"
                      min="0"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-cocoa-400 font-medium">만원</span>
                  </div>
                  {parseFloat(loanAmount) > 0 && (
                    <p className="text-xs text-cocoa-400 mt-1 ml-1">= {formatKRW((parseFloat(loanAmount) || 0) * 10000)}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {[10000, 20000, 30000, 50000].map((v) => (
                      <button
                        key={v}
                        onClick={() => setLoanAmount(v.toString())}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          loanAmount === v.toString()
                            ? 'bg-golden-100 text-espresso-800 border border-golden-300'
                            : 'bg-oatmeal-100 text-cocoa-500 hover:bg-oatmeal-200 border border-transparent'
                        }`}
                      >
                        {formatKRW(v * 10000)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 연 이자율 */}
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
                      placeholder="4.5"
                      min="0"
                      max="30"
                      step="0.1"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-cocoa-400 font-medium">%</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {[3, 3.5, 4, 4.5, 5, 6].map((r) => (
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

                {/* 대출 기간 */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-espresso-700 mb-2">
                    <Calendar size={16} className="text-golden-500" />
                    대출 기간
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={termYears}
                      onChange={(e) => setTermYears(e.target.value)}
                      className="w-full px-4 py-3 pr-8 border-2 border-oatmeal-200 rounded-xl focus:border-golden-400 focus:ring-2 focus:ring-golden-100 outline-none transition-all text-lg font-medium text-espresso-800"
                      placeholder="30"
                      min="1"
                      max="40"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-cocoa-400 font-medium">년</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[10, 15, 20, 30].map((y) => (
                      <button
                        key={y}
                        onClick={() => setTermYears(y.toString())}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          termYears === y.toString()
                            ? 'bg-golden-100 text-espresso-800 border border-golden-300'
                            : 'bg-oatmeal-100 text-cocoa-500 hover:bg-oatmeal-200 border border-transparent'
                        }`}
                      >
                        {y}년
                      </button>
                    ))}
                  </div>
                </div>

                {/* 상환 방식 */}
                <div>
                  <label className="text-sm font-semibold text-espresso-700 mb-3 block">상환 방식</label>
                  <div className="space-y-2">
                    {(Object.keys(methodLabels) as RepaymentMethod[]).map((key) => (
                      <button
                        key={key}
                        onClick={() => setMethod(key)}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all border-2 ${
                          method === key
                            ? 'border-golden-400 bg-golden-50 text-espresso-800'
                            : 'border-oatmeal-200 text-cocoa-500 hover:border-oatmeal-300'
                        }`}
                      >
                        {methodLabels[key]}
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
                대출 상환 요약
              </h3>
              <div className="text-4xl md:text-5xl font-bold mb-2 text-golden-100">
                월 {formatKRW(result.monthlyFirst)}
              </div>
              <p className="text-oatmeal-300 text-sm mb-6">
                {method === 'equal-principal-interest' ? '매월 동일 상환금' : method === 'equal-principal' ? '첫 달 상환금 (매월 감소)' : '매월 이자만 납부'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <p className="text-xs text-oatmeal-300 mb-1">대출 원금</p>
                  <p className="text-base sm:text-lg font-bold">{formatKRW(loanP)}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <p className="text-xs text-golden-200 mb-1">총 이자</p>
                  <p className="text-base sm:text-lg font-bold text-golden-100">{formatKRW(result.totalInterest)}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <p className="text-xs text-oatmeal-300 mb-1">총 상환금</p>
                  <p className="text-base sm:text-lg font-bold">{formatKRW(result.totalPayment)}</p>
                </div>
              </div>
            </div>

            {/* 원금 vs 이자 비율 */}
            <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-6">
              <h3 className="text-sm font-semibold text-espresso-700 mb-4">원금 vs 이자 비율</h3>
              <div className="w-full h-8 rounded-full overflow-hidden flex bg-oatmeal-100">
                {result.totalPayment > 0 && (
                  <>
                    <div
                      className="bg-cocoa-400 h-full transition-all duration-700 ease-out flex items-center justify-center"
                      style={{ width: `${(loanP / result.totalPayment) * 100}%` }}
                    >
                      {(loanP / result.totalPayment) * 100 > 15 && (
                        <span className="text-xs text-white font-medium">
                          {((loanP / result.totalPayment) * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                    <div
                      className="bg-gradient-to-r from-golden-400 to-golden-500 h-full transition-all duration-700 ease-out flex items-center justify-center"
                      style={{ width: `${(result.totalInterest / result.totalPayment) * 100}%` }}
                    >
                      {(result.totalInterest / result.totalPayment) * 100 > 15 && (
                        <span className="text-xs text-white font-medium">
                          {((result.totalInterest / result.totalPayment) * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
              <div className="flex justify-between mt-3 text-xs text-cocoa-500">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cocoa-400"></div>
                  <span>대출 원금</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-golden-400"></div>
                  <span>이자</span>
                </div>
              </div>
            </div>

            {/* 연도별 상환 바 차트 */}
            <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-6">
              <h3 className="text-sm font-semibold text-espresso-700 mb-4">연도별 잔금 추이</h3>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {yearlyData.map((data) => {
                  const remainPct = loanP > 0 ? (data.remaining / loanP) * 100 : 0;
                  return (
                    <div key={data.year} className="flex items-center gap-3 group">
                      <span className="text-xs text-cocoa-400 w-8 text-right font-mono shrink-0">
                        {data.year}년
                      </span>
                      <div className="flex-1 h-6 rounded-md overflow-hidden bg-oatmeal-50">
                        <div
                          className="bg-gradient-to-r from-cocoa-300 to-cocoa-400 h-full transition-all duration-500"
                          style={{ width: `${remainPct}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-espresso-700 w-24 text-right shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        {formatKRW(data.remaining)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 연도별 상세 테이블 */}
            <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-6">
              <h3 className="text-sm font-semibold text-espresso-700 mb-4">연도별 상세 내역</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-oatmeal-200">
                      <th className="text-left py-3 px-2 text-cocoa-500 font-semibold">연도</th>
                      <th className="text-right py-3 px-2 text-cocoa-500 font-semibold">연 상환금</th>
                      <th className="text-right py-3 px-2 text-cocoa-500 font-semibold">원금 상환</th>
                      <th className="text-right py-3 px-2 text-cocoa-500 font-semibold">이자</th>
                      <th className="text-right py-3 px-2 text-cocoa-500 font-semibold">잔금</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearlyData.map((data) => (
                      <tr key={data.year} className="border-b border-oatmeal-100 hover:bg-cream-50 transition-colors">
                        <td className="py-2.5 px-2 text-espresso-700 font-medium">{data.year}년</td>
                        <td className="py-2.5 px-2 text-right text-espresso-800 font-bold">{formatKRW(data.payment)}</td>
                        <td className="py-2.5 px-2 text-right text-cocoa-600">{formatKRW(data.principal)}</td>
                        <td className="py-2.5 px-2 text-right text-golden-600 font-medium">{formatKRW(data.interest)}</td>
                        <td className="py-2.5 px-2 text-right text-cocoa-500">{formatKRW(data.remaining)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tip */}
            <div className="bg-gradient-to-br from-golden-50 to-cream-100 rounded-2xl border border-golden-200 p-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-golden-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-espresso-800 mb-2">💡 대출 상환 팁</h4>
                  <ul className="text-sm text-cocoa-600 space-y-1.5">
                    <li>• <strong>원리금균등상환</strong>은 매월 같은 금액을 내므로 생활비 계획이 쉽습니다.</li>
                    <li>• <strong>원금균등상환</strong>은 총 이자가 적지만, 초반 상환 부담이 큽니다.</li>
                    <li>• <strong>만기일시상환</strong>은 월 부담은 적지만 총 이자가 가장 많습니다.</li>
                    <li>• 여유 자금이 생기면 <strong>중도상환</strong>으로 이자 절감 효과를 누리세요.</li>
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

export default LoanCalculator;
