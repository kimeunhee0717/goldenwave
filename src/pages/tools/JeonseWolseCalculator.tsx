import React, { useState, useMemo } from 'react';
import { Home, RotateCcw, Info, ArrowRightLeft } from 'lucide-react';

type Mode = 'jeonse-to-wolse' | 'wolse-to-jeonse';

const JeonseWolseCalculator: React.FC = () => {
  const [mode, setMode] = useState<Mode>('jeonse-to-wolse');
  const [conversionRate, setConversionRate] = useState<string>('4.5'); // 전월세 전환율 %

  // 전세→월세 입력
  const [jeonseAmount, setJeonseAmount] = useState<string>('30000'); // 전세금 (만원)
  const [desiredDeposit, setDesiredDeposit] = useState<string>('5000'); // 희망 보증금 (만원)

  // 월세→전세 입력
  const [wolseDeposit, setWolseDeposit] = useState<string>('5000'); // 보증금 (만원)
  const [monthlyRent, setMonthlyRent] = useState<string>('80'); // 월세 (만원)

  // 전세→월세 결과
  const jeonseToWolseResult = useMemo(() => {
    const jeonse = (parseFloat(jeonseAmount) || 0) * 10000;
    const deposit = (parseFloat(desiredDeposit) || 0) * 10000;
    const rate = (parseFloat(conversionRate) || 0) / 100;

    if (jeonse <= 0 || rate <= 0) return null;
    if (deposit >= jeonse) return null;

    // 월세 = (전세금 - 보증금) × 전환율 / 12
    const diff = jeonse - deposit;
    const monthlyRentCalc = (diff * rate) / 12;
    const yearlyRentCalc = diff * rate;

    // 다양한 보증금 수준별 월세 비교
    const depositLevels = [0, 1000, 3000, 5000, 10000, 15000, 20000]
      .map((d) => d * 10000)
      .filter((d) => d < jeonse);

    const comparisons = depositLevels.map((dep) => ({
      deposit: dep,
      monthlyRent: ((jeonse - dep) * rate) / 12,
      yearlyRent: (jeonse - dep) * rate,
    }));

    return {
      monthlyRent: monthlyRentCalc,
      yearlyRent: yearlyRentCalc,
      diff,
      comparisons,
    };
  }, [jeonseAmount, desiredDeposit, conversionRate]);

  // 월세→전세 결과
  const wolseToJeonseResult = useMemo(() => {
    const deposit = (parseFloat(wolseDeposit) || 0) * 10000;
    const rent = (parseFloat(monthlyRent) || 0) * 10000;
    const rate = (parseFloat(conversionRate) || 0) / 100;

    if (rent <= 0 || rate <= 0) return null;

    // 전세금 = 보증금 + (월세 × 12 / 전환율)
    const convertedJeonse = (rent * 12) / rate;
    const totalJeonse = deposit + convertedJeonse;
    const yearlyRent = rent * 12;

    // 전환율별 비교
    const rateComparisons = [3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0].map((r) => ({
      rate: r,
      jeonse: deposit + (rent * 12) / (r / 100),
    }));

    return {
      totalJeonse,
      convertedJeonse,
      yearlyRent,
      rateComparisons,
    };
  }, [wolseDeposit, monthlyRent, conversionRate]);

  const handleReset = () => {
    setConversionRate('4.5');
    setJeonseAmount('30000');
    setDesiredDeposit('5000');
    setWolseDeposit('5000');
    setMonthlyRent('80');
  };

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

  const formatMan = (amount: number): string => {
    return `${Math.floor(amount / 10000).toLocaleString()}만원`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-golden-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-espresso-800 to-espresso-950 text-white py-16 px-6">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-golden-100 rounded-2xl flex items-center justify-center">
              <Home className="w-6 h-6 text-espresso-800" />
            </div>
            <span className="text-golden-200 text-sm font-medium tracking-wider uppercase">
              부자타임 도구
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">전세↔월세 전환 계산기</h1>
          <p className="text-oatmeal-300 text-base sm:text-lg max-w-xl mx-auto">
            전월세 전환율을 적용해 전세금과 월세를 상호 변환합니다.
            <br className="hidden sm:block" />
            보증금 수준별 월세 비교로 최적의 조건을 찾아보세요.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-10 space-y-6">
        {/* ── 모드 선택 ── */}
        <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-espresso-800">변환 방향</h2>
            <button
              onClick={handleReset}
              className="text-cocoa-500 hover:text-cocoa-700 transition-colors p-1.5 rounded-lg hover:bg-oatmeal-100"
              title="초기화"
            >
              <RotateCcw size={18} />
            </button>
          </div>

          {/* 모드 토글 */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {([
              ['jeonse-to-wolse', '전세 → 월세', '전세금으로 예상 월세 계산'],
              ['wolse-to-jeonse', '월세 → 전세', '월세로 전세 전환금 계산'],
            ] as const).map(([val, label, desc]) => (
              <button
                key={val}
                onClick={() => setMode(val)}
                className={`p-4 rounded-xl text-left transition-all ${
                  mode === val
                    ? 'bg-golden-50 border-2 border-golden-300'
                    : 'bg-oatmeal-50 border-2 border-transparent hover:bg-oatmeal-100'
                }`}
              >
                <div className={`text-sm font-bold mb-0.5 ${mode === val ? 'text-espresso-800' : 'text-cocoa-500'}`}>
                  {label}
                </div>
                <div className="text-xs text-cocoa-400">{desc}</div>
              </button>
            ))}
          </div>

          {/* 공통: 전월세 전환율 */}
          <div className="mb-5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-espresso-600 mb-2">
              <ArrowRightLeft size={14} className="text-golden-500" />
              전월세 전환율
            </label>
            <div className="relative">
              <input
                type="number"
                value={conversionRate}
                onChange={(e) => setConversionRate(e.target.value)}
                className="w-full px-4 py-3 pr-8 border-2 border-oatmeal-200 rounded-xl focus:border-golden-400 focus:ring-2 focus:ring-golden-100 outline-none transition-all text-lg font-medium text-espresso-800"
                step="0.1"
                min="1"
                max="15"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-cocoa-400 font-medium text-sm">%</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {['3.0', '3.5', '4.0', '4.5', '5.0', '5.5', '6.0'].map((v) => (
                <button
                  key={v}
                  onClick={() => setConversionRate(v)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                    conversionRate === v
                      ? 'bg-golden-100 text-espresso-800 border border-golden-300'
                      : 'bg-oatmeal-100 text-cocoa-500 hover:bg-oatmeal-200 border border-transparent'
                  }`}
                >
                  {v}%
                </button>
              ))}
            </div>
            <p className="text-xs text-cocoa-400 mt-1.5">
              * 2024년 기준 법정 상한 전환율: 기준금리(3.5%) + 2% = 5.5%
            </p>
          </div>

          {/* 모드별 입력 */}
          {mode === 'jeonse-to-wolse' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-espresso-600 mb-1.5">전세금</label>
                <div className="relative">
                  <input
                    type="number"
                    value={jeonseAmount}
                    onChange={(e) => setJeonseAmount(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border-2 border-oatmeal-200 rounded-xl focus:border-golden-400 focus:ring-2 focus:ring-golden-100 outline-none transition-all text-lg font-medium text-espresso-800"
                    min="0"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-cocoa-400 font-medium text-sm">만원</span>
                </div>
                {parseFloat(jeonseAmount) > 0 && (
                  <p className="text-xs text-cocoa-400 mt-1 ml-1">= {formatKRW((parseFloat(jeonseAmount) || 0) * 10000)}</p>
                )}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {['10000', '20000', '30000', '40000', '50000'].map((v) => (
                    <button
                      key={v}
                      onClick={() => setJeonseAmount(v)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                        jeonseAmount === v
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
                <label className="block text-xs font-semibold text-espresso-600 mb-1.5">희망 보증금</label>
                <div className="relative">
                  <input
                    type="number"
                    value={desiredDeposit}
                    onChange={(e) => setDesiredDeposit(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border-2 border-oatmeal-200 rounded-xl focus:border-golden-400 focus:ring-2 focus:ring-golden-100 outline-none transition-all text-lg font-medium text-espresso-800"
                    min="0"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-cocoa-400 font-medium text-sm">만원</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-espresso-600 mb-1.5">현재 보증금</label>
                <div className="relative">
                  <input
                    type="number"
                    value={wolseDeposit}
                    onChange={(e) => setWolseDeposit(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border-2 border-oatmeal-200 rounded-xl focus:border-golden-400 focus:ring-2 focus:ring-golden-100 outline-none transition-all text-lg font-medium text-espresso-800"
                    min="0"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-cocoa-400 font-medium text-sm">만원</span>
                </div>
                {parseFloat(wolseDeposit) > 0 && (
                  <p className="text-xs text-cocoa-400 mt-1 ml-1">= {formatKRW((parseFloat(wolseDeposit) || 0) * 10000)}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-espresso-600 mb-1.5">월세</label>
                <div className="relative">
                  <input
                    type="number"
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border-2 border-oatmeal-200 rounded-xl focus:border-golden-400 focus:ring-2 focus:ring-golden-100 outline-none transition-all text-lg font-medium text-espresso-800"
                    min="0"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-cocoa-400 font-medium text-sm">만원</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {['30', '50', '80', '100', '150'].map((v) => (
                    <button
                      key={v}
                      onClick={() => setMonthlyRent(v)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                        monthlyRent === v
                          ? 'bg-golden-100 text-espresso-800 border border-golden-300'
                          : 'bg-oatmeal-100 text-cocoa-500 hover:bg-oatmeal-200 border border-transparent'
                      }`}
                    >
                      {v}만원
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── 결과: 전세→월세 ── */}
        {mode === 'jeonse-to-wolse' && jeonseToWolseResult && (
          <>
            <div className="bg-gradient-to-br from-espresso-800 to-espresso-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl text-center">
              <p className="text-sm text-golden-200 mb-1 tracking-wider uppercase">예상 월세</p>
              <div className="text-4xl sm:text-5xl font-bold text-golden-100 mb-2">
                {formatKRW(jeonseToWolseResult.monthlyRent)}
              </div>
              <p className="text-sm text-oatmeal-400 mb-5">
                보증금 {formatKRW((parseFloat(desiredDeposit) || 0) * 10000)} / 월세 {formatKRW(jeonseToWolseResult.monthlyRent)}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
                <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                  <p className="text-xs text-oatmeal-400 mb-1">전환 대상 금액</p>
                  <p className="text-base font-bold">{formatKRW(jeonseToWolseResult.diff)}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                  <p className="text-xs text-oatmeal-400 mb-1">연 임대료</p>
                  <p className="text-base font-bold">{formatKRW(jeonseToWolseResult.yearlyRent)}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                  <p className="text-xs text-oatmeal-400 mb-1">전환율</p>
                  <p className="text-base font-bold">{conversionRate}%</p>
                </div>
              </div>
            </div>

            {/* 보증금 수준별 월세 비교 */}
            <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-5 sm:p-6">
              <h3 className="text-sm font-semibold text-espresso-700 mb-4">보증금 수준별 월세 비교</h3>
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm min-w-[400px]">
                  <thead>
                    <tr className="border-b-2 border-oatmeal-200">
                      <th className="text-left py-3 px-3 text-cocoa-500 font-semibold">보증금</th>
                      <th className="text-right py-3 px-3 text-cocoa-500 font-semibold">월세</th>
                      <th className="text-right py-3 px-3 text-cocoa-500 font-semibold">연 임대료</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jeonseToWolseResult.comparisons.map((c) => {
                      const isSelected = Math.abs(c.deposit - (parseFloat(desiredDeposit) || 0) * 10000) < 10000;
                      return (
                        <tr
                          key={c.deposit}
                          className={`border-b border-oatmeal-100 transition-colors ${
                            isSelected ? 'bg-golden-50 font-medium' : 'hover:bg-cream-50/50'
                          }`}
                        >
                          <td className={`py-2.5 px-3 ${isSelected ? 'text-espresso-800 font-bold' : 'text-espresso-700'}`}>
                            {formatKRW(c.deposit)}
                            {isSelected && ' ←'}
                          </td>
                          <td className={`py-2.5 px-3 text-right ${isSelected ? 'text-golden-600 font-bold' : 'text-cocoa-600'}`}>
                            {formatKRW(c.monthlyRent)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-cocoa-500">
                            {formatKRW(c.yearlyRent)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* 시각화 바 */}
              <div className="mt-5 space-y-2">
                {jeonseToWolseResult.comparisons.map((c) => {
                  const jeonse = (parseFloat(jeonseAmount) || 1) * 10000;
                  const depositPct = (c.deposit / jeonse) * 100;
                  const isSelected = Math.abs(c.deposit - (parseFloat(desiredDeposit) || 0) * 10000) < 10000;
                  return (
                    <div key={c.deposit} className="flex items-center gap-2">
                      <span className="text-[10px] text-cocoa-400 w-16 text-right shrink-0">
                        {formatMan(c.deposit)}
                      </span>
                      <div className="flex-1 h-5 bg-oatmeal-50 rounded-md overflow-hidden flex">
                        <div
                          className={`h-full transition-all duration-500 ${isSelected ? 'bg-golden-400' : 'bg-cocoa-200'}`}
                          style={{ width: `${depositPct}%` }}
                        />
                        <div
                          className={`h-full transition-all duration-500 ${isSelected ? 'bg-moss-400' : 'bg-moss-200'}`}
                          style={{ width: `${100 - depositPct}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-espresso-700 w-16 shrink-0">
                        월 {formatMan(c.monthlyRent)}
                      </span>
                    </div>
                  );
                })}
                <div className="flex gap-4 mt-1 text-[10px] text-cocoa-400">
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-sm bg-cocoa-200" /> 보증금
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-sm bg-moss-200" /> 월세 전환분
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── 결과: 월세→전세 ── */}
        {mode === 'wolse-to-jeonse' && wolseToJeonseResult && (
          <>
            <div className="bg-gradient-to-br from-espresso-800 to-espresso-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl text-center">
              <p className="text-sm text-golden-200 mb-1 tracking-wider uppercase">전세 전환 금액</p>
              <div className="text-4xl sm:text-5xl font-bold text-golden-100 mb-2">
                {formatKRW(wolseToJeonseResult.totalJeonse)}
              </div>
              <p className="text-sm text-oatmeal-400 mb-5">
                현재 보증금 {formatKRW((parseFloat(wolseDeposit) || 0) * 10000)} + 월세 전환분 {formatKRW(wolseToJeonseResult.convertedJeonse)}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
                <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                  <p className="text-xs text-oatmeal-400 mb-1">현재 보증금</p>
                  <p className="text-base font-bold">{formatKRW((parseFloat(wolseDeposit) || 0) * 10000)}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                  <p className="text-xs text-oatmeal-400 mb-1">월세 전환분</p>
                  <p className="text-base font-bold text-golden-200">{formatKRW(wolseToJeonseResult.convertedJeonse)}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                  <p className="text-xs text-oatmeal-400 mb-1">연 임대료 절감</p>
                  <p className="text-base font-bold text-green-300">{formatKRW(wolseToJeonseResult.yearlyRent)}</p>
                </div>
              </div>
            </div>

            {/* 전환율별 전세금 비교 */}
            <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-5 sm:p-6">
              <h3 className="text-sm font-semibold text-espresso-700 mb-4">전환율별 전세금 비교</h3>
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm min-w-[350px]">
                  <thead>
                    <tr className="border-b-2 border-oatmeal-200">
                      <th className="text-left py-3 px-3 text-cocoa-500 font-semibold">전환율</th>
                      <th className="text-right py-3 px-3 text-cocoa-500 font-semibold">전세 전환 금액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wolseToJeonseResult.rateComparisons.map((c) => {
                      const isSelected = c.rate.toFixed(1) === parseFloat(conversionRate).toFixed(1);
                      return (
                        <tr
                          key={c.rate}
                          className={`border-b border-oatmeal-100 transition-colors cursor-pointer ${
                            isSelected ? 'bg-golden-50' : 'hover:bg-cream-50/50'
                          }`}
                          onClick={() => setConversionRate(c.rate.toString())}
                        >
                          <td className={`py-2.5 px-3 ${isSelected ? 'text-espresso-800 font-bold' : 'text-espresso-700'}`}>
                            {c.rate.toFixed(1)}%
                            {isSelected && ' ←'}
                          </td>
                          <td className={`py-2.5 px-3 text-right ${isSelected ? 'text-golden-600 font-bold' : 'text-cocoa-600'}`}>
                            {formatKRW(c.jeonse)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-cocoa-400 mt-2">
                * 전환율이 낮을수록 전세금이 높아집니다 (같은 월세를 전세로 전환 시 더 많은 보증금 필요)
              </p>
            </div>
          </>
        )}

        {/* ── 수식 안내 ── */}
        <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-5 sm:p-6">
          <h3 className="text-sm font-semibold text-espresso-700 mb-4">전월세 전환 공식</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-cream-50 rounded-xl p-4">
              <p className="text-xs font-bold text-espresso-700 mb-2">전세 → 월세</p>
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="text-sm text-espresso-800 font-mono">
                  월세 = (전세금 - 보증금) × 전환율 ÷ 12
                </p>
              </div>
            </div>
            <div className="bg-cream-50 rounded-xl p-4">
              <p className="text-xs font-bold text-espresso-700 mb-2">월세 → 전세</p>
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="text-sm text-espresso-800 font-mono">
                  전세금 = 보증금 + (월세 × 12 ÷ 전환율)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── 팁 ── */}
        <div className="bg-gradient-to-br from-golden-50 to-cream-100 rounded-2xl border border-golden-200 p-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-golden-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-bold text-espresso-800 mb-2">전월세 전환 참고 사항</h4>
              <ul className="text-sm text-cocoa-600 space-y-1.5">
                <li>
                  • <strong>법정 전환율 상한</strong>: 한국은행 기준금리 + 2%입니다. 이를 초과하는 전환율은
                  임대차보호법 위반입니다.
                </li>
                <li>
                  • <strong>실제 시장 전환율</strong>은 지역·물건에 따라 3~6% 수준이며, 서울은 보통 4~5%대입니다.
                </li>
                <li>
                  • <strong>전세가 유리한 경우</strong>: 전환율보다 높은 수익률로 목돈을 운용할 수 있을 때.
                </li>
                <li>
                  • <strong>월세가 유리한 경우</strong>: 목돈이 부족하거나, 전세 사기 리스크를 줄이고 싶을 때.
                </li>
                <li>
                  • 월세 세액공제(연 최대 750만원 한도, 총급여 7천만원 이하)도 함께 고려하세요.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JeonseWolseCalculator;
