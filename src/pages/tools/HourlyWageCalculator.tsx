import React, { useState, useMemo } from 'react';
import {
  Timer,
  ArrowRight,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

/* ---------- constants ---------- */
const MIN_WAGE_2025 = 10_030; // 2025년 최저시급
const MIN_WAGE_2024 = 9_860;

type InputMode = 'hourly' | 'daily' | 'monthly' | 'yearly';

const modeLabels: Record<InputMode, string> = {
  hourly: '시급',
  daily: '일급',
  monthly: '월급',
  yearly: '연봉',
};

const modeUnits: Record<InputMode, string> = {
  hourly: '원',
  daily: '원',
  monthly: '만원',
  yearly: '만원',
};

/* ---------- helpers ---------- */
const fmt = (n: number) => n.toLocaleString('ko-KR');

/* ---------- component ---------- */
const HourlyWageCalculator: React.FC = () => {
  const [mode, setMode] = useState<InputMode>('hourly');
  const [value, setValue] = useState(10_030);
  const [hoursPerDay, setHoursPerDay] = useState(8);
  const [daysPerWeek, setDaysPerWeek] = useState(5);
  const [includeWeeklyHoliday, setIncludeWeeklyHoliday] = useState(true); // 주휴수당 포함

  const result = useMemo(() => {
    // 월 근로시간 계산
    // 주 소정근로시간 = hoursPerDay * daysPerWeek
    // 주휴시간 = hoursPerDay (주 15시간 이상 근무 시)
    const weeklyHours = hoursPerDay * daysPerWeek;
    const weeklyHolidayHours = includeWeeklyHoliday && weeklyHours >= 15 ? hoursPerDay : 0;
    const totalWeeklyHours = weeklyHours + weeklyHolidayHours;
    const monthlyHours = totalWeeklyHours * (365 / 7 / 12); // 월 평균

    // 시급 기준으로 환산
    let hourly = 0;
    switch (mode) {
      case 'hourly':
        hourly = value;
        break;
      case 'daily':
        hourly = hoursPerDay > 0 ? value / hoursPerDay : 0;
        break;
      case 'monthly':
        hourly = monthlyHours > 0 ? (value * 10000) / monthlyHours : 0;
        break;
      case 'yearly':
        hourly = monthlyHours > 0 ? (value * 10000) / (monthlyHours * 12) : 0;
        break;
    }

    const daily = hourly * hoursPerDay;
    const weekly = daily * daysPerWeek;
    const weeklyWithHoliday = weekly + (includeWeeklyHoliday && weeklyHours >= 15 ? hourly * hoursPerDay : 0);
    const monthly = hourly * monthlyHours;
    const yearly = monthly * 12;

    // 최저시급 비교
    const meetsMinWage = hourly >= MIN_WAGE_2025;
    const minWageDiff = hourly - MIN_WAGE_2025;
    const minWagePct = MIN_WAGE_2025 > 0 ? ((hourly / MIN_WAGE_2025) * 100) : 0;

    // 최저시급 기준 월급/연봉 (주 40시간 + 주휴 기준)
    const minWageMonthly = MIN_WAGE_2025 * (209); // 209시간 (주 40시간 + 주휴 8시간 기준 법정 월 소정근로시간)
    const minWageYearly = minWageMonthly * 12;

    return {
      hourly: Math.round(hourly),
      daily: Math.round(daily),
      weekly: Math.round(weekly),
      weeklyWithHoliday: Math.round(weeklyWithHoliday),
      monthly: Math.round(monthly),
      yearly: Math.round(yearly),
      meetsMinWage,
      minWageDiff: Math.round(minWageDiff),
      minWagePct: Math.round(minWagePct * 10) / 10,
      minWageMonthly,
      minWageYearly,
      monthlyHours: Math.round(monthlyHours * 10) / 10,
      weeklyHolidayHours,
    };
  }, [mode, value, hoursPerDay, daysPerWeek, includeWeeklyHoliday]);

  /* 비교 테이블 데이터 (시급 기준) */
  const compareTable = useMemo(() => {
    const rates = [9860, 10030, 11000, 12000, 13000, 15000, 20000, 25000, 30000];
    if (!rates.includes(result.hourly) && result.hourly > 0) {
      rates.push(result.hourly);
      rates.sort((a, b) => a - b);
    }
    const weeklyHours = hoursPerDay * daysPerWeek;
    const weeklyHolidayHours = includeWeeklyHoliday && weeklyHours >= 15 ? hoursPerDay : 0;
    const totalWeeklyHours = weeklyHours + weeklyHolidayHours;
    const monthlyHours = totalWeeklyHours * (365 / 7 / 12);

    return rates.map((h) => ({
      hourly: h,
      daily: h * hoursPerDay,
      monthly: Math.round(h * monthlyHours),
      yearly: Math.round(h * monthlyHours * 12),
      isActive: h === result.hourly,
      isMinWage: h === MIN_WAGE_2025,
    }));
  }, [result.hourly, hoursPerDay, daysPerWeek, includeWeeklyHoliday]);

  return (
    <>
      <SEOHead
        title="시급·일급 변환 계산기"
        description="시급, 일급, 주급, 월급을 상호 변환합니다. 근무 시간과 주휴수당을 반영한 정확한 급여를 계산해보세요."
        url="/tools/hourly-wage"
      />
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero */}
      <section className="bg-gradient-to-r from-espresso-800 to-espresso-950 text-white pt-28 pb-12 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Timer size={22} />
            </div>
            <span className="text-oatmeal-300 text-sm font-medium">부자타임 도구</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">시급·일급 변환 계산기</h1>
          <p className="text-oatmeal-300 text-base md:text-lg">
            시급↔일급↔월급↔연봉을 상호 변환하고 2025년 최저시급과 비교합니다.
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
                  <h2 className="text-lg font-bold text-slate-800 mb-5">급여 입력</h2>

                  {/* 입력 모드 선택 */}
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-slate-600 mb-2">입력 기준</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(Object.keys(modeLabels) as InputMode[]).map((m) => (
                        <button
                          key={m}
                          onClick={() => {
                            setMode(m);
                            // 모드 변경 시 현재 계산된 값으로 세팅
                            switch (m) {
                              case 'hourly': setValue(result.hourly); break;
                              case 'daily': setValue(result.daily); break;
                              case 'monthly': setValue(Math.round(result.monthly / 10000)); break;
                              case 'yearly': setValue(Math.round(result.yearly / 10000)); break;
                            }
                          }}
                          className={`px-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            mode === m
                              ? 'bg-espresso-800 text-white shadow-md'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {modeLabels[m]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 금액 입력 */}
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      {modeLabels[mode]} 금액
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => setValue(Number(e.target.value))}
                        min={0}
                        className="w-full border-2 border-oatmeal-200 rounded-xl px-4 py-3 text-right pr-12 text-lg font-semibold focus:border-espresso-400 focus:outline-none transition-colors"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                        {modeUnits[mode]}
                      </span>
                    </div>
                  </div>

                  {/* 근무 조건 */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h3 className="text-sm font-bold text-slate-700">근무 조건</h3>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">일 근무시간</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={hoursPerDay}
                          onChange={(e) => setHoursPerDay(Math.max(1, Math.min(24, Number(e.target.value))))}
                          min={1}
                          max={24}
                          className="w-full border-2 border-oatmeal-200 rounded-xl px-4 py-3 text-right pr-12 focus:border-espresso-400 focus:outline-none transition-colors"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">시간</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {[4, 6, 8, 10].map((h) => (
                          <button
                            key={h}
                            onClick={() => setHoursPerDay(h)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                              hoursPerDay === h
                                ? 'bg-espresso-800 text-white'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            {h}시간
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">주 근무일수</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={daysPerWeek}
                          onChange={(e) => setDaysPerWeek(Math.max(1, Math.min(7, Number(e.target.value))))}
                          min={1}
                          max={7}
                          className="w-full border-2 border-oatmeal-200 rounded-xl px-4 py-3 text-right pr-8 focus:border-espresso-400 focus:outline-none transition-colors"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">일</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {[3, 4, 5, 6].map((d) => (
                          <button
                            key={d}
                            onClick={() => setDaysPerWeek(d)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                              daysPerWeek === d
                                ? 'bg-espresso-800 text-white'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            주{d}일
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
                      <div>
                        <span className="text-sm font-medium text-slate-700">주휴수당 포함</span>
                        <p className="text-xs text-slate-400 mt-0.5">주 15시간 이상 근무 시 발생</p>
                      </div>
                      <button
                        onClick={() => setIncludeWeeklyHoliday(!includeWeeklyHoliday)}
                        className={`w-12 h-6 rounded-full transition-all relative ${
                          includeWeeklyHoliday ? 'bg-moss-500' : 'bg-slate-300'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow ${
                            includeWeeklyHoliday ? 'left-6' : 'left-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 결과 패널 */}
            <div className="lg:col-span-3 space-y-6">

              {/* 환산 결과 카드 */}
              <div className="bg-gradient-to-r from-espresso-800 to-espresso-950 text-white rounded-2xl p-6 sm:p-8">
                <p className="text-oatmeal-300 text-sm mb-4">급여 환산 결과</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-xl p-4">
                    <p className="text-xs text-oatmeal-300 mb-1">시급</p>
                    <p className="text-2xl sm:text-3xl font-bold">{fmt(result.hourly)}<span className="text-sm ml-1">원</span></p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <p className="text-xs text-oatmeal-300 mb-1">일급 ({hoursPerDay}시간)</p>
                    <p className="text-2xl sm:text-3xl font-bold">{fmt(result.daily)}<span className="text-sm ml-1">원</span></p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <p className="text-xs text-oatmeal-300 mb-1">월급 {includeWeeklyHoliday ? '(주휴 포함)' : ''}</p>
                    <p className="text-2xl sm:text-3xl font-bold">{fmt(result.monthly)}<span className="text-sm ml-1">원</span></p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <p className="text-xs text-oatmeal-300 mb-1">연봉</p>
                    <p className="text-2xl sm:text-3xl font-bold">{fmt(result.yearly)}<span className="text-sm ml-1">원</span></p>
                  </div>
                </div>
                <p className="text-xs text-oatmeal-400 mt-4">
                  주 {hoursPerDay * daysPerWeek}시간 근무
                  {result.weeklyHolidayHours > 0 ? ` + 주휴 ${result.weeklyHolidayHours}시간` : ''}
                  = 월 약 {result.monthlyHours}시간 기준
                </p>
              </div>

              {/* 최저시급 비교 */}
              <div className={`rounded-2xl border-2 p-5 sm:p-6 ${
                result.meetsMinWage
                  ? 'bg-moss-50 border-moss-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  {result.meetsMinWage
                    ? <CheckCircle2 size={24} className="text-moss-600" />
                    : <XCircle size={24} className="text-red-500" />
                  }
                  <div>
                    <h3 className={`text-lg font-bold ${result.meetsMinWage ? 'text-moss-800' : 'text-red-700'}`}>
                      {result.meetsMinWage ? '최저시급 충족' : '최저시급 미달'}
                    </h3>
                    <p className="text-sm text-slate-500">2025년 최저시급 {fmt(MIN_WAGE_2025)}원 기준</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white/80 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">내 시급</p>
                    <p className="text-xl font-bold text-slate-800">{fmt(result.hourly)}원</p>
                  </div>
                  <div className="bg-white/80 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">최저시급 대비</p>
                    <p className={`text-xl font-bold ${result.meetsMinWage ? 'text-moss-700' : 'text-red-600'}`}>
                      {result.minWagePct}%
                    </p>
                  </div>
                  <div className="bg-white/80 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">차이</p>
                    <p className={`text-xl font-bold ${result.minWageDiff >= 0 ? 'text-moss-700' : 'text-red-600'}`}>
                      {result.minWageDiff >= 0 ? '+' : ''}{fmt(result.minWageDiff)}원
                    </p>
                  </div>
                </div>

                {/* 시급 게이지 */}
                <div className="mt-4">
                  <div className="relative h-6 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        result.meetsMinWage ? 'bg-moss-500' : 'bg-red-400'
                      }`}
                      style={{ width: `${Math.min(result.minWagePct, 200) / 2}%` }}
                    />
                    {/* 최저시급 마커 */}
                    <div
                      className="absolute top-0 h-full w-0.5 bg-slate-700"
                      style={{ left: '50%' }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>0원</span>
                    <span className="font-medium text-slate-600">{fmt(MIN_WAGE_2025)}원 (최저)</span>
                    <span>{fmt(MIN_WAGE_2025 * 2)}원</span>
                  </div>
                </div>
              </div>

              {/* 주급 상세 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
                <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Info size={18} className="text-espresso-500" />
                  주급 상세
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-600">기본 주급 ({daysPerWeek}일 × {hoursPerDay}시간)</span>
                    <span className="font-medium text-slate-800">{fmt(result.weekly)}원</span>
                  </div>
                  {result.weeklyHolidayHours > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-600">주휴수당 ({result.weeklyHolidayHours}시간)</span>
                      <span className="font-medium text-moss-700">+{fmt(Math.round(result.hourly * result.weeklyHolidayHours))}원</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2 bg-espresso-50 rounded-xl px-3">
                    <span className="font-bold text-espresso-800">주급 합계</span>
                    <span className="font-bold text-espresso-800">{fmt(result.weeklyWithHoliday)}원</span>
                  </div>
                </div>
              </div>

              {/* 시급별 비교 테이블 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
                <h3 className="text-base font-bold text-slate-800 mb-4">시급별 급여 비교</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-slate-200">
                        <th className="text-left py-2 px-2 font-medium text-slate-500">시급</th>
                        <th className="text-right py-2 px-2 font-medium text-slate-500">일급</th>
                        <th className="text-right py-2 px-2 font-medium text-slate-500">월급</th>
                        <th className="text-right py-2 px-2 font-medium text-slate-500">연봉</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {compareTable.map((row) => (
                        <tr
                          key={row.hourly}
                          className={
                            row.isActive
                              ? 'bg-espresso-50 font-bold'
                              : row.isMinWage
                                ? 'bg-amber-50'
                                : ''
                          }
                        >
                          <td className="py-2.5 px-2">
                            <div className="flex items-center gap-1.5">
                              {row.isActive && <ArrowRight size={12} className="text-espresso-600" />}
                              {row.isMinWage && !row.isActive && <span className="text-xs text-amber-500">★</span>}
                              <span className={row.isActive ? 'text-espresso-800' : row.isMinWage ? 'text-amber-700' : 'text-slate-700'}>
                                {fmt(row.hourly)}원
                              </span>
                              {row.isMinWage && <span className="text-[10px] text-amber-500 font-medium">(최저)</span>}
                            </div>
                          </td>
                          <td className="py-2.5 px-2 text-right">{fmt(row.daily)}원</td>
                          <td className="py-2.5 px-2 text-right">{fmt(row.monthly)}원</td>
                          <td className="py-2.5 px-2 text-right">{fmt(row.yearly)}원</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 최저시급 연혁 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
                <h3 className="text-base font-bold text-slate-800 mb-4">최저시급 연혁</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { year: 2025, wage: 10_030 },
                    { year: 2024, wage: 9_860 },
                    { year: 2023, wage: 9_620 },
                    { year: 2022, wage: 9_160 },
                    { year: 2021, wage: 8_720 },
                    { year: 2020, wage: 8_590 },
                    { year: 2019, wage: 8_350 },
                    { year: 2018, wage: 7_530 },
                  ].map((item) => (
                    <div
                      key={item.year}
                      className={`rounded-xl p-3 text-center ${
                        item.year === 2025 ? 'bg-espresso-50 border-2 border-espresso-200' : 'bg-slate-50'
                      }`}
                    >
                      <p className="text-xs text-slate-400">{item.year}년</p>
                      <p className={`text-sm font-bold ${item.year === 2025 ? 'text-espresso-800' : 'text-slate-700'}`}>
                        {fmt(item.wage)}원
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 주휴수당 안내 */}
              <div className="bg-gradient-to-br from-golden-50 to-cream-100 rounded-2xl border border-golden-200 p-5 sm:p-8">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <AlertTriangle size={20} className="text-golden-600" />
                  주휴수당 안내
                </h3>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-golden-500 mt-0.5">•</span>
                    <span><strong>지급 조건</strong>: 주 15시간 이상 근무하고, 소정근로일을 개근한 경우에 지급됩니다.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-golden-500 mt-0.5">•</span>
                    <span><strong>계산 방법</strong>: 1일 소정근로시간 × 시급 = 주휴수당 (주 40시간 근무 시 8시간분)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-golden-500 mt-0.5">•</span>
                    <span><strong>2025년 기준</strong>: 최저시급 {fmt(MIN_WAGE_2025)}원 × 209시간(법정) = 월 {fmt(MIN_WAGE_2025 * 209)}원</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-golden-500 mt-0.5">•</span>
                    <span>본 계산기는 참고용이며, 실제 급여는 근로계약서 및 노동관계법에 따릅니다.</span>
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

export default HourlyWageCalculator;
