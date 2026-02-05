import React, { useState, useMemo } from 'react';
import { Calendar, RotateCcw, Info, Cake, Clock, Star } from 'lucide-react';

const ZODIAC_ANIMALS = [
  { name: '원숭이', emoji: '🐵' },
  { name: '닭', emoji: '🐔' },
  { name: '개', emoji: '🐶' },
  { name: '돼지', emoji: '🐷' },
  { name: '쥐', emoji: '🐭' },
  { name: '소', emoji: '🐮' },
  { name: '호랑이', emoji: '🐯' },
  { name: '토끼', emoji: '🐰' },
  { name: '용', emoji: '🐲' },
  { name: '뱀', emoji: '🐍' },
  { name: '말', emoji: '🐴' },
  { name: '양', emoji: '🐑' },
];

const CONSTELLATIONS = [
  { name: '염소자리', emoji: '♑', start: [1, 1], end: [1, 19] },
  { name: '물병자리', emoji: '♒', start: [1, 20], end: [2, 18] },
  { name: '물고기자리', emoji: '♓', start: [2, 19], end: [3, 20] },
  { name: '양자리', emoji: '♈', start: [3, 21], end: [4, 19] },
  { name: '황소자리', emoji: '♉', start: [4, 20], end: [5, 20] },
  { name: '쌍둥이자리', emoji: '♊', start: [5, 21], end: [6, 21] },
  { name: '게자리', emoji: '♋', start: [6, 22], end: [7, 22] },
  { name: '사자자리', emoji: '♌', start: [7, 23], end: [8, 22] },
  { name: '처녀자리', emoji: '♍', start: [8, 23], end: [9, 22] },
  { name: '천칭자리', emoji: '♎', start: [9, 23], end: [10, 22] },
  { name: '전갈자리', emoji: '♏', start: [10, 23], end: [11, 21] },
  { name: '사수자리', emoji: '♐', start: [11, 22], end: [12, 21] },
  { name: '염소자리', emoji: '♑', start: [12, 22], end: [12, 31] },
];

function getConstellation(month: number, day: number) {
  for (const c of CONSTELLATIONS) {
    const [sm, sd] = c.start;
    const [em, ed] = c.end;
    if (
      (month === sm && day >= sd) ||
      (month === em && day <= ed) ||
      (sm !== em && month > sm && month < em)
    ) {
      return c;
    }
  }
  return CONSTELLATIONS[0];
}

function getZodiac(year: number) {
  return ZODIAC_ANIMALS[year % 12];
}

