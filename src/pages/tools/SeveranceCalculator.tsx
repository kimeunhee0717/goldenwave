import React, { useState, useMemo } from 'react';
import { Briefcase, DollarSign, Calendar, Award, Plane, Info, RotateCcw } from 'lucide-react';

const SeveranceCalculator: React.FC = () => {
  const [startDate, setStartDate] = useState<string>('2020-03-01');
  const [endDate, setEndDate] = useState<string>('2026-02-28');
  const [baseSalary, setBaseSalary] = useState<string>('300'); // 월 기본급 (만원)
  const [fixedAllowance, setFixedAllowance] = useState<string>('20'); // 월 고정수당 (만원)
  const [annualBonus, setAnnualBonus] = useState<string>('600'); // 연간 상여금 (만원)
  const [unusedLeave, setUnusedLeave] = useState<string>('5'); // 미사용 연차 (일)

  const result = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      return { severance: 0, dailyWage: 0, totalDays: 0, years: 0, months: 0, days: 0, details: null };
    }

    // 총 재직일수
    const totalDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // 근속 연수/월/일
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate() + 1;
    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const base = (parseFloat(baseSalary) || 0) * 10000;
    const allowance = (parseFloat(fixedAllowance) || 0) * 10000;
    const bonus = (parseFloat(annualBonus) || 0) * 10000;
    const leave = parseInt(unusedLeave) || 0;

    // 퇴직 전 3개월 급여 총액
    const monthlyTotal = base + allowance;
    const last3MonthsSalary = monthlyTotal * 3;

    // 퇴직 전 3개월 일수 (간이: 91일)
    const last3MonthsDays = 91;

    // 1일 통상임금 (기본급 + 고정수당 기준, 월 209시간 / 8시간 = 26.125일)
    const dailyOrdinaryWage = monthlyTotal / 26.125;

    // 상여금 가산: 연간 상여금 / 12 × 3
    const bonusFor3Months = (bonus / 12) * 3;

    // 연차수당 가산: 미사용 연차 × 1일 통상임금 / 12 × 3
    const leavePayFor3Months = (leave * dailyOrdinaryWage / 12) * 3;

    // 평균임금 산정 기초 = 3개월 급여 + 상여금 가산 + 연차수당 가산
    const avgWageBase = last3MonthsSalary + bonusFor3Months + leavePayFor3Months;

    // 1일 평균임금
    const dailyAvgWage = avgWageBase / last3MonthsDays;

    // 1일 통상임금과 비교하여 높은 쪽 적용
    const dailyWage = Math.max(dailyAvgWage, dailyOrdinaryWage);

    // 퇴직금 = 1일 평균임금 × 30 × (총 재직일수 / 365)
    const severance = dailyWage * 30 * (totalDays / 365);

    return {
      severance,
      dailyWage,
      totalDays,
      years,
      months,
      days,
      details: {
        last3MonthsSalary,
        bonusFor3Months,
        leavePayFor3Months,
        avgWageBase,
        dailyAvgWage,
        dailyOrdinaryWage,
        monthlyTotal,
      },
    };
  }, [startDate, endDate, baseSalary, fixedAllowance, annualBonus, unusedLeave]);

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
    setStartDate('2020-03-01');
    setEndDate('2026-02-28');
    setBaseSalary('300');
    setFixedAllowance('20');
    setAnnualBonus('600');
    setUnusedLeave('5');
  };

  // 근속 연수별 퇴직금 비교
  const yearComparison = useMemo(() => {
    const base = (parseFloat(baseSalary) || 0) * 10000;
    const allowance = (parseFloat(fixedAllowance) || 0) * 10000;
    const bonus = (parseFloat(annualBonus) || 0) * 10000;
    const leave = parseInt(unusedLeave) || 0;
    const monthlyTotal = base + allowance;
    const dailyOrd = monthlyTotal / 26.125;
    const last3Sal = monthlyTotal * 3;
    const bonusAdd = (bonus / 12) * 3;
    const leaveAdd = (leave * dailyOrd / 12) * 3;
    const avgBase = last3Sal + bonusAdd + leaveAdd;
    const dailyW = Math.max(avgBase / 91, dailyOrd);

    return [1, 3, 5, 10, 15, 20].map((y) => ({
      years: y,
      severance: dailyW * 30 * y,
    }));
  }, [baseSalary, fixedAllowance, annualBonus, unusedLeave]);

  return (
    <>
      <SEOHead
        title="퇴직금 계산기"
        description="근속 기간과 급여 정보를 입력하면 예상 퇴직금을 계산합니다. 퇴직소득세 공제 후 실수령액도 확인 가능합니다."
        url="/tools/severance"
      />
      <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-golden-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-espresso-800 to-espresso-950 text-white py-16 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-golden-100 rounded-2xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-espresso-800" />
            </div>
            <span className="text-golden-200 text-sm font-medium tracking-wider uppercase">부자타임 도구</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">퇴직금 계산기</h1>
          <p className="text-oatmeal-300 text-lg max-w-2xl">
            근속 기간과 급여 정보를 입력하면 예상 퇴직금을 계산해드립니다.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-6 py-10">
        <div className="grid lg:grid-cols-5 gap-8">

          {/* 입력 패널 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-espresso-800">근무 정보 입력</h2>
                <button
                  onClick={handleReset}
                  className="text-cocoa-500 hover:text-cocoa-700 transition-colors p-1.5 rounded-lg hover:bg-oatmeal-100"
                  title="초기화"
                >
                  <RotateCcw size={18} />
                </button>
              </div>

              <div className="space-y-5">
                {/* 입사일 */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-espresso-700 mb-2">
                    <Calendar size={16} className="text-golden-500" />
                    입사일
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-oatmeal-200 rounded-xl focus:border-golden-400 focus:ring-2 focus:ring-golden-100 outline-none transition-all text-base font-medium text-espresso-800"
                  />
                </div>

                {/* 퇴직일 */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-espresso-700 mb-2">
                    <Calendar size={16} className="text-golden-500" />
                    퇴직일
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-oatmeal-200 rounded-xl focus:border-golden-400 focus:ring-2 focus:ring-golden-100 outline-none transition-all text-base font-medium text-espresso-800"
                  />
                </div>

                {/* 월 기본급 */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-espresso-700 mb-2">
                    <DollarSign size={16} className="text-golden-500" />
                    월 기본급
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={baseSalary}
                      onChange={(e) => setBaseSalary(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border-2 border-oatmeal-200 rounded-xl focus:border-golden-400 focus:ring-2 focus:ring-golden-100 outline-none transition-all text-lg font-medium text-espresso-800"
                      min="0"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-cocoa-400 font-medium">만원</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {[200, 250, 300, 400, 500].map((v) => (
                      <button
                        key={v}
                        onClick={() => setBaseSalary(v.toString())}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          baseSalary === v.toString()
                            ? 'bg-golden-100 text-espresso-800 border border-golden-300'
                            : 'bg-oatmeal-100 text-cocoa-500 hover:bg-oatmeal-200 border border-transparent'
                        }`}
                      >
                        {v}만원
                      </button>
                    ))}
                  </div>
                </div>

                {/* 월 고정수당 */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-espresso-700 mb-2">
                    <Award size={16} className="text-golden-500" />
                    월 고정수당
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={fixedAllowance}
                      onChange={(e) => setFixedAllowance(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border-2 border-oatmeal-200 rounded-xl focus:border-golden-400 focus:ring-2 focus:ring-golden-100 outline-none transition-all text-lg font-medium text-espresso-800"
                      min="0"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-cocoa-400 font-medium">만원</span>
                  </div>
                  <p className="text-xs text-cocoa-400 mt-1 ml-1">직책수당, 식대, 교통비 등</p>
                </div>

                {/* 연간 상여금 */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-espresso-700 mb-2">
                    <DollarSign size={16} className="text-golden-500" />
                    연간 상여금
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={annualBonus}
                      onChange={(e) => setAnnualBonus(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border-2 border-oatmeal-200 rounded-xl focus:border-golden-400 focus:ring-2 focus:ring-golden-100 outline-none transition-all text-lg font-medium text-espresso-800"
                      min="0"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-cocoa-400 font-medium">만원</span>
                  </div>
                  <p className="text-xs text-cocoa-400 mt-1 ml-1">설·추석 상여, 성과급 등 연간 합계</p>
                </div>

                {/* 미사용 연차 */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-espresso-700 mb-2">
                    <Plane size={16} className="text-golden-500" />
                    미사용 연차일수
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={unusedLeave}
                      onChange={(e) => setUnusedLeave(e.target.value)}
                      className="w-full px-4 py-3 pr-8 border-2 border-oatmeal-200 rounded-xl focus:border-golden-400 focus:ring-2 focus:ring-golden-100 outline-none transition-all text-lg font-medium text-espresso-800"
                      min="0"
                      max="50"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-cocoa-400 font-medium">일</span>
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
                예상 퇴직금
              </h3>
              <div className="text-4xl md:text-5xl font-bold mb-2 text-golden-100">
                {formatWon(result.severance)}
              </div>
              <p className="text-oatmeal-300 text-sm mb-6">
                근속 {result.years}년 {result.months}개월 {result.days}일 (총 {result.totalDays.toLocaleString()}일)
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <p className="text-xs text-oatmeal-300 mb-1">1일 평균임금</p>
                  <p className="text-base sm:text-lg font-bold">{formatWon(result.dailyWage)}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <p className="text-xs text-golden-200 mb-1">총 재직일수</p>
                  <p className="text-base sm:text-lg font-bold text-golden-100">{result.totalDays.toLocaleString()}일</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <p className="text-xs text-oatmeal-300 mb-1">월 환산</p>
                  <p className="text-base sm:text-lg font-bold">{formatKRW(result.severance)}</p>
                </div>
              </div>
            </div>

            {/* 근속기간 시각화 */}
            <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-6">
              <h3 className="text-sm font-semibold text-espresso-700 mb-4">근속 기간</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-oatmeal-50 rounded-xl p-4">
                  <p className="text-3xl font-bold text-espresso-800">{result.years}</p>
                  <p className="text-xs text-cocoa-500 mt-1">년</p>
                </div>
                <div className="bg-oatmeal-50 rounded-xl p-4">
                  <p className="text-3xl font-bold text-espresso-800">{result.months}</p>
                  <p className="text-xs text-cocoa-500 mt-1">개월</p>
                </div>
                <div className="bg-oatmeal-50 rounded-xl p-4">
                  <p className="text-3xl font-bold text-espresso-800">{result.days}</p>
                  <p className="text-xs text-cocoa-500 mt-1">일</p>
                </div>
              </div>
              {result.totalDays < 365 && result.totalDays > 0 && (
                <div className="mt-4 bg-golden-50 border border-golden-200 rounded-xl p-3 text-sm text-golden-800">
                  ⚠️ 1년 미만 근속 시 퇴직금 지급 의무가 없을 수 있습니다. (근로기준법 제34조)
                </div>
              )}
            </div>

            {/* 산정 내역 */}
            {result.details && (
              <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-6">
                <h3 className="text-sm font-semibold text-espresso-700 mb-4">퇴직금 산정 내역</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-cocoa-400 uppercase tracking-wider mb-3">1. 평균임금 산정 기초 (퇴직 전 3개월)</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-cocoa-600">3개월 급여 (기본급 + 고정수당)</span>
                        <span className="font-medium text-espresso-700">{formatWon(result.details.last3MonthsSalary)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-cocoa-600">상여금 가산 (연 상여금 ÷ 12 × 3)</span>
                        <span className="font-medium text-espresso-700">{formatWon(result.details.bonusFor3Months)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-cocoa-600">연차수당 가산</span>
                        <span className="font-medium text-espresso-700">{formatWon(result.details.leavePayFor3Months)}</span>
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t border-oatmeal-100">
                        <span className="font-semibold text-espresso-700">평균임금 산정 기초 합계</span>
                        <span className="font-bold text-espresso-800">{formatWon(result.details.avgWageBase)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-cocoa-400 uppercase tracking-wider mb-3">2. 1일 임금 비교</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-cocoa-600">1일 평균임금 (기초 합계 ÷ 91일)</span>
                        <span className="font-medium text-espresso-700">{formatWon(result.details.dailyAvgWage)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-cocoa-600">1일 통상임금 (월급여 ÷ 26.125일)</span>
                        <span className="font-medium text-espresso-700">{formatWon(result.details.dailyOrdinaryWage)}</span>
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t border-oatmeal-100">
                        <span className="font-semibold text-espresso-700">적용 1일 임금 (높은 쪽)</span>
                        <span className="font-bold text-golden-600">{formatWon(result.dailyWage)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-oatmeal-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-cocoa-400 uppercase tracking-wider mb-2">3. 퇴직금 계산식</h4>
                    <p className="text-sm text-espresso-700">
                      {formatWon(result.dailyWage)} × 30일 × ({result.totalDays.toLocaleString()}일 ÷ 365일)
                    </p>
                    <p className="text-lg font-bold text-espresso-800 mt-2">
                      = {formatWon(result.severance)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 근속 연수별 비교 */}
            <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-6">
              <h3 className="text-sm font-semibold text-espresso-700 mb-4">근속 연수별 예상 퇴직금 (현재 급여 기준)</h3>
              <div className="space-y-3">
                {yearComparison.map((d) => {
                  const max = yearComparison[yearComparison.length - 1].severance;
                  const pct = max > 0 ? (d.severance / max) * 100 : 0;
                  const isCurrent = result.years === d.years && result.months === 0 && result.days <= 1;
                  return (
                    <div key={d.years} className="group">
                      <div className="flex justify-between text-sm mb-1">
                        <span className={`${isCurrent ? 'font-bold text-golden-600' : 'text-cocoa-600'}`}>
                          {d.years}년 근속
                        </span>
                        <span className="font-medium text-espresso-700">{formatKRW(d.severance)}</span>
                      </div>
                      <div className="w-full h-4 rounded-full bg-oatmeal-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cocoa-300 to-golden-400 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 테이블 */}
            <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-6">
              <h3 className="text-sm font-semibold text-espresso-700 mb-4">근속 연수별 상세</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-oatmeal-200">
                      <th className="text-left py-3 px-2 text-cocoa-500 font-semibold">근속</th>
                      <th className="text-right py-3 px-2 text-cocoa-500 font-semibold">퇴직금</th>
                      <th className="text-right py-3 px-2 text-cocoa-500 font-semibold">월 환산</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearComparison.map((d) => (
                      <tr key={d.years} className="border-b border-oatmeal-100 hover:bg-cream-50 transition-colors">
                        <td className="py-2.5 px-2 text-espresso-700 font-medium">{d.years}년</td>
                        <td className="py-2.5 px-2 text-right text-espresso-800 font-bold">{formatWon(d.severance)}</td>
                        <td className="py-2.5 px-2 text-right text-cocoa-600">{formatKRW(d.severance)}</td>
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
                  <h4 className="font-bold text-espresso-800 mb-2">💡 퇴직금 알아두기</h4>
                  <ul className="text-sm text-cocoa-600 space-y-1.5">
                    <li>• <strong>1년 이상</strong> 근속한 근로자에게 퇴직금 지급 의무가 있습니다.</li>
                    <li>• 퇴직금은 <strong>1일 평균임금 × 30일 × (재직일수 ÷ 365)</strong>로 계산합니다.</li>
                    <li>• 평균임금이 통상임금보다 낮으면 <strong>통상임금</strong>을 적용합니다.</li>
                    <li>• 퇴직금은 <strong>퇴직소득세</strong>가 별도로 부과되며, 근속 연수에 따라 공제가 달라집니다.</li>
                    <li>• 본 계산기는 <strong>근사치</strong>이며, 정확한 금액은 회사 인사팀에 확인하세요.</li>
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

export default SeveranceCalculator;
