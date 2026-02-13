import React, { useState, useMemo } from 'react';
import { TrendingUp, DollarSign, Calendar, Percent, Info, RotateCcw } from 'lucide-react';

interface YearlyData {
  year: number;
  totalInvested: number;
  totalInterest: number;
  balance: number;
}

const CompoundInterestCalculator: React.FC = () => {
  const [principal, setPrincipal] = useState<string>('1000'); // 초기 투자금 (만원)
  const [monthly, setMonthly] = useState<string>('50'); // 월 적립금 (만원)
  const [rate, setRate] = useState<string>('7'); // 연 수익률 (%)
  const [years, setYears] = useState<string>('20'); // 투자 기간 (년)
  const [compoundFreq, setCompoundFreq] = useState<number>(12); // 복리 주기 (월)

  const result = useMemo(() => {
    const p = (parseFloat(principal) || 0) * 10000; // 만원 → 원
    const m = (parseFloat(monthly) || 0) * 10000;
    const r = (parseFloat(rate) || 0) / 100;
    const y = parseInt(years) || 0;
    const n = compoundFreq;

    if (y <= 0 || r < 0) return { finalAmount: 0, totalInvested: 0, totalInterest: 0, yearlyData: [] };

    const yearlyData: YearlyData[] = [];
    let balance = p;
    const totalDeposited = p;

    for (let year = 1; year <= y; year++) {
      for (let month = 1; month <= 12; month++) {
        // 월 이자 적용
        balance = balance * (1 + r / n);
        // 월 적립금 추가
        balance += m;
      }

      const invested = p + m * 12 * year;
      yearlyData.push({
        year,
        totalInvested: invested,
        totalInterest: balance - invested,
        balance: balance,
      });
    }

    const totalInvested = p + m * 12 * y;
    const totalInterest = balance - totalInvested;

    return { finalAmount: balance, totalInvested, totalInterest, yearlyData };
  }, [principal, monthly, rate, years, compoundFreq]);

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

  const formatNumber = (val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) return '';
    return num.toLocaleString();
  };

  // 차트용 최대값
  const maxBalance = result.yearlyData.length > 0 
    ? result.yearlyData[result.yearlyData.length - 1].balance 
    : 1;

  const handleReset = () => {
    setPrincipal('1000');
    setMonthly('50');
    setRate('7');
    setYears('20');
    setCompoundFreq(12);
  };

  // 복리 효과 배수
  const multiplier = result.totalInvested > 0 
    ? (result.finalAmount / result.totalInvested).toFixed(1) 
    : '0';

  return (
    <>
      <SEOHead
        title="복리 계산기"
        description="복리 효과를 한눈에 확인하세요. 초기 투자금, 매월 적립액, 수익률을 입력하면 자산 성장 그래프와 연도별 상세 내역을 보여드립니다."
        url="/tools/compound-interest"
      />
      <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-golden-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-espresso-800 to-espresso-950 text-white py-16 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-golden-100 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-espresso-800" />
            </div>
            <span className="text-golden-200 text-sm font-medium tracking-wider uppercase">부자타임 도구</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            복리 계산기
          </h1>
          <p className="text-oatmeal-300 text-lg max-w-2xl">
            아인슈타인이 "인류 최고의 발명"이라 부른 복리의 마법! 
            매달 꾸준히 투자하면 시간이 돈을 불려줍니다.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-6 py-10">
        <div className="grid lg:grid-cols-5 gap-8">
          
          {/* 입력 패널 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-espresso-800">투자 조건 입력</h2>
                <button 
                  onClick={handleReset}
                  className="text-cocoa-500 hover:text-cocoa-700 transition-colors p-1.5 rounded-lg hover:bg-oatmeal-100"
                  title="초기화"
                >
                  <RotateCcw size={18} />
                </button>
              </div>

              <div className="space-y-5">
                {/* 초기 투자금 */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-espresso-700 mb-2">
                    <DollarSign size={16} className="text-golden-500" />
                    초기 투자금
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={principal}
                      onChange={(e) => setPrincipal(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border-2 border-oatmeal-200 rounded-xl focus:border-golden-400 focus:ring-2 focus:ring-golden-100 outline-none transition-all text-lg font-medium text-espresso-800"
                      placeholder="1000"
                      min="0"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-cocoa-400 font-medium">만원</span>
                  </div>
                  {parseFloat(principal) > 0 && (
                    <p className="text-xs text-cocoa-400 mt-1 ml-1">= {formatKRW((parseFloat(principal) || 0) * 10000)}</p>
                  )}
                </div>

                {/* 월 적립금 */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-espresso-700 mb-2">
                    <Calendar size={16} className="text-golden-500" />
                    월 적립금
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={monthly}
                      onChange={(e) => setMonthly(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border-2 border-oatmeal-200 rounded-xl focus:border-golden-400 focus:ring-2 focus:ring-golden-100 outline-none transition-all text-lg font-medium text-espresso-800"
                      placeholder="50"
                      min="0"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-cocoa-400 font-medium">만원</span>
                  </div>
                  {parseFloat(monthly) > 0 && (
                    <p className="text-xs text-cocoa-400 mt-1 ml-1">연 {formatKRW((parseFloat(monthly) || 0) * 12 * 10000)} 적립</p>
                  )}
                </div>

                {/* 연 수익률 */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-espresso-700 mb-2">
                    <Percent size={16} className="text-golden-500" />
                    연 수익률
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                      className="w-full px-4 py-3 pr-8 border-2 border-oatmeal-200 rounded-xl focus:border-golden-400 focus:ring-2 focus:ring-golden-100 outline-none transition-all text-lg font-medium text-espresso-800"
                      placeholder="7"
                      min="0"
                      max="50"
                      step="0.1"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-cocoa-400 font-medium">%</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[3, 5, 7, 10, 15].map((r) => (
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

                {/* 투자 기간 */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-espresso-700 mb-2">
                    <TrendingUp size={16} className="text-golden-500" />
                    투자 기간
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={years}
                      onChange={(e) => setYears(e.target.value)}
                      className="w-full px-4 py-3 pr-8 border-2 border-oatmeal-200 rounded-xl focus:border-golden-400 focus:ring-2 focus:ring-golden-100 outline-none transition-all text-lg font-medium text-espresso-800"
                      placeholder="20"
                      min="1"
                      max="50"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-cocoa-400 font-medium">년</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[5, 10, 20, 30].map((y) => (
                      <button
                        key={y}
                        onClick={() => setYears(y.toString())}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          years === y.toString()
                            ? 'bg-golden-100 text-espresso-800 border border-golden-300'
                            : 'bg-oatmeal-100 text-cocoa-500 hover:bg-oatmeal-200 border border-transparent'
                        }`}
                      >
                        {y}년
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 결과 패널 */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* 핵심 결과 카드 */}
            <div className="bg-gradient-to-br from-espresso-800 to-espresso-950 rounded-2xl p-6 text-white shadow-xl">
              <h3 className="text-sm font-medium text-golden-200 mb-4 tracking-wider uppercase">
                {years}년 후 예상 자산
              </h3>
              <div className="text-4xl md:text-5xl font-bold mb-6 text-golden-100">
                {formatKRW(result.finalAmount)}
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <p className="text-xs text-oatmeal-300 mb-1">총 투자금</p>
                  <p className="text-lg font-bold">{formatKRW(result.totalInvested)}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <p className="text-xs text-golden-200 mb-1">이자 수익</p>
                  <p className="text-lg font-bold text-golden-100">{formatKRW(result.totalInterest)}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <p className="text-xs text-oatmeal-300 mb-1">복리 효과</p>
                  <p className="text-lg font-bold text-golden-100">{multiplier}배</p>
                </div>
              </div>
            </div>

            {/* 비율 바 */}
            <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-6">
              <h3 className="text-sm font-semibold text-espresso-700 mb-4">투자금 vs 이자 수익 비율</h3>
              <div className="w-full h-8 rounded-full overflow-hidden flex bg-oatmeal-100">
                {result.finalAmount > 0 && (
                  <>
                    <div 
                      className="bg-cocoa-400 h-full transition-all duration-700 ease-out flex items-center justify-center"
                      style={{ width: `${(result.totalInvested / result.finalAmount) * 100}%` }}
                    >
                      {(result.totalInvested / result.finalAmount) * 100 > 15 && (
                        <span className="text-xs text-white font-medium">
                          {((result.totalInvested / result.finalAmount) * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                    <div 
                      className="bg-gradient-to-r from-golden-400 to-golden-500 h-full transition-all duration-700 ease-out flex items-center justify-center"
                      style={{ width: `${(result.totalInterest / result.finalAmount) * 100}%` }}
                    >
                      {(result.totalInterest / result.finalAmount) * 100 > 15 && (
                        <span className="text-xs text-white font-medium">
                          {((result.totalInterest / result.finalAmount) * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
              <div className="flex justify-between mt-3 text-xs text-cocoa-500">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cocoa-400"></div>
                  <span>투자 원금</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-golden-400"></div>
                  <span>이자 수익 (복리 효과)</span>
                </div>
              </div>
            </div>

            {/* 성장 차트 (CSS 바 차트) */}
            <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-6">
              <h3 className="text-sm font-semibold text-espresso-700 mb-4">연도별 자산 성장</h3>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {result.yearlyData.map((data) => {
                  const investedWidth = (data.totalInvested / maxBalance) * 100;
                  const interestWidth = (data.totalInterest / maxBalance) * 100;
                  return (
                    <div key={data.year} className="flex items-center gap-3 group">
                      <span className="text-xs text-cocoa-400 w-8 text-right font-mono shrink-0">
                        {data.year}년
                      </span>
                      <div className="flex-1 h-6 rounded-md overflow-hidden flex bg-oatmeal-50">
                        <div 
                          className="bg-cocoa-300 h-full transition-all duration-500"
                          style={{ width: `${investedWidth}%` }}
                        />
                        <div 
                          className="bg-golden-400 h-full transition-all duration-500"
                          style={{ width: `${interestWidth}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-espresso-700 w-24 text-right shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        {formatKRW(data.balance)}
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
                      <th className="text-right py-3 px-2 text-cocoa-500 font-semibold">총 투자금</th>
                      <th className="text-right py-3 px-2 text-cocoa-500 font-semibold">이자 수익</th>
                      <th className="text-right py-3 px-2 text-cocoa-500 font-semibold">총 자산</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.yearlyData.map((data) => (
                      <tr key={data.year} className="border-b border-oatmeal-100 hover:bg-cream-50 transition-colors">
                        <td className="py-2.5 px-2 text-espresso-700 font-medium">{data.year}년</td>
                        <td className="py-2.5 px-2 text-right text-cocoa-600">{formatKRW(data.totalInvested)}</td>
                        <td className="py-2.5 px-2 text-right text-golden-600 font-medium">{formatKRW(data.totalInterest)}</td>
                        <td className="py-2.5 px-2 text-right text-espresso-800 font-bold">{formatKRW(data.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 복리 Tip */}
            <div className="bg-gradient-to-br from-golden-50 to-cream-100 rounded-2xl border border-golden-200 p-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-golden-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-espresso-800 mb-2">💡 복리의 핵심 포인트</h4>
                  <ul className="text-sm text-cocoa-600 space-y-1.5">
                    <li>• <strong>일찍 시작할수록 유리합니다.</strong> 10년 차이가 결과를 2배 이상 바꿉니다.</li>
                    <li>• <strong>매월 적립이 핵심!</strong> 큰 돈을 한 번에 넣는 것보다 꾸준히 넣는 게 효과적입니다.</li>
                    <li>• <strong>수익률 1~2% 차이</strong>가 20년 후 수천만 원 차이를 만듭니다.</li>
                    <li>• S&P 500 평균 연 수익률은 약 <strong>10%</strong> (인플레이션 전)입니다.</li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  
    </>);
};

export default CompoundInterestCalculator;
