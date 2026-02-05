import React, { useState, useMemo } from 'react';
import { Heart, RotateCcw, Info, User, Ruler, Weight, ArrowDown } from 'lucide-react';

interface BmiCategory {
  label: string;
  min: number;
  max: number;
  color: string;
  bgColor: string;
  textColor: string;
  barColor: string;
}

const KR_CATEGORIES: BmiCategory[] = [
  { label: '저체중', min: 0, max: 18.5, color: '#60a5fa', bgColor: 'bg-blue-50', textColor: 'text-blue-600', barColor: 'bg-blue-400' },
  { label: '정상', min: 18.5, max: 23, color: '#34d399', bgColor: 'bg-emerald-50', textColor: 'text-emerald-600', barColor: 'bg-emerald-400' },
  { label: '과체중', min: 23, max: 25, color: '#fbbf24', bgColor: 'bg-amber-50', textColor: 'text-amber-600', barColor: 'bg-amber-400' },
  { label: '비만', min: 25, max: 30, color: '#f97316', bgColor: 'bg-orange-50', textColor: 'text-orange-600', barColor: 'bg-orange-400' },
  { label: '고도비만', min: 30, max: 50, color: '#ef4444', bgColor: 'bg-red-50', textColor: 'text-red-600', barColor: 'bg-red-400' },
];

const WHO_CATEGORIES: BmiCategory[] = [
  { label: '저체중', min: 0, max: 18.5, color: '#60a5fa', bgColor: 'bg-blue-50', textColor: 'text-blue-600', barColor: 'bg-blue-400' },
  { label: '정상', min: 18.5, max: 25, color: '#34d399', bgColor: 'bg-emerald-50', textColor: 'text-emerald-600', barColor: 'bg-emerald-400' },
  { label: '과체중', min: 25, max: 30, color: '#fbbf24', bgColor: 'bg-amber-50', textColor: 'text-amber-600', barColor: 'bg-amber-400' },
  { label: '비만', min: 30, max: 35, color: '#f97316', bgColor: 'bg-orange-50', textColor: 'text-orange-600', barColor: 'bg-orange-400' },
  { label: '고도비만', min: 35, max: 50, color: '#ef4444', bgColor: 'bg-red-50', textColor: 'text-red-600', barColor: 'bg-red-400' },
];