const AgeCalculator: React.FC = () => {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const [birthDate, setBirthDate] = useState<string>('1990-01-15');
  const [baseDate, setBaseDate] = useState<string>(todayStr);

  const result = useMemo(() => {
    if (!birthDate) return null;

    const birth = new Date(birthDate + 'T00:00:00');
    const base = new Date((baseDate || todayStr) + 'T00:00:00');

    if (isNaN(birth.getTime()) || isNaN(base.getTime())) return null;
    if (birth > base) return null;

    const birthYear = birth.getFullYear();
    const birthMonth = birth.getMonth();
    const birthDay = birth.getDate();
    const baseYear = base.getFullYear();
    const baseMonth = base.getMonth();
    const baseDay = base.getDate();

    // 만나이
    let internationalAge = baseYear - birthYear;
    if (baseMonth < birthMonth || (baseMonth === birthMonth && baseDay < birthDay)) {
      internationalAge--;
    }

    // 연나이 (현재 연도 - 출생 연도)
    const yearAge = baseYear - birthYear;

    // 한국 나이 (연나이 + 1) — 2023년 6월 이전 전통 방식
    const koreanAge = yearAge + 1;

    // 띠
    const zodiac = getZodiac(birthYear);

    // 별자리
    const constellation = getConstellation(birthMonth + 1, birthDay);

    // 살아온 일수
    const diffMs = base.getTime() - birth.getTime();
    const daysLived = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // 다음 생일까지
    let nextBirthday = new Date(baseYear, birthMonth, birthDay);
    if (nextBirthday <= base) {
      nextBirthday = new Date(baseYear + 1, birthMonth, birthDay);
    }
    const daysToNextBirthday = Math.ceil(
      (nextBirthday.getTime() - base.getTime()) / (1000 * 60 * 60 * 24),
    );
    const isBirthdayToday = baseMonth === birthMonth && baseDay === birthDay;

    // 살아온 개월 수
    let monthsLived = (baseYear - birthYear) * 12 + (baseMonth - birthMonth);
    if (baseDay < birthDay) monthsLived--;

    // 살아온 주 수
    const weeksLived = Math.floor(daysLived / 7);

    // 100세까지 남은 일수
    const hundredDate = new Date(birthYear + 100, birthMonth, birthDay);
    const daysTo100 = Math.max(
      0,
      Math.ceil((hundredDate.getTime() - base.getTime()) / (1000 * 60 * 60 * 24)),
    );

    // 10000일 기념일
    const tenThousandDate = new Date(birth.getTime() + 10000 * 24 * 60 * 60 * 1000);

    // 주요 기념일들
    const milestones = [1000, 5000, 10000, 15000, 20000, 25000, 30000].map((d) => {
      const date = new Date(birth.getTime() + d * 24 * 60 * 60 * 1000);
      const passed = date <= base;
      return { days: d, date, passed };
    });

    return {
      internationalAge,
      yearAge,
      koreanAge,
      zodiac,
      constellation,
      daysLived,
      daysToNextBirthday,
      isBirthdayToday,
      monthsLived,
      weeksLived,
      daysTo100,
      tenThousandDate,
      milestones,
      birthYear,
    };
  }, [birthDate, baseDate]);

  const handleReset = () => {
    setBirthDate('1990-01-15');
    setBaseDate(todayStr);
  };

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  const formatDay = (name: string) => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days;
  };

  const getDayName = (date: Date) => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days[date.getDay()];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-golden-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-espresso-800 to-espresso-950 text-white py-16 px-6">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-golden-100 rounded-2xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-espresso-800" />
            </div>
            <span className="text-golden-200 text-sm font-medium tracking-wider uppercase">
              부자타임 도구
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">나이 · 만나이 계산기</h1>
          <p className="text-oatmeal-300 text-base sm:text-lg max-w-xl mx-auto">
            생년월일을 입력하면 만나이, 한국 나이, 연나이를 한 번에 확인할 수 있습니다.
            <br className="hidden sm:block" />
            띠, 별자리, D-day 정보까지 제공합니다.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-10 space-y-6">
        {/* ── 입력 ── */}
        <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-espresso-800">생년월일 입력</h2>
            <button
              onClick={handleReset}
              className="text-cocoa-500 hover:text-cocoa-700 transition-colors p-1.5 rounded-lg hover:bg-oatmeal-100"
              title="초기화"
            >
              <RotateCcw size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-espresso-600 mb-2">
                <Cake size={14} className="text-golden-500" />
                생년월일
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-oatmeal-200 rounded-xl focus:border-golden-400 focus:ring-2 focus:ring-golden-100 outline-none transition-all text-base font-medium text-espresso-800"
                max={todayStr}
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['1970-01-01', '1980-01-01', '1990-01-01', '2000-01-01'].map((v) => (
                  <button
                    key={v}
                    onClick={() => setBirthDate(v)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                      birthDate === v
                        ? 'bg-golden-100 text-espresso-800 border border-golden-300'
                        : 'bg-oatmeal-100 text-cocoa-500 hover:bg-oatmeal-200 border border-transparent'
                    }`}
                  >
                    {v.slice(0, 4)}년생
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-espresso-600 mb-2">
                <Clock size={14} className="text-golden-500" />
                기준일
              </label>
              <input
                type="date"
                value={baseDate}
                onChange={(e) => setBaseDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-oatmeal-200 rounded-xl focus:border-golden-400 focus:ring-2 focus:ring-golden-100 outline-none transition-all text-base font-medium text-espresso-800"
              />
              <button
                onClick={() => setBaseDate(todayStr)}
                className={`mt-2 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                  baseDate === todayStr
                    ? 'bg-golden-100 text-espresso-800 border border-golden-300'
                    : 'bg-oatmeal-100 text-cocoa-500 hover:bg-oatmeal-200 border border-transparent'
                }`}
              >
                오늘
              </button>
            </div>
          </div>
        </div>

        {result && (
          <>
            {/* ── 나이 3종 카드 ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* 만나이 */}
              <div className="bg-gradient-to-br from-espresso-800 to-espresso-950 rounded-2xl p-5 text-center shadow-xl">
                <p className="text-xs text-golden-200 mb-1 tracking-wider uppercase">만나이 (국제 표준)</p>
                <div className="text-5xl font-bold text-golden-100 my-3">
                  {result.internationalAge}
                  <span className="text-2xl text-golden-200 ml-1">세</span>
                </div>
                <p className="text-xs text-oatmeal-400">2023.6월부터 법적 기준</p>
              </div>

              {/* 연나이 */}
              <div className="bg-white rounded-2xl border-2 border-moss-200 p-5 text-center">
                <p className="text-xs text-moss-600 mb-1 tracking-wider uppercase font-semibold">연나이</p>
                <div className="text-5xl font-bold text-moss-700 my-3">
                  {result.yearAge}
                  <span className="text-2xl text-moss-400 ml-1">세</span>
                </div>
                <p className="text-xs text-cocoa-400">현재 연도 - 출생 연도</p>
              </div>

              {/* 한국 나이 */}
              <div className="bg-white rounded-2xl border-2 border-oatmeal-200 p-5 text-center">
                <p className="text-xs text-cocoa-500 mb-1 tracking-wider uppercase font-semibold">한국 나이 (구)</p>
                <div className="text-5xl font-bold text-espresso-700 my-3">
                  {result.koreanAge}
                  <span className="text-2xl text-cocoa-400 ml-1">세</span>
                </div>
                <p className="text-xs text-cocoa-400">2023.6월 이전 전통 방식</p>
              </div>
            </div>

            {/* ── 띠 & 별자리 ── */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-oatmeal-200 shadow-lg shadow-espresso-900/5 p-5 flex items-center gap-4">
                <div className="text-4xl">{result.zodiac.emoji}</div>
                <div>
                  <p className="text-xs text-cocoa-400 mb-0.5">띠</p>
                  <p className="text-lg font-bold text-espresso-800">{result.zodiac.name}띠</p>
                  <p className="text-xs text-cocoa-400">{result.birthYear}년생</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-oatmeal-200 shadow-lg shadow-espresso-900/5 p-5 flex items-center gap-4">
                <div className="text-4xl">{result.constellation.emoji}</div>
                <div>
                  <p className="text-xs text-cocoa-400 mb-0.5">별자리</p>
                  <p className="text-lg font-bold text-espresso-800">{result.constellation.name}</p>
                </div>
              </div>
            </div>

            {/* ── 생일 & D-day ── */}
            <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-5 sm:p-6">
              <h3 className="text-sm font-semibold text-espresso-700 mb-4">D-day 정보</h3>

              {result.isBirthdayToday && (
                <div className="bg-golden-50 border border-golden-200 rounded-xl p-4 mb-4 text-center">
                  <span className="text-2xl mr-2">🎂</span>
                  <span className="text-lg font-bold text-golden-700">오늘은 생일입니다!</span>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-cream-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-cocoa-400 mb-1">살아온 날</p>
                  <p className="text-xl sm:text-2xl font-bold text-espresso-800">
                    {result.daysLived.toLocaleString()}
                    <span className="text-sm text-cocoa-400 ml-0.5">일</span>
                  </p>
                </div>
                <div className="bg-cream-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-cocoa-400 mb-1">살아온 주</p>
                  <p className="text-xl sm:text-2xl font-bold text-espresso-800">
                    {result.weeksLived.toLocaleString()}
                    <span className="text-sm text-cocoa-400 ml-0.5">주</span>
                  </p>
                </div>
                <div className="bg-cream-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-cocoa-400 mb-1">살아온 개월</p>
                  <p className="text-xl sm:text-2xl font-bold text-espresso-800">
                    {result.monthsLived.toLocaleString()}
                    <span className="text-sm text-cocoa-400 ml-0.5">개월</span>
                  </p>
                </div>
                <div className={`rounded-xl p-4 text-center ${result.isBirthdayToday ? 'bg-golden-50' : 'bg-cream-50'}`}>
                  <p className="text-xs text-cocoa-400 mb-1">
                    {result.isBirthdayToday ? '생일 축하!' : '다음 생일까지'}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-golden-600">
                    {result.isBirthdayToday ? '🎉' : (
                      <>
                        D-{result.daysToNextBirthday}
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* 100세까지 */}
              <div className="mt-4 bg-oatmeal-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-cocoa-500">인생 진행률 (100세 기준)</span>
                  <span className="text-xs font-bold text-espresso-700">
                    {Math.min(100, ((result.daysLived / (365.25 * 100)) * 100)).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-4 bg-white rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-moss-400 to-golden-400 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, (result.daysLived / (365.25 * 100)) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-cocoa-400 mt-1.5">
                  100세까지 <strong>{result.daysTo100.toLocaleString()}일</strong> 남았습니다
                </p>
              </div>
            </div>

            {/* ── 일수 기념일 ── */}
            <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-5 sm:p-6">
              <h3 className="text-sm font-semibold text-espresso-700 mb-4">일수 기념일</h3>
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm min-w-[350px]">
                  <thead>
                    <tr className="border-b-2 border-oatmeal-200">
                      <th className="text-left py-3 px-3 text-cocoa-500 font-semibold">기념일</th>
                      <th className="text-center py-3 px-3 text-cocoa-500 font-semibold">날짜</th>
                      <th className="text-center py-3 px-3 text-cocoa-500 font-semibold">요일</th>
                      <th className="text-center py-3 px-3 text-cocoa-500 font-semibold">상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.milestones.map((m) => {
                      const base = new Date((baseDate || todayStr) + 'T00:00:00');
                      const diffDays = Math.ceil(
                        (m.date.getTime() - base.getTime()) / (1000 * 60 * 60 * 24),
                      );
                      const isToday = diffDays === 0;
                      return (
                        <tr
                          key={m.days}
                          className={`border-b border-oatmeal-100 transition-colors ${
                            isToday
                              ? 'bg-golden-50'
                              : m.passed
                              ? 'opacity-60'
                              : 'hover:bg-cream-50/50'
                          }`}
                        >
                          <td className="py-2.5 px-3 font-medium text-espresso-700">
                            {m.days.toLocaleString()}일
                          </td>
                          <td className="py-2.5 px-3 text-center text-cocoa-600">
                            {formatDate(m.date)}
                          </td>
                          <td className="py-2.5 px-3 text-center text-cocoa-600">
                            {getDayName(m.date)}요일
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {isToday ? (
                              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-golden-100 text-golden-700">
                                오늘!
                              </span>
                            ) : m.passed ? (
                              <span className="text-xs text-cocoa-400">지남</span>
                            ) : (
                              <span className="text-xs font-medium text-moss-600">
                                D-{diffDays}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── 나이 계산 기준 안내 ── */}
            <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-5 sm:p-6">
              <h3 className="text-sm font-semibold text-espresso-700 mb-4">나이 계산 기준 비교</h3>
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm min-w-[400px]">
                  <thead>
                    <tr className="border-b-2 border-oatmeal-200">
                      <th className="text-left py-3 px-3 text-cocoa-500 font-semibold">구분</th>
                      <th className="text-center py-3 px-3 text-cocoa-500 font-semibold">계산 방식</th>
                      <th className="text-center py-3 px-3 text-cocoa-500 font-semibold">적용</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-oatmeal-100 bg-golden-50/50">
                      <td className="py-3 px-3 font-bold text-espresso-800">만나이</td>
                      <td className="py-3 px-3 text-center text-cocoa-600">
                        생일이 지났으면 (현재 연도 - 출생 연도),
                        <br className="hidden sm:block" />
                        안 지났으면 (현재 연도 - 출생 연도 - 1)
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-moss-100 text-moss-700">
                          법적 기준 (2023.6~)
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b border-oatmeal-100">
                      <td className="py-3 px-3 font-bold text-espresso-800">연나이</td>
                      <td className="py-3 px-3 text-center text-cocoa-600">현재 연도 - 출생 연도</td>
                      <td className="py-3 px-3 text-center text-xs text-cocoa-500">
                        병역법, 청소년보호법 등
                      </td>
                    </tr>
                    <tr className="border-b border-oatmeal-100">
                      <td className="py-3 px-3 font-bold text-espresso-800">한국 나이 (구)</td>
                      <td className="py-3 px-3 text-center text-cocoa-600">현재 연도 - 출생 연도 + 1</td>
                      <td className="py-3 px-3 text-center text-xs text-cocoa-500">
                        폐지 (일상 대화에서만 사용)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── 팁 ── */}
            <div className="bg-gradient-to-br from-golden-50 to-cream-100 rounded-2xl border border-golden-200 p-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-golden-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-espresso-800 mb-2">만나이 통일법 안내</h4>
                  <ul className="text-sm text-cocoa-600 space-y-1.5">
                    <li>
                      • <strong>2023년 6월 28일</strong>부터 법적·행정적 나이는 모두 <strong>만나이</strong>로
                      통일되었습니다.
                    </li>
                    <li>
                      • 다만 <strong>병역법, 청소년보호법</strong> 등 일부 법률은 여전히 <strong>연나이</strong>
                      (현재 연도 - 출생 연도)를 사용합니다.
                    </li>
                    <li>
                      • <strong>초등학교 입학 기준</strong>도 연나이(만 6세가 되는 해)를 적용합니다.
                    </li>
                    <li>
                      • 일상 대화에서 <strong>한국 나이</strong>를 쓰는 것은 자유이지만, 공식 문서에는 만나이를
                      기재해야 합니다.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}

        {/* 생년월일 미입력 또는 미래 날짜 */}
        {!result && birthDate && (
          <div className="bg-white rounded-2xl border border-oatmeal-200 p-8 text-center">
            <p className="text-cocoa-500">기준일보다 이후의 생년월일은 계산할 수 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgeCalculator;
