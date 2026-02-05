import React, { useState, useMemo } from 'react';
import {
  RefreshCw,
  ArrowRight,
  TrendingDown,
  Calendar,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';

/* ---------- types ---------- */
type RepaymentMethod = 'equal_principal_interest' | 'equal_principal' | 'bullet';

interface LoanInput {
  balance: number;        // 잔액 (만원)
  rate: number;           // 연이율 (%)
  remainMonths: number;   // 잔여 개월
  method: RepaymentMethod;
}

interface RefinanceCost {
  earlyRepayFeeRate: number; // 중도상환수수료율 (%)
  stampTax: number;          // 인지세 (만원)
  mortgageFee: number;       // 근저당 설정비 (만원)
  otherFees: number;         // 기타 비용 (만원)
}

interface MonthlyRow {
  month: number;
  principal: number;
  interest: number;
  payment: number;
  remaining: number;
}

/* ---------- helpers ---------- */
const fmt = (n: number) => n.toLocaleString('ko-KR');
const fmtWon = (n: number) => {
  if (Math.abs(n) >= 10000) return `${fmt(Math.round(n / 10000))}억 ${fmt(Math.round(n % 10000))}만원`;
  return `${fmt(Math.round(n))}만원`;
};

function buildSchedule(balance: number, rate: number, months: number, method: RepaymentMethod): MonthlyRow[] {
  const rows: MonthlyRow[] = [];
  const monthRate = rate / 100 / 12;
  let remaining = balance;

  for (let m = 1; m <= months; m++) {
    const interest = remaining * monthRate;
    let principal = 0;
    let payment = 0;

    if (method === 'equal_principal_interest') {
      if (monthRate === 0) {
        payment = balance / months;
        principal = payment;
      } else {
        payment = balance * monthRate * Math.pow(1 + monthRate, months) / (Math.pow(1 + monthRate, months) - 1);
        principal = payment - interest;
      }
    } else if (method === 'equal_principal') {
      principal = balance / months;
      payment = principal + interest;
    } else {
      // bullet (만기일시)
      principal = m === months ? balance : 0;
      payment = interest + principal;
    }

    remaining = Math.max(0, remaining - principal);
    rows.push({ month: m, principal, interest, payment, remaining });
  }
  return rows;
}

function calcTotalInterest(schedule: MonthlyRow[]): number {
  return schedule.reduce((s, r) => s + r.interest, 0);
}

function calcTotalPayment(schedule: MonthlyRow[]): number {
  return schedule.reduce((s, r) => s + r.payment, 0);
}

/* ---------- constants ---------- */
const methodLabels: Record<RepaymentMethod, string> = {
  equal_principal_interest: '원리금균등',
  equal_principal: '원금균등',
  bullet: '만기일시',
};

/* ---------- component ---------- */
const LoanRefinanceCalculator: React.FC = () => {
  /* state: 기존 대출 */
  const [current, setCurrent] = useState<LoanInput>({
    balance: 30000,
    rate: 5.5,
    remainMonths: 240,
    method: 'equal_principal_interest',
  });

  /* state: 신규 대출 */
  const [newLoan, setNewLoan] = useState<LoanInput>({
    balance: 30000,
    rate: 3.8,
    remainMonths: 240,
    method: 'equal_principal_interest',
  });

  /* state: 갈아타기 비용 */
  const [costs, setCosts] = useState<RefinanceCost>({
    earlyRepayFeeRate: 1.2,
    stampTax: 15,
    mortgageFee: 50,
    otherFees: 10,
  });

  const [showSchedule, setShowSchedule] = useState(false);

  /* 계산 */
  const result = useMemo(() => {
    const curSchedule = buildSchedule(current.balance, current.rate, current.remainMonths, current.method);
    const newSchedule = buildSchedule(newLoan.balance, newLoan.rate, newLoan.remainMonths, newLoan.method);

    const curTotalInterest = calcTotalInterest(curSchedule);
    const newTotalInterest = calcTotalInterest(newSchedule);

    const curTotalPayment = calcTotalPayment(curSchedule);
    const newTotalPayment = calcTotalPayment(newSchedule);

    const curMonthly = curSchedule[0]?.payment ?? 0;
    const newMonthly = newSchedule[0]?.payment ?? 0;

    // 갈아타기 비용
    const earlyRepayFee = current.balance * (costs.earlyRepayFeeRate / 100);
    const totalRefinanceCost = earlyRepayFee + costs.stampTax + costs.mortgageFee + costs.otherFees;

    // 이자 절감
    const interestSaved = curTotalInterest - newTotalInterest;
    const netSaved = interestSaved - totalRefinanceCost;

    // 손익분기 (월 상환액 차이로 계산)
    const monthlySaved = curMonthly - newMonthly;
    const breakEvenMonths = monthlySaved > 0 ? Math.ceil(totalRefinanceCost / monthlySaved) : -1;

    return {
      curSchedule,
      newSchedule,
      curTotalInterest,
      newTotalInterest,
      curTotalPayment,
      newTotalPayment,
      curMonthly,
      newMonthly,
      earlyRepayFee,
      totalRefinanceCost,
      interestSaved,
      netSaved,
      monthlySaved,
      breakEvenMonths,
    };
  }, [current, newLoan, costs]);

  const isWorthIt = result.netSaved > 0;

  /* input helper */
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

  const selectInput = (value: RepaymentMethod, onChange: (v: RepaymentMethod) => void) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as RepaymentMethod)}
      className="w-full border-2 border-oatmeal-200 rounded-xl px-4 py-3 focus:border-espresso-400 focus:outline-none transition-colors bg-white text-base"
    >
      {(Object.keys(methodLabels) as RepaymentMethod[]).map((m) => (
        <option key={m} value={m}>{methodLabels[m]}</option>
      ))}
    </select>
  );

  /* 대출 조건 입력 패널 */
  const loanPanel = (
    label: string,
    color: string,
    loan: LoanInput,
    setLoan: React.Dispatch<React.SetStateAction<LoanInput>>,
    editable: boolean
  ) => (
    <div className={`bg-white rounded-2xl border-2 ${color} p-5`}>
      <h3 className="text-lg font-bold text-slate-800 mb-4">{label}</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5">대출 잔액</label>
          {numInput(loan.balance, (v) => setLoan((p) => ({ ...p, balance: v })), { min: 0, suffix: '만원' })}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5">연이율</label>
          {numInput(loan.rate, (v) => setLoan((p) => ({ ...p, rate: v })), { min: 0, max: 30, step: 0.1, suffix: '%' })}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5">
            {editable ? '대출 기간' : '잔여 기간'}
          </label>
          {numInput(loan.remainMonths, (v) => setLoan((p) => ({ ...p, remainMonths: v })), { min: 1, max: 600, suffix: '개월' })}
          <p className="text-xs text-slate-400 mt-1">
            = {Math.floor(loan.remainMonths / 12)}년 {loan.remainMonths % 12}개월
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5">상환 방식</label>
          {selectInput(loan.method, (v) => setLoan((p) => ({ ...p, method: v })))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero */}
      <section className="bg-gradient-to-r from-espresso-800 to-espresso-950 text-white pt-28 pb-12 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <RefreshCw size={22} />
            </div>
            <span className="text-oatmeal-300 text-sm font-medium">부자타임 도구</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">대출 갈아타기 비교기</h1>
          <p className="text-oatmeal-300 text-base md:text-lg">
            기존 대출과 신규 대출 조건을 비교해 갈아타기가 유리한지 한눈에 확인하세요.
          </p>
        </div>
      </section>

      {/* Main */}
      <section className="px-4 sm:px-6 py-8 lg:py-12">
        <div className="container mx-auto max-w-6xl">

          {/* 입력 패널 그리드 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* 기존 대출 */}
            {loanPanel('📌 기존 대출', 'border-slate-200', current, setCurrent, false)}

            {/* 갈아타기 비용 */}
            <div className="bg-white rounded-2xl border-2 border-amber-200 p-5">
              <h3 className="text-lg font-bold text-slate-800 mb-4">💰 갈아타기 비용</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">중도상환수수료율</label>
                  {numInput(costs.earlyRepayFeeRate, (v) => setCosts((p) => ({ ...p, earlyRepayFeeRate: v })), { min: 0, max: 5, step: 0.1, suffix: '%' })}
                  <p className="text-xs text-slate-400 mt-1">
                    = {fmtWon(Math.round(current.balance * (costs.earlyRepayFeeRate / 100)))}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">인지세</label>
                  {numInput(costs.stampTax, (v) => setCosts((p) => ({ ...p, stampTax: v })), { min: 0, suffix: '만원' })}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">근저당 설정비</label>
                  {numInput(costs.mortgageFee, (v) => setCosts((p) => ({ ...p, mortgageFee: v })), { min: 0, suffix: '만원' })}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">기타 비용</label>
                  {numInput(costs.otherFees, (v) => setCosts((p) => ({ ...p, otherFees: v })), { min: 0, suffix: '만원' })}
                </div>
                <div className="pt-2 border-t border-amber-100">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-600">총 비용</span>
                    <span className="text-lg font-bold text-amber-700">{fmtWon(Math.round(result.totalRefinanceCost))}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 신규 대출 */}
            {loanPanel('🆕 신규 대출', 'border-moss-200', newLoan, setNewLoan, true)}
          </div>

          {/* 핵심 결과 카드 */}
          <div className={`rounded-2xl p-6 sm:p-8 mb-8 ${isWorthIt
            ? 'bg-gradient-to-r from-moss-700 to-moss-900 text-white'
            : 'bg-gradient-to-r from-red-600 to-red-800 text-white'
            }`}>
            <div className="flex items-center gap-3 mb-6">
              {isWorthIt ? <CheckCircle2 size={28} /> : <XCircle size={28} />}
              <h2 className="text-xl sm:text-2xl font-bold">
                {isWorthIt ? '갈아타기 유리합니다!' : '갈아타기가 불리합니다'}
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-sm opacity-80 mb-1">순 절감액</p>
                <p className={`text-xl sm:text-2xl font-bold ${result.netSaved >= 0 ? '' : 'text-red-200'}`}>
                  {result.netSaved >= 0 ? '+' : ''}{fmtWon(Math.round(result.netSaved))}
                </p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-sm opacity-80 mb-1">이자 절감</p>
                <p className="text-xl sm:text-2xl font-bold">{fmtWon(Math.round(result.interestSaved))}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-sm opacity-80 mb-1">월 절감액</p>
                <p className="text-xl sm:text-2xl font-bold">
                  {result.monthlySaved >= 0 ? '+' : ''}{fmtWon(Math.round(result.monthlySaved))}
                </p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-sm opacity-80 mb-1">손익분기</p>
                <p className="text-xl sm:text-2xl font-bold">
                  {result.breakEvenMonths > 0
                    ? `${result.breakEvenMonths}개월`
                    : result.monthlySaved <= 0 ? '해당없음' : '즉시'}
                </p>
              </div>
            </div>

            {result.breakEvenMonths > 0 && (
              <p className="mt-4 text-sm opacity-80 flex items-center gap-2">
                <Info size={14} />
                갈아타기 비용({fmtWon(Math.round(result.totalRefinanceCost))})을 월 절감액({fmtWon(Math.round(result.monthlySaved))})으로 회수하는 데 {result.breakEvenMonths}개월 소요
              </p>
            )}
          </div>

          {/* 상세 비교 테이블 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-8 mb-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <TrendingDown size={20} className="text-moss-600" />
              상세 비교
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left py-3 px-2 font-medium text-slate-500">항목</th>
                    <th className="text-right py-3 px-2 font-medium text-slate-500">기존 대출</th>
                    <th className="text-right py-3 px-2 font-medium text-slate-500">신규 대출</th>
                    <th className="text-right py-3 px-2 font-medium text-moss-600">차이</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 px-2 text-slate-700">연이율</td>
                    <td className="py-3 px-2 text-right font-medium">{current.rate}%</td>
                    <td className="py-3 px-2 text-right font-medium">{newLoan.rate}%</td>
                    <td className={`py-3 px-2 text-right font-bold ${newLoan.rate < current.rate ? 'text-moss-600' : 'text-red-500'}`}>
                      {(newLoan.rate - current.rate) > 0 ? '+' : ''}{(newLoan.rate - current.rate).toFixed(1)}%p
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-2 text-slate-700">상환 방식</td>
                    <td className="py-3 px-2 text-right">{methodLabels[current.method]}</td>
                    <td className="py-3 px-2 text-right">{methodLabels[newLoan.method]}</td>
                    <td className="py-3 px-2 text-right text-slate-400">-</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-2 text-slate-700">상환 기간</td>
                    <td className="py-3 px-2 text-right">{Math.floor(current.remainMonths / 12)}년 {current.remainMonths % 12}개월</td>
                    <td className="py-3 px-2 text-right">{Math.floor(newLoan.remainMonths / 12)}년 {newLoan.remainMonths % 12}개월</td>
                    <td className="py-3 px-2 text-right text-slate-500">{newLoan.remainMonths - current.remainMonths}개월</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-2 text-slate-700">월 상환액</td>
                    <td className="py-3 px-2 text-right font-medium">{fmtWon(Math.round(result.curMonthly))}</td>
                    <td className="py-3 px-2 text-right font-medium">{fmtWon(Math.round(result.newMonthly))}</td>
                    <td className={`py-3 px-2 text-right font-bold ${result.monthlySaved >= 0 ? 'text-moss-600' : 'text-red-500'}`}>
                      {result.monthlySaved >= 0 ? '-' : '+'}{fmtWon(Math.abs(Math.round(result.monthlySaved)))}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-2 text-slate-700">총 이자</td>
                    <td className="py-3 px-2 text-right font-medium">{fmtWon(Math.round(result.curTotalInterest))}</td>
                    <td className="py-3 px-2 text-right font-medium">{fmtWon(Math.round(result.newTotalInterest))}</td>
                    <td className={`py-3 px-2 text-right font-bold ${result.interestSaved >= 0 ? 'text-moss-600' : 'text-red-500'}`}>
                      {result.interestSaved >= 0 ? '-' : '+'}{fmtWon(Math.abs(Math.round(result.interestSaved)))}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-2 text-slate-700">총 상환액</td>
                    <td className="py-3 px-2 text-right font-medium">{fmtWon(Math.round(result.curTotalPayment))}</td>
                    <td className="py-3 px-2 text-right font-medium">{fmtWon(Math.round(result.newTotalPayment))}</td>
                    <td className={`py-3 px-2 text-right font-bold ${result.curTotalPayment >= result.newTotalPayment ? 'text-moss-600' : 'text-red-500'}`}>
                      {result.curTotalPayment >= result.newTotalPayment ? '-' : '+'}{fmtWon(Math.abs(Math.round(result.curTotalPayment - result.newTotalPayment)))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 갈아타기 비용 상세 */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-5 sm:p-8 mb-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Wallet size={20} className="text-amber-600" />
              갈아타기 비용 상세
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex justify-between items-center bg-white/60 rounded-xl px-4 py-3">
                <span className="text-sm text-slate-600">중도상환수수료</span>
                <span className="font-semibold text-slate-800">
                  {fmtWon(Math.round(result.earlyRepayFee))}
                  <span className="text-xs text-slate-400 ml-1">({costs.earlyRepayFeeRate}%)</span>
                </span>
              </div>
              <div className="flex justify-between items-center bg-white/60 rounded-xl px-4 py-3">
                <span className="text-sm text-slate-600">인지세</span>
                <span className="font-semibold text-slate-800">{fmtWon(costs.stampTax)}</span>
              </div>
              <div className="flex justify-between items-center bg-white/60 rounded-xl px-4 py-3">
                <span className="text-sm text-slate-600">근저당 설정비</span>
                <span className="font-semibold text-slate-800">{fmtWon(costs.mortgageFee)}</span>
              </div>
              <div className="flex justify-between items-center bg-white/60 rounded-xl px-4 py-3">
                <span className="text-sm text-slate-600">기타 비용</span>
                <span className="font-semibold text-slate-800">{fmtWon(costs.otherFees)}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-amber-200 flex justify-between items-center">
              <span className="font-bold text-slate-800">총 갈아타기 비용</span>
              <span className="text-xl font-bold text-amber-700">{fmtWon(Math.round(result.totalRefinanceCost))}</span>
            </div>
          </div>

          {/* 손익분기 시각화 */}
          {result.breakEvenMonths > 0 && result.monthlySaved > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-8 mb-8">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Calendar size={20} className="text-espresso-600" />
                손익분기 시점
              </h3>
              <div className="relative">
                {/* 바 차트 */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-sm text-slate-500 w-20 shrink-0">갈아타기 비용</span>
                  <div className="flex-1 bg-red-100 rounded-full h-8 relative overflow-hidden">
                    <div className="bg-red-400 h-full rounded-full flex items-center justify-end pr-3" style={{ width: '100%' }}>
                      <span className="text-xs font-bold text-white">{fmtWon(Math.round(result.totalRefinanceCost))}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm text-slate-500 w-20 shrink-0">누적 절감</span>
                  <div className="flex-1 bg-moss-50 rounded-full h-8 relative overflow-hidden">
                    <div
                      className="bg-moss-500 h-full rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                      style={{ width: `${Math.min(100, (result.breakEvenMonths * result.monthlySaved / result.totalRefinanceCost) * 100)}%` }}
                    >
                      <span className="text-xs font-bold text-white">{fmtWon(Math.round(result.breakEvenMonths * result.monthlySaved))}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ArrowRight size={16} className="text-moss-600" />
                  <span className="text-slate-600">
                    <strong className="text-moss-700">{result.breakEvenMonths}개월</strong>
                    ({Math.floor(result.breakEvenMonths / 12)}년 {result.breakEvenMonths % 12}개월) 후 손익분기 달성
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 상환 스케줄 미리보기 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-8 mb-8">
            <button
              onClick={() => setShowSchedule(!showSchedule)}
              className="w-full flex items-center justify-between text-left"
            >
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Calendar size={20} className="text-espresso-600" />
                월별 상환 스케줄 비교
              </h3>
              {showSchedule ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
            </button>

            {showSchedule && (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="text-center py-2 px-1 font-medium text-slate-500" rowSpan={2}>월</th>
                      <th className="text-center py-2 px-1 font-medium text-slate-500 border-l border-slate-200" colSpan={3}>기존 대출</th>
                      <th className="text-center py-2 px-1 font-medium text-moss-600 border-l border-slate-200" colSpan={3}>신규 대출</th>
                      <th className="text-center py-2 px-1 font-medium text-amber-600 border-l border-slate-200">절감</th>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <th className="text-right py-1 px-1 font-normal text-slate-400 border-l border-slate-200">상환액</th>
                      <th className="text-right py-1 px-1 font-normal text-slate-400">이자</th>
                      <th className="text-right py-1 px-1 font-normal text-slate-400">잔액</th>
                      <th className="text-right py-1 px-1 font-normal text-slate-400 border-l border-slate-200">상환액</th>
                      <th className="text-right py-1 px-1 font-normal text-slate-400">이자</th>
                      <th className="text-right py-1 px-1 font-normal text-slate-400">잔액</th>
                      <th className="text-right py-1 px-1 font-normal text-amber-400 border-l border-slate-200">누적</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {(() => {
                      const maxLen = Math.max(result.curSchedule.length, result.newSchedule.length);
                      const displayMonths = Math.min(maxLen, 60); // 최대 60개월 표시
                      let cumSaved = 0;
                      const rows = [];
                      for (let i = 0; i < displayMonths; i++) {
                        const c = result.curSchedule[i];
                        const n = result.newSchedule[i];
                        const saved = (c?.payment ?? 0) - (n?.payment ?? 0);
                        cumSaved += saved;
                        rows.push(
                          <tr key={i} className={i === result.breakEvenMonths - 1 ? 'bg-moss-50' : ''}>
                            <td className="py-2 px-1 text-center text-slate-500">{i + 1}</td>
                            <td className="py-2 px-1 text-right border-l border-slate-100">{c ? fmt(Math.round(c.payment)) : '-'}</td>
                            <td className="py-2 px-1 text-right">{c ? fmt(Math.round(c.interest)) : '-'}</td>
                            <td className="py-2 px-1 text-right">{c ? fmt(Math.round(c.remaining)) : '-'}</td>
                            <td className="py-2 px-1 text-right border-l border-slate-100">{n ? fmt(Math.round(n.payment)) : '-'}</td>
                            <td className="py-2 px-1 text-right">{n ? fmt(Math.round(n.interest)) : '-'}</td>
                            <td className="py-2 px-1 text-right">{n ? fmt(Math.round(n.remaining)) : '-'}</td>
                            <td className={`py-2 px-1 text-right font-medium border-l border-slate-100 ${cumSaved >= result.totalRefinanceCost ? 'text-moss-600' : 'text-slate-400'}`}>
                              {fmt(Math.round(cumSaved))}
                            </td>
                          </tr>
                        );
                      }
                      return rows;
                    })()}
                  </tbody>
                </table>
                {Math.max(result.curSchedule.length, result.newSchedule.length) > 60 && (
                  <p className="text-xs text-slate-400 mt-3 text-center">※ 최대 60개월까지 표시됩니다.</p>
                )}
              </div>
            )}
          </div>

          {/* 주의사항 */}
          <div className="bg-gradient-to-br from-golden-50 to-cream-100 rounded-2xl border border-golden-200 p-5 sm:p-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <AlertTriangle size={20} className="text-golden-600" />
              갈아타기 전 확인 사항
            </h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-golden-500 mt-0.5">•</span>
                <span><strong>중도상환수수료</strong>: 대출 실행 후 3년 이내 상환 시 부과되는 경우가 많습니다. 대출 약정서를 확인하세요.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-golden-500 mt-0.5">•</span>
                <span><strong>금리 유형</strong>: 고정금리 → 변동금리 전환 시 향후 금리 상승 리스크를 고려하세요.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-golden-500 mt-0.5">•</span>
                <span><strong>DSR 규제</strong>: 신규 대출 시 총부채원리금상환비율(DSR) 심사를 다시 받아야 합니다.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-golden-500 mt-0.5">•</span>
                <span><strong>우대금리</strong>: 기존 대출의 우대금리 조건을 새 대출에서도 충족할 수 있는지 확인하세요.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-golden-500 mt-0.5">•</span>
                <span>본 계산기는 참고용이며, 실제 조건은 금융기관과 상담하시기 바랍니다.</span>
              </li>
            </ul>
          </div>

        </div>
      </section>
    </div>
  );
};

export default LoanRefinanceCalculator;