const BmiCalculator: React.FC = () => {
  const [height, setHeight] = useState<string>('170');
  const [weight, setWeight] = useState<string>('70');
  const [gender, setGender] = useState<'male' | 'female'>('male');

  const result = useMemo(() => {
    const h = parseFloat(height) || 0;
    const w = parseFloat(weight) || 0;
    if (h <= 0 || w <= 0) return null;

    const hM = h / 100;
    const bmi = w / (hM * hM);

    // 정상 체중 범위 (대한비만학회 기준 18.5~22.9)
    const normalMin = 18.5 * hM * hM;
    const normalMax = 22.9 * hM * hM;

    // 현재 카테고리
    const category = KR_CATEGORIES.find((c) => bmi >= c.min && bmi < c.max) || KR_CATEGORIES[KR_CATEGORIES.length - 1];
    const whoCategory = WHO_CATEGORIES.find((c) => bmi >= c.min && bmi < c.max) || WHO_CATEGORIES[WHO_CATEGORIES.length - 1];

    // 정상 체중까지 차이
    const diff = w - normalMax;

    return { bmi, normalMin, normalMax, category, whoCategory, diff };
  }, [height, weight]);

  const handleReset = () => {
    setHeight('170');
    setWeight('70');
    setGender('male');
  };

  // 게이지 위치 계산 (BMI 10~40 범위를 0~100%로 매핑)
  const gaugePosition = useMemo(() => {
    if (!result) return 50;
    const min = 10;
    const max = 40;
    const clamped = Math.max(min, Math.min(max, result.bmi));
    return ((clamped - min) / (max - min)) * 100;
  }, [result]);

  // 게이지 구간별 비율
  const gaugeSegments = useMemo(() => {
    const min = 10;
    const max = 40;
    const range = max - min;
    return KR_CATEGORIES.map((cat) => {
      const segMin = Math.max(cat.min, min);
      const segMax = Math.min(cat.max, max);
      const width = ((segMax - segMin) / range) * 100;
      return { ...cat, width };
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-golden-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-espresso-800 to-espresso-950 text-white py-16 px-6">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-golden-100 rounded-2xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-espresso-800" />
            </div>
            <span className="text-golden-200 text-sm font-medium tracking-wider uppercase">
              부자타임 도구
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">BMI 계산기</h1>
          <p className="text-oatmeal-300 text-base sm:text-lg max-w-xl mx-auto">
            키와 체중만 입력하면 체질량지수(BMI)를 바로 확인할 수 있습니다.
            <br className="hidden sm:block" />
            대한비만학회 기준으로 건강 상태를 확인해보세요.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-10 space-y-6">
        {/* ── 입력 카드 ── */}
        <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-espresso-800">기본 정보 입력</h2>
            <button
              onClick={handleReset}
              className="text-cocoa-500 hover:text-cocoa-700 transition-colors p-1.5 rounded-lg hover:bg-oatmeal-100"
              title="초기화"
            >
              <RotateCcw size={18} />
            </button>
          </div>

          {/* 성별 선택 */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-espresso-600 mb-2">성별</label>
            <div className="flex gap-3">
              {([['male', '남성'], ['female', '여성']] as const).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setGender(val)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                    gender === val
                      ? 'bg-golden-100 text-espresso-800 border-2 border-golden-300'
                      : 'bg-oatmeal-50 text-cocoa-400 border-2 border-transparent hover:bg-oatmeal-100'
                  }`}
                >
                  <User size={16} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 키 & 체중 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-espresso-600 mb-2">
                <Ruler size={14} className="text-golden-500" />
                키
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border-2 border-oatmeal-200 rounded-xl focus:border-golden-400 focus:ring-2 focus:ring-golden-100 outline-none transition-all text-lg font-medium text-espresso-800"
                  min="100"
                  max="250"
                  step="0.1"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-cocoa-400 font-medium text-sm">
                  cm
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['155', '160', '165', '170', '175', '180'].map((v) => (
                  <button
                    key={v}
                    onClick={() => setHeight(v)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                      height === v
                        ? 'bg-golden-100 text-espresso-800 border border-golden-300'
                        : 'bg-oatmeal-100 text-cocoa-500 hover:bg-oatmeal-200 border border-transparent'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-espresso-600 mb-2">
                <Weight size={14} className="text-golden-500" />
                체중
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border-2 border-oatmeal-200 rounded-xl focus:border-golden-400 focus:ring-2 focus:ring-golden-100 outline-none transition-all text-lg font-medium text-espresso-800"
                  min="30"
                  max="300"
                  step="0.1"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-cocoa-400 font-medium text-sm">
                  kg
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['50', '60', '70', '80', '90', '100'].map((v) => (
                  <button
                    key={v}
                    onClick={() => setWeight(v)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                      weight === v
                        ? 'bg-golden-100 text-espresso-800 border border-golden-300'
                        : 'bg-oatmeal-100 text-cocoa-500 hover:bg-oatmeal-200 border border-transparent'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── BMI 결과 & 게이지 ── */}
        {result && (
          <>
            {/* 핵심 결과 */}
            <div className="bg-gradient-to-br from-espresso-800 to-espresso-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl text-center">
              <p className="text-sm text-golden-200 mb-2 tracking-wider uppercase">나의 BMI</p>
              <div className="text-5xl sm:text-6xl font-bold mb-3" style={{ color: result.category.color }}>
                {result.bmi.toFixed(1)}
              </div>
              <span
                className="inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-6"
                style={{ backgroundColor: result.category.color + '22', color: result.category.color }}
              >
                {result.category.label}
              </span>

              {/* 게이지 바 */}
              <div className="relative mt-2 mb-8 mx-auto max-w-md">
                {/* 마커 화살표 */}
                <div
                  className="absolute -top-6 transition-all duration-500 ease-out flex flex-col items-center z-10"
                  style={{ left: `${gaugePosition}%`, transform: 'translateX(-50%)' }}
                >
                  <span className="text-xs font-bold text-white bg-espresso-600 px-2 py-0.5 rounded-md">
                    {result.bmi.toFixed(1)}
                  </span>
                  <ArrowDown size={14} className="text-white -mt-0.5" />
                </div>

                {/* 게이지 바 */}
                <div className="flex h-5 rounded-full overflow-hidden">
                  {gaugeSegments.map((seg, i) => (
                    <div
                      key={i}
                      className="h-full transition-all"
                      style={{ width: `${seg.width}%`, backgroundColor: seg.color }}
                    />
                  ))}
                </div>

                {/* 눈금 라벨 */}
                <div className="flex justify-between mt-1.5 text-[10px] text-oatmeal-400 px-0.5">
                  <span>10</span>
                  <span>18.5</span>
                  <span>23</span>
                  <span>25</span>
                  <span>30</span>
                  <span>40</span>
                </div>
              </div>

              {/* 요약 정보 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
                <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                  <p className="text-xs text-oatmeal-300 mb-1">정상 체중 범위</p>
                  <p className="text-base font-bold">
                    {result.normalMin.toFixed(1)} ~ {result.normalMax.toFixed(1)}kg
                  </p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                  <p className="text-xs text-oatmeal-300 mb-1">
                    {result.diff > 0 ? '정상 체중까지' : result.diff < -1 ? '정상 체중 초과분' : '상태'}
                  </p>
                  <p className="text-base font-bold">
                    {result.diff > 0 ? (
                      <span className="text-amber-300">-{result.diff.toFixed(1)}kg 필요</span>
                    ) : result.diff < -1 ? (
                      <span className="text-blue-300">+{Math.abs(result.diff).toFixed(1)}kg 부족</span>
                    ) : (
                      <span className="text-emerald-300">정상 범위</span>
                    )}
                  </p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                  <p className="text-xs text-oatmeal-300 mb-1">WHO 기준</p>
                  <p className="text-base font-bold">{result.whoCategory.label}</p>
                </div>
              </div>
            </div>

            {/* ── BMI 구간 테이블 ── */}
            <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-5 sm:p-6">
              <h3 className="text-sm font-semibold text-espresso-700 mb-4">BMI 분류 기준 비교</h3>
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm min-w-[400px]">
                  <thead>
                    <tr className="border-b-2 border-oatmeal-200">
                      <th className="text-left py-3 px-3 text-cocoa-500 font-semibold">분류</th>
                      <th className="text-center py-3 px-3 text-cocoa-500 font-semibold">
                        대한비만학회
                        <span className="block text-[10px] font-normal text-cocoa-400">(아시아 기준)</span>
                      </th>
                      <th className="text-center py-3 px-3 text-cocoa-500 font-semibold">
                        WHO
                        <span className="block text-[10px] font-normal text-cocoa-400">(국제 기준)</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: '저체중', kr: '18.5 미만', who: '18.5 미만', color: KR_CATEGORIES[0] },
                      { label: '정상', kr: '18.5 ~ 22.9', who: '18.5 ~ 24.9', color: KR_CATEGORIES[1] },
                      { label: '과체중', kr: '23 ~ 24.9', who: '25 ~ 29.9', color: KR_CATEGORIES[2] },
                      { label: '비만', kr: '25 ~ 29.9', who: '30 ~ 34.9', color: KR_CATEGORIES[3] },
                      { label: '고도비만', kr: '30 이상', who: '35 이상', color: KR_CATEGORIES[4] },
                    ].map((row) => {
                      const isActive = result.category.label === row.label;
                      return (
                        <tr
                          key={row.label}
                          className={`border-b border-oatmeal-100 transition-colors ${
                            isActive ? row.color.bgColor : 'hover:bg-cream-50/50'
                          }`}
                        >
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ backgroundColor: row.color.color }}
                              />
                              <span className={`font-medium ${isActive ? row.color.textColor + ' font-bold' : 'text-espresso-700'}`}>
                                {row.label}
                                {isActive && ' (현재)'}
                              </span>
                            </div>
                          </td>
                          <td className={`py-2.5 px-3 text-center ${isActive ? row.color.textColor + ' font-bold' : 'text-cocoa-600'}`}>
                            {row.kr}
                          </td>
                          <td className={`py-2.5 px-3 text-center ${isActive ? 'text-espresso-700 font-medium' : 'text-cocoa-600'}`}>
                            {row.who}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-cocoa-400 mt-3">
                * 대한비만학회는 아시아인 체형을 고려하여 WHO보다 낮은 기준을 적용합니다.
              </p>
            </div>

            {/* ── 키별 정상 체중 범위 표 ── */}
            <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-5 sm:p-6">
              <h3 className="text-sm font-semibold text-espresso-700 mb-4">키별 정상 체중 범위 (대한비만학회 기준)</h3>
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm min-w-[350px]">
                  <thead>
                    <tr className="border-b-2 border-oatmeal-200">
                      <th className="text-left py-3 px-3 text-cocoa-500 font-semibold">키</th>
                      <th className="text-center py-3 px-3 text-cocoa-500 font-semibold">정상 범위</th>
                      <th className="text-center py-3 px-3 text-cocoa-500 font-semibold">비만 시작</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[150, 155, 160, 165, 170, 175, 180, 185, 190].map((h) => {
                      const hM = h / 100;
                      const nMin = (18.5 * hM * hM).toFixed(1);
                      const nMax = (22.9 * hM * hM).toFixed(1);
                      const obeseStart = (25 * hM * hM).toFixed(1);
                      const isMyHeight = Math.abs(h - (parseFloat(height) || 0)) < 3;
                      return (
                        <tr
                          key={h}
                          className={`border-b border-oatmeal-100 transition-colors ${
                            isMyHeight ? 'bg-golden-50 font-medium' : 'hover:bg-cream-50/50'
                          }`}
                        >
                          <td className={`py-2 px-3 ${isMyHeight ? 'text-espresso-800 font-bold' : 'text-espresso-700'}`}>
                            {h}cm {isMyHeight && '←'}
                          </td>
                          <td className="py-2 px-3 text-center text-emerald-600">
                            {nMin} ~ {nMax}kg
                          </td>
                          <td className="py-2 px-3 text-center text-orange-500">{obeseStart}kg~</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── 팁 ── */}
            <div className="bg-gradient-to-br from-golden-50 to-cream-100 rounded-2xl border border-golden-200 p-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-golden-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-espresso-800 mb-2">BMI 활용 시 참고 사항</h4>
                  <ul className="text-sm text-cocoa-600 space-y-1.5">
                    <li>
                      • BMI는 <strong>근육량을 구분하지 못합니다.</strong> 운동을 많이 하는 사람은 정상 체지방이어도 BMI가 높게 나올 수 있습니다.
                    </li>
                    <li>
                      • <strong>아시아인</strong>은 같은 BMI에서도 서양인보다 내장 지방이 많은 경향이 있어, 대한비만학회 기준이 더 적합합니다.
                    </li>
                    <li>
                      • 정확한 체지방 측정에는 <strong>인바디(체성분 분석)</strong>를 권장합니다.
                    </li>
                    <li>
                      • BMI와 함께 <strong>허리둘레</strong>(남성 90cm, 여성 85cm 이상 시 복부 비만)도 확인하세요.
                    </li>
                    <li>
                      • 건강한 체중 감량 속도는 주당 <strong>0.5~1kg</strong>이 권장됩니다.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BmiCalculator;
