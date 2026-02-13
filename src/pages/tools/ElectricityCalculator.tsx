import React, { useState, useMemo } from 'react';
import {
  Zap,
  Info,
  AlertTriangle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

/* ---------- 2024 한전 요금표 (주거용) ---------- */
// 주거용 전기요금 (저압) - 하계(7~8월) / 기타
interface TierRate {
  from: number;
  to: number;
  baseFee: number;
  unitPrice: number;
}

const summerTiers: TierRate[] = [
  { from: 0, to: 300, baseFee: 730, unitPrice: 112.0 },
  { from: 300, to: 450, baseFee: 1260, unitPrice: 206.6 },
  { from: 450, to: Infinity, baseFee: 6060, unitPrice: 299.3 },
];

const otherTiers: TierRate[] = [
  { from: 0, to: 200, baseFee: 730, unitPrice: 112.0 },
  { from: 200, to: 400, baseFee: 1260, unitPrice: 206.6 },
  { from: 400, to: Infinity, baseFee: 6060, unitPrice: 299.3 },
];

// 기후환경요금 (원/kWh) - 2024년 기준
const CLIMATE_ENV_RATE = 9.0;
// 연료비조정액 (원/kWh) - 2024년 기준
const FUEL_ADJ_RATE = 5.0;

type Season = 'summer' | 'other';

/* ---------- helpers ---------- */
const fmt = (n: number) => n.toLocaleString('ko-KR');

function calcElectricity(kwh: number, season: Season) {
  const tiers = season === 'summer' ? summerTiers : otherTiers;

  // 해당 구간 기본요금 결정
  let baseFee = 0;
  for (const tier of tiers) {
    if (kwh > tier.from) {
      baseFee = tier.baseFee;
    }
  }

  // 전력량요금 (누진제)
  let energyCharge = 0;
  const breakdown: { from: number; to: number; kwh: number; rate: number; charge: number }[] = [];

  for (const tier of tiers) {
    if (kwh <= tier.from) break;
    const tierKwh = Math.min(kwh, tier.to === Infinity ? kwh : tier.to) - tier.from;
    if (tierKwh <= 0) continue;
    const charge = tierKwh * tier.unitPrice;
    energyCharge += charge;
    breakdown.push({
      from: tier.from,
      to: tier.to === Infinity ? kwh : tier.to,
      kwh: tierKwh,
      rate: tier.unitPrice,
      charge,
    });
  }

  // 기후환경요금
  const climateCharge = kwh * CLIMATE_ENV_RATE;
  // 연료비조정액
  const fuelAdj = kwh * FUEL_ADJ_RATE;

  // 전기요금 합계 (세전)
  const subtotal = baseFee + energyCharge + climateCharge + fuelAdj;

  // 부가가치세 (10%, 10원 미만 절사)
  const vat = Math.floor(subtotal * 0.1 / 10) * 10;
  // 전력산업기반기금 (3.7%, 10원 미만 절사)
  const fund = Math.floor(subtotal * 0.037 / 10) * 10;

  // 총 요금
  const total = subtotal + vat + fund;

  // 10원 미만 절사 (최종)
  const totalRounded = Math.floor(total / 10) * 10;

  return {
    baseFee,
    energyCharge,
    climateCharge,
    fuelAdj,
    subtotal,
    vat,
    fund,
    total: totalRounded,
    breakdown,
    unitPrice: kwh > 0 ? totalRounded / kwh : 0,
  };
}

/* ---------- component ---------- */
const ElectricityCalculator: React.FC = () => {
  const [kwh, setKwh] = useState(350);
  const [season, setSeason] = useState<Season>('other');
  const [showDetail, setShowDetail] = useState(true);

  const result = useMemo(() => calcElectricity(kwh, season), [kwh, season]);

  // 구간별 비교 데이터 (100~1000kWh)
  const compareData = useMemo(() => {
    const points = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
    return points.map((k) => {
      const r = calcElectricity(k, season);
      return { kwh: k, total: r.total, unitPrice: r.unitPrice };
    });
  }, [season]);

  const maxTotal = Math.max(...compareData.map((d) => d.total));

  // 구간 컬러
  const tierColors = ['bg-emerald-400', 'bg-amber-400', 'bg-red-400'];
  const tierTextColors = ['text-emerald-700', 'text-amber-700', 'text-red-700'];
  const tierLabels = season === 'summer'
    ? ['1구간 (0~300kWh)', '2구간 (300~450kWh)', '3구간 (450kWh~)']
    : ['1구간 (0~200kWh)', '2구간 (200~400kWh)', '3구간 (400kWh~)'];

  // 빠른 입력 버튼
  const quickKwh = [100, 200, 300, 400, 500, 600];

  return (
    <>
      <SEOHead
        title="전기요금 계산기"
        description="가정용 전기요금을 누진제 기준으로 계산합니다. 사용량을 입력하면 기본요금, 전력량요금, 부가세를 포함한 예상 요금을 확인하세요."
        url="/tools/electricity"
      />
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero */}
      <section className="bg-gradient-to-r from-espresso-800 to-espresso-950 text-white pt-28 pb-12 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Zap size={22} />
            </div>
            <span className="text-oatmeal-300 text-sm font-medium">부자타임 도구</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">전기요금 계산기</h1>
          <p className="text-oatmeal-300 text-base md:text-lg">
            사용량(kWh)을 입력하면 누진세 구간별 전기요금을 상세히 계산합니다.
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
                  <h2 className="text-lg font-bold text-slate-800 mb-5">사용량 입력</h2>

                  {/* 시즌 선택 */}
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-slate-600 mb-2">적용 시즌</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'summer' as Season, label: '하계 (7~8월)', icon: '☀️' },
                        { value: 'other' as Season, label: '기타 (9~6월)', icon: '🍂' },
                      ].map((s) => (
                        <button
                          key={s.value}
                          onClick={() => setSeason(s.value)}
                          className={`flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                            season === s.value
                              ? 'bg-espresso-800 text-white shadow-md'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <span>{s.icon}</span> {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* kWh 입력 */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-600 mb-2">전기 사용량</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={kwh}
                        onChange={(e) => setKwh(Math.max(0, Number(e.target.value)))}
                        min={0}
                        max={9999}
                        className="w-full border-2 border-oatmeal-200 rounded-xl px-4 py-3 text-right pr-16 text-lg font-semibold focus:border-espresso-400 focus:outline-none transition-colors"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">kWh</span>
                    </div>
                  </div>

                  {/* 슬라이더 */}
                  <div className="mb-4">
                    <input
                      type="range"
                      min={0}
                      max={1000}
                      step={10}
                      value={Math.min(kwh, 1000)}
                      onChange={(e) => setKwh(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-espresso-600"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                      <span>0</span>
                      <span>500</span>
                      <span>1,000</span>
                    </div>
                  </div>

                  {/* 빠른 선택 */}
                  <div>
                    <span className="text-xs text-slate-400 mb-2 block">빠른 선택</span>
                    <div className="flex flex-wrap gap-2">
                      {quickKwh.map((k) => (
                        <button
                          key={k}
                          onClick={() => setKwh(k)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            kwh === k
                              ? 'bg-espresso-800 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {k}kWh
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 누진 구간 안내 */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <Info size={16} className="text-espresso-500" />
                    누진 구간 요금표
                  </h3>
                  <div className="space-y-2">
                    {(season === 'summer' ? summerTiers : otherTiers).map((tier, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${tierColors[i]}`} />
                        <span className="text-sm text-slate-600 flex-1">{tierLabels[i]}</span>
                        <span className="text-sm font-semibold text-slate-800">{tier.unitPrice}원/kWh</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-xs text-slate-400">
                    <p>기본요금: 구간별 730 / 1,260 / 6,060원</p>
                    <p>기후환경요금: {CLIMATE_ENV_RATE}원/kWh</p>
                    <p>연료비조정액: {FUEL_ADJ_RATE}원/kWh</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 결과 패널 */}
            <div className="lg:col-span-3 space-y-6">

              {/* 핵심 결과 */}
              <div className="bg-gradient-to-r from-espresso-800 to-espresso-950 text-white rounded-2xl p-6 sm:p-8">
                <p className="text-oatmeal-300 text-sm mb-1">이번 달 예상 전기요금</p>
                <p className="text-3xl sm:text-4xl font-bold mb-1">
                  {fmt(result.total)}<span className="text-lg ml-1">원</span>
                </p>
                <p className="text-oatmeal-400 text-sm">
                  kWh당 평균 {fmt(Math.round(result.unitPrice))}원 · {kwh}kWh 사용 기준
                </p>
              </div>

              {/* 누진 구간 시각화 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
                <h3 className="text-base font-bold text-slate-800 mb-4">누진 구간별 요금</h3>
                {result.breakdown.length === 0 ? (
                  <p className="text-sm text-slate-400">사용량을 입력하세요.</p>
                ) : (
                  <div className="space-y-3">
                    {result.breakdown.map((b, i) => {
                      const pct = result.energyCharge > 0 ? (b.charge / result.energyCharge) * 100 : 0;
                      return (
                        <div key={i}>
                          <div className="flex justify-between items-center mb-1">
                            <span className={`text-sm font-medium ${tierTextColors[i]}`}>
                              {tierLabels[i]}
                            </span>
                            <span className="text-sm font-bold text-slate-800">{fmt(Math.round(b.charge))}원</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${tierColors[i]} flex items-center px-2 transition-all duration-500`}
                                style={{ width: `${Math.max(pct, 5)}%` }}
                              >
                                <span className="text-xs font-bold text-white whitespace-nowrap">
                                  {b.kwh}kWh × {b.rate}원
                                </span>
                              </div>
                            </div>
                            <span className="text-xs text-slate-400 w-10 text-right">{Math.round(pct)}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 요금 상세 내역 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
                <button
                  onClick={() => setShowDetail(!showDetail)}
                  className="w-full flex items-center justify-between"
                >
                  <h3 className="text-base font-bold text-slate-800">요금 상세 내역</h3>
                  {showDetail ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                </button>

                {showDetail && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-600">기본요금</span>
                      <span className="text-sm font-medium">{fmt(result.baseFee)}원</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-600">전력량요금</span>
                      <span className="text-sm font-medium">{fmt(Math.round(result.energyCharge))}원</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-600">기후환경요금 ({CLIMATE_ENV_RATE}원/kWh)</span>
                      <span className="text-sm font-medium">{fmt(Math.round(result.climateCharge))}원</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-600">연료비조정액 ({FUEL_ADJ_RATE}원/kWh)</span>
                      <span className="text-sm font-medium">{fmt(Math.round(result.fuelAdj))}원</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-200 font-medium">
                      <span className="text-sm text-slate-700">소계</span>
                      <span className="text-sm">{fmt(Math.round(result.subtotal))}원</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-600">부가가치세 (10%)</span>
                      <span className="text-sm font-medium">{fmt(result.vat)}원</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-600">전력산업기반기금 (3.7%)</span>
                      <span className="text-sm font-medium">{fmt(result.fund)}원</span>
                    </div>
                    <div className="flex justify-between py-3 bg-espresso-50 rounded-xl px-3 mt-2">
                      <span className="font-bold text-espresso-800">총 전기요금</span>
                      <span className="font-bold text-espresso-800 text-lg">{fmt(result.total)}원</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 구간별 요금 비교 차트 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
                <h3 className="text-base font-bold text-slate-800 mb-4">사용량별 요금 비교</h3>
                <div className="space-y-2">
                  {compareData.map((d) => {
                    const pct = (d.total / maxTotal) * 100;
                    const isActive = d.kwh === kwh;
                    return (
                      <button
                        key={d.kwh}
                        onClick={() => setKwh(d.kwh)}
                        className="w-full flex items-center gap-3 group"
                      >
                        <span className={`text-sm w-16 text-right shrink-0 ${isActive ? 'font-bold text-espresso-800' : 'text-slate-500'}`}>
                          {d.kwh}kWh
                        </span>
                        <div className="flex-1 bg-slate-100 rounded-full h-7 overflow-hidden">
                          <div
                            className={`h-full rounded-full flex items-center justify-end pr-2 transition-all duration-300 ${
                              isActive
                                ? 'bg-espresso-600'
                                : d.kwh <= (season === 'summer' ? 300 : 200)
                                  ? 'bg-emerald-300 group-hover:bg-emerald-400'
                                  : d.kwh <= (season === 'summer' ? 450 : 400)
                                    ? 'bg-amber-300 group-hover:bg-amber-400'
                                    : 'bg-red-300 group-hover:bg-red-400'
                            }`}
                            style={{ width: `${Math.max(pct, 8)}%` }}
                          >
                            <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-700'}`}>
                              {fmt(d.total)}원
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-slate-400 w-16 text-right shrink-0">
                          {fmt(Math.round(d.unitPrice))}원/kWh
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 절약 팁 */}
              <div className="bg-gradient-to-br from-golden-50 to-cream-100 rounded-2xl border border-golden-200 p-5 sm:p-8">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Lightbulb size={20} className="text-golden-600" />
                  전기요금 절약 팁
                </h3>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-golden-500 mt-0.5">💡</span>
                    <span><strong>누진 구간 관리</strong>: 월 사용량을 {season === 'summer' ? '300' : '200'}kWh 이하로 유지하면 1구간 단가가 적용되어 요금이 크게 줄어듭니다.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-golden-500 mt-0.5">🌡️</span>
                    <span><strong>냉·난방 효율</strong>: 에어컨 26°C, 보일러 20°C로 설정하면 에너지를 10~20% 절감할 수 있습니다.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-golden-500 mt-0.5">🔌</span>
                    <span><strong>대기전력 차단</strong>: 사용하지 않는 가전 플러그를 빼거나 절전 멀티탭을 사용하면 월 5~10% 절약 가능합니다.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-golden-500 mt-0.5">⏰</span>
                    <span><strong>시간대별 요금제</strong>: 심야 시간대(23시~09시)에 세탁기, 식기세척기를 돌리면 요금을 줄일 수 있습니다.</span>
                  </li>
                </ul>
              </div>

              {/* 주의사항 */}
              <div className="bg-slate-50 rounded-2xl p-5 text-xs text-slate-400 flex items-start gap-2">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                <p>
                  본 계산기는 2024년 한국전력 주거용(저압) 요금표 기준이며, 실제 요금은 사용 패턴, 할인 적용, 복지 감면 등에 따라 달라질 수 있습니다. 정확한 요금은 한전 고객센터(123)에서 확인하세요.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  
    </>);
};

export default ElectricityCalculator;
