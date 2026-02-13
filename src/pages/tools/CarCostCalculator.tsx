import React, { useState, useMemo } from 'react';
import {
  Car,
  Fuel,
  Shield,
  Wrench,
  TrendingDown,
  AlertTriangle,
  Info,
} from 'lucide-react';

/* ---------- types ---------- */
type FuelType = 'gasoline' | 'diesel' | 'lpg' | 'electric' | 'hybrid';

const fuelLabels: Record<FuelType, string> = {
  gasoline: '휘발유',
  diesel: '경유',
  lpg: 'LPG',
  electric: '전기',
  hybrid: '하이브리드',
};

// 평균 유가 (원/L or 원/kWh) - 2024 기준 참고
const avgFuelPrices: Record<FuelType, number> = {
  gasoline: 1650,
  diesel: 1500,
  lpg: 1000,
  electric: 300, // 원/kWh (완속)
  hybrid: 1650, // 휘발유 기준
};

// 자동차세 기준 (비영업, cc당)
function calcAutoTax(cc: number, isElectric: boolean, carAge: number): number {
  if (isElectric) return 13; // 전기차 13만원 고정

  let baseTax = 0;
  if (cc <= 1000) {
    baseTax = cc * 80;
  } else if (cc <= 1600) {
    baseTax = cc * 140;
  } else {
    baseTax = cc * 200;
  }

  // 교육세 30%
  const eduTax = baseTax * 0.3;
  let total = baseTax + eduTax;

  // 차령 경감 (3년 이후 매년 5%씩, 최대 50%)
  if (carAge >= 3) {
    const discount = Math.min((carAge - 2) * 5, 50);
    total = total * (1 - discount / 100);
  }

  return Math.round(total / 10000); // 만원 단위
}

/* ---------- helpers ---------- */
const fmt = (n: number) => n.toLocaleString('ko-KR');

