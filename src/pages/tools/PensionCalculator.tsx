import React, { useState, useMemo } from 'react';
import { Clock, DollarSign, Calendar, User, Info, RotateCcw } from 'lucide-react';

type PensionType = 'national' | 'personal';

const PensionCalculator: React.FC = () => {
  const [pensionType, setPensionType] = useState<PensionType>('national');

  // 국민연금
  const [currentAge, setCurrentAge] = useState<string>('35');
  const [monthlySalary, setMonthlySalary] = useState<string>('300'); // 만원
  const [joinYears, setJoinYears] = useState<string>('10'); // 기 가입 연수
  const [expectedRetireAge, setExpectedRetireAge] = useState<string>('60'); // 예상 납부 종료 나이

  // 개인연금
  const [personalMonthly, setPersonalMonthly] = useState<string>('30'); // 월 납입금 (만원)
  const [personalRate, setPersonalRate] = useState<string>('4'); // 예상 수익률
  const [personalStartAge, setPersonalStartAge] = useState<string>('35');
  const [personalPayYears, setPersonalPayYears] = useState<string>('25'); // 납입 기간
  const [personalReceiveYears, setPersonalReceiveYears] = useState<string>('20'); // 수령 기간

  // 국민연금 계산
  const nationalResult = useMemo(() => {
    const age = parseInt(currentAge) || 0;
    const salary = (parseFloat(monthlySalary) || 0) * 10000;
    const joined = parseInt(joinYears) || 0;
    const retireAge = parseInt(expectedRetireAge) || 60;

    if (age <= 0 || salary <= 0 || retireAge <= age) {
      return { monthlyPension: 0, totalYears: 0, startAge: 65, yearlyData: [] };
    }

    // 국민연금 상한/하한 (2024 기준)
    const cappedSalary = Math.min(Math.max(salary, 370000), 5900000);

    // 총 가입 연수 = 기가입 + 남은 납부 연수
    const remainYears = Math.max(retireAge - age, 0);
    const totalYears = joined + remainYears;

    // 국민연금 수령 개시 나이 (1969년 이후 출생: 65세)
    const startAge = 65;

    // 기본연금액 간이 계산 (2024 기준)
    // 기본연금액 = 가입기간 × (A값 + B값) × 가입연수별 지급률
    // A값 (전체 가입자 평균소득월액): 약 286만원 (2024)
    // B값: 본인의 가입기간 중 기준소득월액 평균
    // 지급률: 가입기간 20년 기준 약 1.2% (매년 감소 추세, 2028년 이후 40%)
    const aValue = 2860000; // 전체 가입자 평균소득월액
    const bValue = cappedSalary;

    // 연금액 = 가입월수 × (1.2/12) × (A + B) × (1 + 0.05 × (가입연수-20))
    // 간이 공식: 월 연금 ≈ (A + B) / 2 × 가입연수 × 지급률(%)
    // 2024년 지급률 약 43% → 20년 기준 월 연금 = (A+B)/2 × 0.43 × (가입연수/20)
    // 더 정확한 간이식:
    // 기본연금월액 = (A + B) × 가입연수 × 지급률계수
    // 지급률계수: 가입연수 1년당 약 1.0% (20년이면 20%, 30년이면 30%)
    // 하지만 실제로는 더 복잡. 간이 근사:
    const replacementRate = 0.012; // 1년당 약 1.2% (2024 기준)
    let monthlyPension = (aValue + bValue) / 2 * totalYears * replacementRate;

    // 최소 10년 가입해야 수령 가능
    if (totalYears < 10) {
      monthlyPension = 0;
    }

    // 연도별 수령 데이터 (65세부터 85세까지)
    const yearlyData: { age: number; annualPension: number; cumulative: number }[] = [];
    let cum = 0;
    for (let a = startAge; a <= 85; a++) {
      const annual = monthlyPension * 12;
      cum += annual;
      yearlyData.push({ age: a, annualPension: annual, cumulative: cum });
    }

    return { monthlyPension, totalYears, startAge, yearlyData };
  }, [currentAge, monthlySalary, joinYears, expectedRetireAge]);

  // 개인연금 계산
  const personalResult = useMemo(() => {
    const monthly = (parseFloat(personalMonthly) || 0) * 10000;
    const rate = (parseFloat(personalRate) || 0) / 100;
    const monthlyRate = rate / 12;
    const startAge = parseInt(personalStartAge) || 35;
    const payYears = parseInt(personalPayYears) || 25;
    const receiveYears = parseInt(personalReceiveYears) || 20;

    if (monthly <= 0 || payYears <= 0 || receiveYears <= 0) {
      return { totalSaved: 0, totalInvested: 0, investReturn: 0, monthlyPension: 0, receiveStartAge: 60, yearlyData: [] };
    }

    const payMonths = payYears * 12;
    const receiveStartAge = startAge + payYears;

    // 적립 기간: 매월 납입 + 복리
    let balance = 0;
    for (let i = 0; i < payMonths; i++) {
      balance = (balance + monthly) * (1 + monthlyRate);
    }

    const totalInvested = monthly * payMonths;
    const investReturn = balance - totalInvested;

    // 수령 기간: 잔액을 복리 운용하면서 매월 인출
    // 월 수령액 = 잔액 × r(1+r)^n / ((1+r)^n - 1) (연금현가계수의 역수)
    const receiveMonths = receiveYears * 12;
    const receiveRate = monthlyRate * 0.7; // 수령 기간 보수적 운용 (적립기의 70%)
    let monthlyPension: number;
    if (receiveRate > 0) {
      monthlyPension = balance * (receiveRate * Math.pow(1 + receiveRate, receiveMonths)) /
        (Math.pow(1 + receiveRate, receiveMonths) - 1);
    } else {
      monthlyPension = balance / receiveMonths;
    }

    // 연도별 데이터
    const yearlyData: { age: number; annualPension: number; remaining: number }[] = [];
    let rem = balance;
    for (let y = 0; y < receiveYears; y++) {
      const annualPay = monthlyPension * 12;
      for (let m = 0; m < 12; m++) {
        rem = rem * (1 + receiveRate) - monthlyPension;
      }
      yearlyData.push({
        age: receiveStartAge + y,
        annualPension: annualPay,
        remaining: Math.max(rem, 0),
      });
    }

    return { totalSaved: balance, totalInvested, investReturn, monthlyPension, receiveStartAge, yearlyData };
  }, [personalMonthly, personalRate, personalStartAge, personalPayYears, personalReceiveYears]);

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
    setCurrentAge('35');
    setMonthlySalary('300');
    setJoinYears('10');
    setExpectedRetireAge('60');
    setPersonalMonthly('30');
    setPersonalRate('4');
    setPersonalStartAge('35');
    setPersonalPayYears('25');
    setPersonalReceiveYears('20');
  };

  return (
    <>
      <SEOHead
        title="연금 수령액 계산기"
        description="국민연금 예상 수령액을 계산합니다. 가입 기간, 평균 소득에 따른 월 수령액과 총 수령액을 확인하세요."
        url="/tools/pension"
      />
      <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-golden-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-espresso-800 to-espresso-950 text-white py-16 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-golden-100 rounded-2xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-espresso-800" />
            </div>
            <span className="text-golden-200 text-sm font-medium tracking-wider uppercase">부자타임 도구</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">연금 수령액 계산기</h1>
          <p className="text-oatmeal-300 text-lg max-w-2xl">
            국민연금 예상 수령액과 개인연금 시뮬레이션으로 노후를 미리 설계하세요.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-6 py-10">
        <div className="grid lg:grid-cols-5 gap-8">

          {/* 입력 패널 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-espresso-800">연금 정보 입력</h2>
                <button
                  onClick={handleReset}
                  className="text-cocoa-500 hover:text-cocoa-700 transition-colors p-1.5 rounded-lg hover:bg-oatmeal-100"
                  title="초기화"
                >
                  <RotateCcw size={18} />
                </button>
              </div>

              {/* 연금 유형 */}
              <div className="mb-5">
                <label className="text-sm font-semibold text-espresso-700 mb-3 block">연금 유형</label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { key: 'national' as PensionType, label: '국민연금', desc: '의무가입' },
                    { key: 'personal' as PensionType, label: '개인연금', desc: '자유 적립' },
                  ]).map((p) => (
                    <button
                      key={p.key}
                      onClick={() => setPensionType(p.key)}
                      className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all border-2 ${
                        pensionType === p.key
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

              {pensionType === 'national' ? (
                <div className="space-y-5">
                  {/* 현재 나이 */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-espresso-700 mb-2">
                      <User size={16} className="text-golden-500" />
                      현재 나이
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={currentAge}
                        onChange={(e) => setCurrentAge(e.target.value)}
                        className="w-full px-4 py-3 pr-8 border-2 border-oatmeal-200 rounded-xl focus:border-golden-400 focus:ring-2 focus:ring-golden-100 outline-none transition-all text-lg font-medium text-espresso-800"
                        min="18" max="64"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-cocoa-400 font-medium">세</span>
                    </div>
                  </div>

                  {/* 월 소득 */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-espresso-700 mb-2">
                      <DollarSign size={16} className="text-golden-500" />
                      월 소득 (세전)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={monthlySalary}
                        onChange={(e) => setMonthlySalary(e.target.value)}
                        className="w-full px-4 py-3 pr-12 border-2 border-oatmeal-200 rounded-xl focus:border-golden-400 focus:ring-2 focus:ring-golden-100 outline-none transition-all text-lg font-medium text-espresso-800"
                        min="0"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-cocoa-400 font-medium">만원</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {[200, 300, 400, 500].map((v) => (
                        <button
                          key={v}
                          onClick={() => setMonthlySalary(v.toString())}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                            monthlySalary === v.toString()
                              ? 'bg-golden-100 text-espresso-800 border border-golden-300'
                              : 'bg-oatmeal-100 text-cocoa-500 hover:bg-oatmeal-200 border border-transparent'
                          }`}
                        >
                          {v}만원
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 기 가입 연수 */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-espresso-700 mb-2">
                      <Calendar size={16} className="text-golden-500" />
                      기 가입 연수
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={joinYears}
                        onChange={(e) => setJoinYears(e.target.value)}
                        className="w-full px-4 py-3 pr-8 border-2 border-oatmeal-200 rounded-xl focus:border-golden-400 focus:ring-2 focus:ring-golden-100 outline-none transition-all text-lg font-medium text-espresso-800"
                        min="0" max="40"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-cocoa-400 font-medium">년</span>
                    </div>
                    <p className="text-xs text-cocoa-400 mt-1 ml-1">지금까지 납부한 기간</p>
                  </div>

                  {/* 예상 납부 종료 나이 */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-espresso-700 mb-2">
                      <Calendar size={16} className="text-golden-500" />
                      납부 종료 나이
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={expectedRetireAge}
                        onChange={(e) => setExpectedRetireAge(e.target.value)}
                        className="w-full px-4 py-3 pr-8 border-2 border-oatmeal-200 rounded-xl focus:border-golden-400 focus:ring-2 focus:ring-golden-100 outline-none transition-all text-lg font-medium text-espresso-800"
                        min="40" max="65"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-cocoa-400 font-medium">세</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {[55, 58, 60, 65].map((v) => (
                        <button
                          key={v}
                          onClick={() => setExpectedRetireAge(v.toString())}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                            expectedRetireAge === v.toString()
                              ? 'bg-golden-100 text-espresso-800 border border-golden-300'
                              : 'bg-oatmeal-100 text-cocoa-500 hover:bg-oatmeal-200 border border-transparent'
                          }`}
                        >
                          {v}세
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* 월 납입금 */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-espresso-700 mb-2">
                      <DollarSign size={16} className="text-golden-500" />
                      월 납입금
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={personalMonthly}
                        onChange={(e) => setPersonalMonthly(e.target.value)}
                        className="w-full px-4 py-3 pr-12 border-2 border-oatmeal-200 rounded-xl focus:border-golden-400 focus:ring-2 focus:ring-golden-100 outline-none transition-all text-lg font-medium text-espresso-800"
                        min="0"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-cocoa-400 font-medium">만원</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {[10, 20, 30, 50].map((v) => (
                        <button
                          key={v}
                          onClick={() => setPersonalMonthly(v.toString())}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                            personalMonthly === v.toString()
                              ? 'bg-golden-100 text-espresso-800 border border-golden-300'
                              : 'bg-oatmeal-100 text-cocoa-500 hover:bg-oatmeal-200 border border-transparent'
                          }`}
                        >
                          {v}만원
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 예상 수익률 */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-espresso-700 mb-2">
                      <Percent size={16} className="text-golden-500" />
                      예상 수익률
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={personalRate}
                        onChange={(e) => setPersonalRate(e.target.value)}
                        className="w-full px-4 py-3 pr-8 border-2 border-oatmeal-200 rounded-xl focus:border-golden-400 focus:ring-2 focus:ring-golden-100 outline-none transition-all text-lg font-medium text-espresso-800"
                        min="0" max="15" step="0.5"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-cocoa-400 font-medium">%</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {[2, 3, 4, 5, 7].map((v) => (
                        <button
                          key={v}
                          onClick={() => setPersonalRate(v.toString())}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                            personalRate === v.toString()
                              ? 'bg-golden-100 text-espresso-800 border border-golden-300'
                              : 'bg-oatmeal-100 text-cocoa-500 hover:bg-oatmeal-200 border border-transparent'
                          }`}
                        >
                          {v}%
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 현재 나이 */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-espresso-700 mb-2">
                      <User size={16} className="text-golden-500" />
                      현재 나이
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={personalStartAge}
                        onChange={(e) => setPersonalStartAge(e.target.value)}
                        className="w-full px-4 py-3 pr-8 border-2 border-oatmeal-200 rounded-xl focus:border-golden-400 focus:ring-2 focus:ring-golden-100 outline-none transition-all text-lg font-medium text-espresso-800"
                        min="20" max="60"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-cocoa-400 font-medium">세</span>
                    </div>
                  </div>

                  {/* 납입 기간 */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-espresso-700 mb-2">
                      <Calendar size={16} className="text-golden-500" />
                      납입 기간
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={personalPayYears}
                        onChange={(e) => setPersonalPayYears(e.target.value)}
                        className="w-full px-4 py-3 pr-8 border-2 border-oatmeal-200 rounded-xl focus:border-golden-400 focus:ring-2 focus:ring-golden-100 outline-none transition-all text-lg font-medium text-espresso-800"
                        min="1" max="40"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-cocoa-400 font-medium">년</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {[10, 15, 20, 25, 30].map((v) => (
                        <button
                          key={v}
                          onClick={() => setPersonalPayYears(v.toString())}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                            personalPayYears === v.toString()
                              ? 'bg-golden-100 text-espresso-800 border border-golden-300'
                              : 'bg-oatmeal-100 text-cocoa-500 hover:bg-oatmeal-200 border border-transparent'
                          }`}
                        >
                          {v}년
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 수령 기간 */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-espresso-700 mb-2">
                      <Calendar size={16} className="text-golden-500" />
                      수령 기간
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={personalReceiveYears}
                        onChange={(e) => setPersonalReceiveYears(e.target.value)}
                        className="w-full px-4 py-3 pr-8 border-2 border-oatmeal-200 rounded-xl focus:border-golden-400 focus:ring-2 focus:ring-golden-100 outline-none transition-all text-lg font-medium text-espresso-800"
                        min="5" max="40"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-cocoa-400 font-medium">년</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {[10, 15, 20, 25].map((v) => (
                        <button
                          key={v}
                          onClick={() => setPersonalReceiveYears(v.toString())}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                            personalReceiveYears === v.toString()
                              ? 'bg-golden-100 text-espresso-800 border border-golden-300'
                              : 'bg-oatmeal-100 text-cocoa-500 hover:bg-oatmeal-200 border border-transparent'
                          }`}
                        >
                          {v}년
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 결과 패널 */}
          <div className="lg:col-span-3 space-y-6">

            {pensionType === 'national' ? (
              <>
                {/* 국민연금 핵심 결과 */}
                <div className="bg-gradient-to-br from-espresso-800 to-espresso-950 rounded-2xl p-6 text-white shadow-xl">
                  <h3 className="text-sm font-medium text-golden-200 mb-4 tracking-wider uppercase">
                    국민연금 예상 월 수령액
                  </h3>
                  <div className="text-4xl md:text-5xl font-bold mb-2 text-golden-100">
                    {nationalResult.monthlyPension > 0 ? formatWon(nationalResult.monthlyPension) : '수령 불가'}
                  </div>
                  <p className="text-oatmeal-300 text-sm mb-6">
                    {nationalResult.totalYears >= 10
                      ? `${nationalResult.startAge}세부터 수령 · 총 가입 ${nationalResult.totalYears}년`
                      : '최소 가입 기간 10년 미만 — 가입 기간을 늘려보세요'}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                      <p className="text-xs text-oatmeal-300 mb-1">총 가입 기간</p>
                      <p className="text-base sm:text-lg font-bold">{nationalResult.totalYears}년</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                      <p className="text-xs text-golden-200 mb-1">연 수령액</p>
                      <p className="text-base sm:text-lg font-bold text-golden-100">
                        {formatKRW(nationalResult.monthlyPension * 12)}
                      </p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                      <p className="text-xs text-oatmeal-300 mb-1">수령 개시</p>
                      <p className="text-base sm:text-lg font-bold">{nationalResult.startAge}세</p>
                    </div>
                  </div>
                </div>

                {/* 누적 수령액 차트 */}
                <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-6">
                  <h3 className="text-sm font-semibold text-espresso-700 mb-4">연령별 누적 수령액</h3>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {(() => {
                      const max = nationalResult.yearlyData.length > 0
                        ? nationalResult.yearlyData[nationalResult.yearlyData.length - 1].cumulative
                        : 1;
                      return nationalResult.yearlyData.map((d) => (
                        <div key={d.age} className="flex items-center gap-3 group">
                          <span className="text-xs text-cocoa-400 w-10 text-right font-mono shrink-0">{d.age}세</span>
                          <div className="flex-1 h-6 rounded-md overflow-hidden bg-oatmeal-50">
                            <div
                              className="bg-gradient-to-r from-cocoa-300 to-golden-400 h-full transition-all duration-500"
                              style={{ width: `${(d.cumulative / max) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-espresso-700 w-24 text-right shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            {formatKRW(d.cumulative)}
                          </span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* 연령별 테이블 */}
                <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-6">
                  <h3 className="text-sm font-semibold text-espresso-700 mb-4">연령별 수령 상세</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b-2 border-oatmeal-200">
                          <th className="text-left py-3 px-2 text-cocoa-500 font-semibold">나이</th>
                          <th className="text-right py-3 px-2 text-cocoa-500 font-semibold">연간 수령</th>
                          <th className="text-right py-3 px-2 text-cocoa-500 font-semibold">누적 수령</th>
                        </tr>
                      </thead>
                      <tbody>
                        {nationalResult.yearlyData.filter((_, i) => i % 5 === 0 || i === nationalResult.yearlyData.length - 1).map((d) => (
                          <tr key={d.age} className="border-b border-oatmeal-100 hover:bg-cream-50 transition-colors">
                            <td className="py-2.5 px-2 text-espresso-700 font-medium">{d.age}세</td>
                            <td className="py-2.5 px-2 text-right text-golden-600 font-medium">{formatKRW(d.annualPension)}</td>
                            <td className="py-2.5 px-2 text-right text-espresso-800 font-bold">{formatKRW(d.cumulative)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* 개인연금 핵심 결과 */}
                <div className="bg-gradient-to-br from-espresso-800 to-espresso-950 rounded-2xl p-6 text-white shadow-xl">
                  <h3 className="text-sm font-medium text-golden-200 mb-4 tracking-wider uppercase">
                    개인연금 예상 월 수령액
                  </h3>
                  <div className="text-4xl md:text-5xl font-bold mb-2 text-golden-100">
                    {formatWon(personalResult.monthlyPension)}
                  </div>
                  <p className="text-oatmeal-300 text-sm mb-6">
                    {personalResult.receiveStartAge}세부터 {parseInt(personalReceiveYears)}년간 수령
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white/10 rounded-xl p-3 sm:p-4 backdrop-blur-sm">
                      <p className="text-xs text-oatmeal-300 mb-1">총 납입금</p>
                      <p className="text-sm sm:text-base font-bold">{formatKRW(personalResult.totalInvested)}</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3 sm:p-4 backdrop-blur-sm">
                      <p className="text-xs text-golden-200 mb-1">투자 수익</p>
                      <p className="text-sm sm:text-base font-bold text-golden-100">{formatKRW(personalResult.investReturn)}</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3 sm:p-4 backdrop-blur-sm">
                      <p className="text-xs text-oatmeal-300 mb-1">적립 총액</p>
                      <p className="text-sm sm:text-base font-bold">{formatKRW(personalResult.totalSaved)}</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3 sm:p-4 backdrop-blur-sm">
                      <p className="text-xs text-golden-200 mb-1">수령 개시</p>
                      <p className="text-sm sm:text-base font-bold text-golden-100">{personalResult.receiveStartAge}세</p>
                    </div>
                  </div>
                </div>

                {/* 납입 vs 수익 비율 */}
                <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-6">
                  <h3 className="text-sm font-semibold text-espresso-700 mb-4">납입금 vs 투자 수익</h3>
                  <div className="w-full h-8 rounded-full overflow-hidden flex bg-oatmeal-100">
                    {personalResult.totalSaved > 0 && (
                      <>
                        <div
                          className="bg-cocoa-400 h-full transition-all duration-700 ease-out flex items-center justify-center"
                          style={{ width: `${(personalResult.totalInvested / personalResult.totalSaved) * 100}%` }}
                        >
                          {(personalResult.totalInvested / personalResult.totalSaved) * 100 > 15 && (
                            <span className="text-xs text-white font-medium">
                              {((personalResult.totalInvested / personalResult.totalSaved) * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>
                        <div
                          className="bg-gradient-to-r from-golden-400 to-golden-500 h-full transition-all duration-700 ease-out flex items-center justify-center"
                          style={{ width: `${(personalResult.investReturn / personalResult.totalSaved) * 100}%` }}
                        >
                          {(personalResult.investReturn / personalResult.totalSaved) * 100 > 10 && (
                            <span className="text-xs text-white font-medium">
                              {((personalResult.investReturn / personalResult.totalSaved) * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex justify-between mt-3 text-xs text-cocoa-500">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-cocoa-400"></div>
                      <span>납입금</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-golden-400"></div>
                      <span>투자 수익</span>
                    </div>
                  </div>
                </div>

                {/* 연도별 잔액 추이 */}
                <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-6">
                  <h3 className="text-sm font-semibold text-espresso-700 mb-4">수령 기간 잔액 추이</h3>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {(() => {
                      const max = personalResult.totalSaved || 1;
                      return personalResult.yearlyData.map((d) => (
                        <div key={d.age} className="flex items-center gap-3 group">
                          <span className="text-xs text-cocoa-400 w-10 text-right font-mono shrink-0">{d.age}세</span>
                          <div className="flex-1 h-6 rounded-md overflow-hidden bg-oatmeal-50">
                            <div
                              className="bg-gradient-to-r from-cocoa-300 to-cocoa-400 h-full transition-all duration-500"
                              style={{ width: `${(d.remaining / max) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-espresso-700 w-24 text-right shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            {formatKRW(d.remaining)}
                          </span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* 테이블 */}
                <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-6">
                  <h3 className="text-sm font-semibold text-espresso-700 mb-4">연도별 수령 상세</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b-2 border-oatmeal-200">
                          <th className="text-left py-3 px-2 text-cocoa-500 font-semibold">나이</th>
                          <th className="text-right py-3 px-2 text-cocoa-500 font-semibold">연 수령액</th>
                          <th className="text-right py-3 px-2 text-cocoa-500 font-semibold">잔여 적립금</th>
                        </tr>
                      </thead>
                      <tbody>
                        {personalResult.yearlyData.map((d) => (
                          <tr key={d.age} className="border-b border-oatmeal-100 hover:bg-cream-50 transition-colors">
                            <td className="py-2.5 px-2 text-espresso-700 font-medium">{d.age}세</td>
                            <td className="py-2.5 px-2 text-right text-golden-600 font-medium">{formatKRW(d.annualPension)}</td>
                            <td className="py-2.5 px-2 text-right text-espresso-800 font-bold">{formatKRW(d.remaining)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* Tip */}
            <div className="bg-gradient-to-br from-golden-50 to-cream-100 rounded-2xl border border-golden-200 p-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-golden-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-espresso-800 mb-2">💡 연금 설계 팁</h4>
                  {pensionType === 'national' ? (
                    <ul className="text-sm text-cocoa-600 space-y-1.5">
                      <li>• 국민연금은 <strong>최소 10년</strong> 이상 가입해야 수령 가능합니다.</li>
                      <li>• 가입 기간이 길수록, 소득이 높을수록 수령액이 늘어납니다.</li>
                      <li>• <strong>65세</strong>부터 수령 (1969년 이후 출생 기준)이며, 조기수령 시 감액됩니다.</li>
                      <li>• 본 계산은 <strong>간이 추정치</strong>이며, 정확한 금액은 국민연금공단에서 확인하세요.</li>
                      <li>• 물가 상승률에 따라 실제 수령액은 매년 조정됩니다.</li>
                    </ul>
                  ) : (
                    <ul className="text-sm text-cocoa-600 space-y-1.5">
                      <li>• 개인연금은 <strong>세액공제</strong> 혜택이 있어 절세 효과가 큽니다 (연 최대 900만원).</li>
                      <li>• <strong>일찍 시작할수록</strong> 복리 효과가 극대화됩니다.</li>
                      <li>• 수령 기간을 <strong>길게 설정</strong>하면 월 수령액은 줄지만 안정적입니다.</li>
                      <li>• 연금저축 + IRP를 합쳐 <strong>최대 900만원</strong>까지 세액공제 가능합니다.</li>
                      <li>• 55세 이후 연금으로 수령 시 <strong>낮은 연금소득세</strong>(3.3~5.5%)가 적용됩니다.</li>
                    </ul>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  
    </>);
};

export default PensionCalculator;