/* ---------- component ---------- */
const CarCostCalculator: React.FC = () => {
  // 차량 정보
  const [fuelType, setFuelType] = useState<FuelType>('gasoline');
  const [engineCC, setEngineCC] = useState(2000);
  const [fuelEfficiency, setFuelEfficiency] = useState(12); // km/L or km/kWh
  const [carAge, setCarAge] = useState(3); // 차령 (년)
  const [carPrice, setCarPrice] = useState(3000); // 차량 구매가 (만원)

  // 운행 정보
  const [monthlyKm, setMonthlyKm] = useState(1500);
  const [fuelPrice, setFuelPrice] = useState(avgFuelPrices[fuelType]);

  // 보험·정비
  const [insuranceMonthly, setInsuranceMonthly] = useState(8); // 만원/월
  const [maintenanceYearly, setMaintenanceYearly] = useState(50); // 만원/년
  const [parkingMonthly, setParkingMonthly] = useState(10); // 만원/월
  const [tollMonthly, setTollMonthly] = useState(3); // 만원/월
  const [washMonthly, setWashMonthly] = useState(2); // 만원/월

  // 연료 타입 변경 시 평균가 업데이트
  const handleFuelTypeChange = (ft: FuelType) => {
    setFuelType(ft);
    setFuelPrice(avgFuelPrices[ft]);
    // 전기차 연비 기본값 조정
    if (ft === 'electric') {
      setFuelEfficiency(5.5); // km/kWh
      setEngineCC(0);
    } else if (ft === 'hybrid') {
      setFuelEfficiency(16);
    } else {
      setFuelEfficiency(ft === 'diesel' ? 14 : ft === 'lpg' ? 10 : 12);
    }
  };

  const result = useMemo(() => {
    const yearlyKm = monthlyKm * 12;

    // 유류비
    const monthlyFuelConsumption = fuelEfficiency > 0 ? monthlyKm / fuelEfficiency : 0;
    const monthlyFuelCost = Math.round(monthlyFuelConsumption * fuelPrice / 10000); // 만원
    const yearlyFuelCost = monthlyFuelCost * 12;

    // 자동차세
    const isElectric = fuelType === 'electric';
    const autoTax = calcAutoTax(engineCC, isElectric, carAge); // 만원/년
    const monthlyAutoTax = Math.round(autoTax / 12 * 10) / 10;

    // 감가상각 (정률법 근사: 첫해 30%, 이후 매년 잔존가의 20%)
    let depreciatedValue = carPrice;
    for (let y = 0; y < carAge; y++) {
      if (y === 0) depreciatedValue *= 0.7;
      else depreciatedValue *= 0.8;
    }
    const yearlyDepreciation = depreciatedValue * 0.2;
    const monthlyDepreciation = Math.round(yearlyDepreciation / 12 * 10) / 10;

    // 보험
    const yearlyInsurance = insuranceMonthly * 12;

    // 정비
    const monthlyMaintenance = Math.round(maintenanceYearly / 12 * 10) / 10;

    // 기타 (주차, 톨, 세차)
    const monthlyEtc = parkingMonthly + tollMonthly + washMonthly;
    const yearlyEtc = monthlyEtc * 12;

    // 합계
    const monthlyTotal = monthlyFuelCost + monthlyAutoTax + monthlyDepreciation + insuranceMonthly + monthlyMaintenance + monthlyEtc;
    const yearlyTotal = yearlyFuelCost + autoTax + Math.round(yearlyDepreciation) + yearlyInsurance + maintenanceYearly + yearlyEtc;

    // km당 비용
    const costPerKm = monthlyKm > 0 ? (monthlyTotal * 10000) / monthlyKm : 0;

    // 비율
    const items = [
      { label: '유류비', monthly: monthlyFuelCost, yearly: yearlyFuelCost, color: 'bg-amber-400', icon: <Fuel size={16} /> },
      { label: '자동차세', monthly: monthlyAutoTax, yearly: autoTax, color: 'bg-blue-400', icon: <Info size={16} /> },
      { label: '감가상각', monthly: monthlyDepreciation, yearly: Math.round(yearlyDepreciation), color: 'bg-red-400', icon: <TrendingDown size={16} /> },
      { label: '보험료', monthly: insuranceMonthly, yearly: yearlyInsurance, color: 'bg-purple-400', icon: <Shield size={16} /> },
      { label: '정비비', monthly: monthlyMaintenance, yearly: maintenanceYearly, color: 'bg-teal-400', icon: <Wrench size={16} /> },
      { label: '주차·톨·세차', monthly: monthlyEtc, yearly: yearlyEtc, color: 'bg-slate-400', icon: <Car size={16} /> },
    ];

    return {
      monthlyTotal: Math.round(monthlyTotal),
      yearlyTotal: Math.round(yearlyTotal),
      costPerKm: Math.round(costPerKm),
      yearlyKm,
      items,
      currentValue: Math.round(depreciatedValue),
    };
  }, [fuelType, engineCC, fuelEfficiency, carAge, carPrice, monthlyKm, fuelPrice, insuranceMonthly, maintenanceYearly, parkingMonthly, tollMonthly, washMonthly]);

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

  return (
    <>
      <SEOHead
        title="자동차 유지비 계산기"
        description="자동차 연간 유지비를 계산합니다. 유류비, 보험료, 세금, 정비비 등을 포함한 총 유지비용을 확인해보세요."
        url="/tools/car-cost"
      />
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero */}
      <section className="bg-gradient-to-r from-espresso-800 to-espresso-950 text-white pt-28 pb-12 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Car size={22} />
            </div>
            <span className="text-oatmeal-300 text-sm font-medium">부자타임 도구</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">자동차 유지비 계산기</h1>
          <p className="text-oatmeal-300 text-base md:text-lg">
            유류비·보험·세금·감가상각 등 월/연 총 유지비를 계산합니다.
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
                {/* 차량 정보 */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h2 className="text-lg font-bold text-slate-800 mb-5">차량 정보</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">연료 타입</label>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                        {(Object.keys(fuelLabels) as FuelType[]).map((ft) => (
                          <button
                            key={ft}
                            onClick={() => handleFuelTypeChange(ft)}
                            className={`px-2 py-2.5 rounded-xl text-xs font-medium transition-all ${
                              fuelType === ft
                                ? 'bg-espresso-800 text-white shadow-md'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {fuelLabels[ft]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {fuelType !== 'electric' && (
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1.5">배기량</label>
                        {numInput(engineCC, setEngineCC, { min: 0, max: 10000, suffix: 'cc' })}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">
                        연비 ({fuelType === 'electric' ? 'km/kWh' : 'km/L'})
                      </label>
                      {numInput(fuelEfficiency, setFuelEfficiency, { min: 0.1, max: 50, step: 0.1, suffix: fuelType === 'electric' ? 'km/kWh' : 'km/L' })}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">차량 연식 (차령)</label>
                      {numInput(carAge, setCarAge, { min: 0, max: 30, suffix: '년' })}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">차량 구매가</label>
                      {numInput(carPrice, setCarPrice, { min: 0, suffix: '만원' })}
                    </div>
                  </div>
                </div>

                {/* 운행 & 비용 */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h2 className="text-lg font-bold text-slate-800 mb-5">운행 & 비용</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">월 주행거리</label>
                      {numInput(monthlyKm, setMonthlyKm, { min: 0, suffix: 'km' })}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {[500, 1000, 1500, 2000, 3000].map((k) => (
                          <button
                            key={k}
                            onClick={() => setMonthlyKm(k)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                              monthlyKm === k ? 'bg-espresso-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            {fmt(k)}km
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">
                        {fuelType === 'electric' ? '전기 단가' : '유가'}
                      </label>
                      {numInput(fuelPrice, (v) => setFuelPrice(v), {
                        min: 0,
                        suffix: fuelType === 'electric' ? '원/kWh' : '원/L',
                      })}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">보험료 (월)</label>
                      {numInput(insuranceMonthly, setInsuranceMonthly, { min: 0, suffix: '만원' })}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">정비비 (연)</label>
                      {numInput(maintenanceYearly, setMaintenanceYearly, { min: 0, suffix: '만원' })}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">주차 (월)</label>
                        {numInput(parkingMonthly, setParkingMonthly, { min: 0, suffix: '만원' })}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">톨비 (월)</label>
                        {numInput(tollMonthly, setTollMonthly, { min: 0, suffix: '만원' })}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">세차 (월)</label>
                        {numInput(washMonthly, setWashMonthly, { min: 0, suffix: '만원' })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 결과 패널 */}
            <div className="lg:col-span-3 space-y-6">

              {/* 핵심 결과 */}
              <div className="bg-gradient-to-r from-espresso-800 to-espresso-950 text-white rounded-2xl p-6 sm:p-8">
                <p className="text-oatmeal-300 text-sm mb-1">월 총 유지비</p>
                <p className="text-3xl sm:text-4xl font-bold mb-1">
                  약 {fmt(result.monthlyTotal)}<span className="text-lg ml-1">만원</span>
                </p>
                <p className="text-oatmeal-400 text-sm mb-5">
                  연간 약 {fmt(result.yearlyTotal)}만원 · km당 {fmt(result.costPerKm)}원
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-xs text-oatmeal-300 mb-1">연간 주행</p>
                    <p className="text-lg font-bold">{fmt(result.yearlyKm)}km</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-xs text-oatmeal-300 mb-1">km당 비용</p>
                    <p className="text-lg font-bold">{fmt(result.costPerKm)}원</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-xs text-oatmeal-300 mb-1">현재 잔존가</p>
                    <p className="text-lg font-bold">{fmt(result.currentValue)}만원</p>
                  </div>
                </div>
              </div>

              {/* 비용 항목별 분석 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
                <h3 className="text-base font-bold text-slate-800 mb-5">비용 항목별 분석</h3>

                {/* 도넛 대신 가로 바 */}
                <div className="space-y-4">
                  {result.items.map((item) => {
                    const pct = result.monthlyTotal > 0 ? (item.monthly / result.monthlyTotal) * 100 : 0;
                    return (
                      <div key={item.label}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500">{item.icon}</span>
                            <span className="text-sm font-medium text-slate-700">{item.label}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-slate-800">{fmt(Math.round(item.monthly))}만원</span>
                            <span className="text-xs text-slate-400 ml-1">/월</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${item.color} transition-all duration-500`}
                              style={{ width: `${Math.max(pct, 2)}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400 w-10 text-right">{Math.round(pct)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 월간/연간 비교 테이블 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
                <h3 className="text-base font-bold text-slate-800 mb-4">월간 / 연간 비용 요약</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-slate-200">
                        <th className="text-left py-2 px-2 font-medium text-slate-500">항목</th>
                        <th className="text-right py-2 px-2 font-medium text-slate-500">월간</th>
                        <th className="text-right py-2 px-2 font-medium text-slate-500">연간</th>
                        <th className="text-right py-2 px-2 font-medium text-slate-500">비중</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {result.items.map((item) => {
                        const pct = result.yearlyTotal > 0 ? (item.yearly / result.yearlyTotal) * 100 : 0;
                        return (
                          <tr key={item.label}>
                            <td className="py-2.5 px-2 text-slate-700 flex items-center gap-2">
                              <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                              {item.label}
                            </td>
                            <td className="py-2.5 px-2 text-right">{fmt(Math.round(item.monthly))}만원</td>
                            <td className="py-2.5 px-2 text-right">{fmt(Math.round(item.yearly))}만원</td>
                            <td className="py-2.5 px-2 text-right">{Math.round(pct)}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-200 font-bold">
                        <td className="py-3 px-2 text-espresso-800">합계</td>
                        <td className="py-3 px-2 text-right text-espresso-800">{fmt(result.monthlyTotal)}만원</td>
                        <td className="py-3 px-2 text-right text-espresso-800">{fmt(result.yearlyTotal)}만원</td>
                        <td className="py-3 px-2 text-right text-espresso-800">100%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* 주행거리별 비교 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
                <h3 className="text-base font-bold text-slate-800 mb-4">월 주행거리별 유류비 비교</h3>
                <div className="space-y-2">
                  {[500, 1000, 1500, 2000, 2500, 3000].map((km) => {
                    const fuel = fuelEfficiency > 0 ? Math.round(km / fuelEfficiency * fuelPrice / 10000) : 0;
                    const maxFuel = fuelEfficiency > 0 ? Math.round(3000 / fuelEfficiency * fuelPrice / 10000) : 1;
                    const pct = maxFuel > 0 ? (fuel / maxFuel) * 100 : 0;
                    const isActive = km === monthlyKm;
                    return (
                      <button
                        key={km}
                        onClick={() => setMonthlyKm(km)}
                        className="w-full flex items-center gap-3 group"
                      >
                        <span className={`text-sm w-16 text-right shrink-0 ${isActive ? 'font-bold text-espresso-800' : 'text-slate-500'}`}>
                          {fmt(km)}km
                        </span>
                        <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden">
                          <div
                            className={`h-full rounded-full flex items-center justify-end pr-2 transition-all ${
                              isActive ? 'bg-espresso-600' : 'bg-amber-300 group-hover:bg-amber-400'
                            }`}
                            style={{ width: `${Math.max(pct, 8)}%` }}
                          >
                            <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-700'}`}>
                              {fmt(fuel)}만원
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 팁 */}
              <div className="bg-gradient-to-br from-golden-50 to-cream-100 rounded-2xl border border-golden-200 p-5 sm:p-8">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <AlertTriangle size={20} className="text-golden-600" />
                  유지비 절감 팁
                </h3>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-golden-500 mt-0.5">⛽</span>
                    <span><strong>연비 운전</strong>: 급가속·급제동을 줄이고 정속 주행하면 연비를 10~15% 개선할 수 있습니다.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-golden-500 mt-0.5">🛡️</span>
                    <span><strong>보험 비교</strong>: 매년 갱신 시 다이렉트 보험사 비교견적으로 20~30% 절약 가능합니다.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-golden-500 mt-0.5">🔧</span>
                    <span><strong>정기 점검</strong>: 제때 오일·필터를 교체하면 큰 수리비를 예방할 수 있습니다.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-golden-500 mt-0.5">🅿️</span>
                    <span><strong>주차비</strong>: 아파트 할인, 직장 주차 등 월정액 주차를 활용하세요.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-golden-500 mt-0.5">📱</span>
                    <span>유가 비교 앱(오피넷 등)을 이용하면 리터당 50~100원 절약이 가능합니다.</span>
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

export default CarCostCalculator;
