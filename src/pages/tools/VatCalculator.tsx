import React, { useState, useMemo } from 'react';
import {
  Receipt,
  ArrowRight,
  AlertTriangle,
  Copy,
  Check,
} from 'lucide-react';

/* ---------- types ---------- */
type InputMode = 'supply' | 'vat' | 'total';

const modeLabels: Record<InputMode, string> = {
  supply: '공급가액',
  vat: '부가세',
  total: '합계(공급대가)',
};

/* ---------- helpers ---------- */
const fmt = (n: number) => n.toLocaleString('ko-KR');

/* ---------- component ---------- */
const VatCalculator: React.FC = () => {
  const [mode, setMode] = useState<InputMode>('total');
  const [amount, setAmount] = useState(110000);
  const [vatRate, setVatRate] = useState(10); // 기본 10%
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const result = useMemo(() => {
    const rate = vatRate / 100;
    let supply = 0;
    let vat = 0;
    let total = 0;

    switch (mode) {
      case 'supply':
        supply = amount;
        vat = Math.round(supply * rate);
        total = supply + vat;
        break;
      case 'vat':
        vat = amount;
        supply = rate > 0 ? Math.round(vat / rate) : 0;
        total = supply + vat;
        break;
      case 'total':
        total = amount;
        supply = rate > 0 ? Math.round(total / (1 + rate)) : total;
        vat = total - supply;
        break;
    }

    return { supply, vat, total };
  }, [mode, amount, vatRate]);

  const handleCopy = async (value: number, field: string) => {
    try {
      await navigator.clipboard.writeText(value.toString());
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    } catch {
      // clipboard 미지원
    }
  };

  // 빠른 금액 목록
  const quickAmounts: Record<InputMode, number[]> = {
    supply: [10000, 50000, 100000, 500000, 1000000, 5000000],
    vat: [1000, 5000, 10000, 50000, 100000, 500000],
    total: [11000, 55000, 110000, 550000, 1100000, 5500000],
  };

  // 금액대별 비교 테이블
  const compareTable = useMemo(() => {
    const amounts = [10000, 50000, 100000, 300000, 500000, 1000000, 3000000, 5000000, 10000000];
    const rate = vatRate / 100;
    return amounts.map((a) => {
      const supply = a;
      const vat = Math.round(a * rate);
      return { supply, vat, total: supply + vat };
    });
  }, [vatRate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero */}
      <section className="bg-gradient-to-r from-espresso-800 to-espresso-950 text-white pt-28 pb-12 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Receipt size={22} />
            </div>
            <span className="text-oatmeal-300 text-sm font-medium">부자타임 도구</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">부가세(VAT) 계산기</h1>
          <p className="text-oatmeal-300 text-base md:text-lg">
            공급가↔부가세↔합계를 빠르게 상호 변환합니다.
          </p>
        </div>
      </section>

      {/* Main */}
      <section className="px-4 sm:px-6 py-8 lg:py-12">
        <div className="container mx-auto max-w-4xl space-y-8">

          {/* 입력 카드 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
            {/* 입력 모드 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-600 mb-2">입력 기준</label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(modeLabels) as InputMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`px-3 py-3 rounded-xl text-sm font-medium transition-all ${
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
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                {modeLabels[mode]} 입력
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  min={0}
                  className="w-full border-2 border-oatmeal-200 rounded-xl px-4 py-4 text-right pr-12 text-xl font-bold focus:border-espresso-400 focus:outline-none transition-colors"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">원</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {quickAmounts[mode].map((a) => (
                  <button
                    key={a}
                    onClick={() => setAmount(a)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      amount === a
                        ? 'bg-espresso-800 text-white'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {fmt(a)}원
                  </button>
                ))}
              </div>
            </div>

            {/* 부가세율 */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-slate-600 shrink-0">부가세율</label>
              <div className="flex gap-2">
                {[10, 5, 0].map((r) => (
                  <button
                    key={r}
                    onClick={() => setVatRate(r)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      vatRate === r
                        ? 'bg-espresso-800 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {r}%
                  </button>
                ))}
              </div>
              <div className="relative ml-auto">
                <input
                  type="number"
                  value={vatRate}
                  onChange={(e) => setVatRate(Math.max(0, Number(e.target.value)))}
                  min={0}
                  max={100}
                  step={0.5}
                  className="w-20 border border-slate-200 rounded-lg px-2 py-2 text-right pr-6 text-sm focus:border-espresso-400 focus:outline-none"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">%</span>
              </div>
            </div>
          </div>

          {/* 결과 카드 */}
          <div className="bg-gradient-to-r from-espresso-800 to-espresso-950 text-white rounded-2xl p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* 공급가액 */}
              <div className={`rounded-xl p-5 ${mode === 'supply' ? 'bg-white/20 ring-2 ring-white/40' : 'bg-white/10'}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-oatmeal-300">공급가액</p>
                  <button
                    onClick={() => handleCopy(result.supply, 'supply')}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                    title="복사"
                  >
                    {copiedField === 'supply' ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
                <p className="text-2xl sm:text-3xl font-bold">{fmt(result.supply)}<span className="text-sm ml-1">원</span></p>
              </div>

              {/* 부가세 */}
              <div className={`rounded-xl p-5 ${mode === 'vat' ? 'bg-white/20 ring-2 ring-white/40' : 'bg-white/10'}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-oatmeal-300">부가세 ({vatRate}%)</p>
                  <button
                    onClick={() => handleCopy(result.vat, 'vat')}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                    title="복사"
                  >
                    {copiedField === 'vat' ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
                <p className="text-2xl sm:text-3xl font-bold">{fmt(result.vat)}<span className="text-sm ml-1">원</span></p>
              </div>

              {/* 합계 */}
              <div className={`rounded-xl p-5 ${mode === 'total' ? 'bg-white/20 ring-2 ring-white/40' : 'bg-white/10'}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-oatmeal-300">합계 (공급대가)</p>
                  <button
                    onClick={() => handleCopy(result.total, 'total')}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                    title="복사"
                  >
                    {copiedField === 'total' ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
                <p className="text-2xl sm:text-3xl font-bold">{fmt(result.total)}<span className="text-sm ml-1">원</span></p>
              </div>
            </div>

            {/* 수식 */}
            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-center gap-3 text-sm">
              <span className="bg-white/10 rounded-lg px-3 py-1.5">공급가 {fmt(result.supply)}원</span>
              <span className="text-oatmeal-400">+</span>
              <span className="bg-white/10 rounded-lg px-3 py-1.5">부가세 {fmt(result.vat)}원</span>
              <span className="text-oatmeal-400">=</span>
              <span className="bg-white/20 rounded-lg px-3 py-1.5 font-bold">합계 {fmt(result.total)}원</span>
            </div>
          </div>

          {/* 변환 시각화 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
            <h3 className="text-base font-bold text-slate-800 mb-4">구성 비율</h3>
            <div className="relative">
              <div className="flex h-12 rounded-xl overflow-hidden">
                {result.total > 0 && (
                  <>
                    <div
                      className="bg-moss-500 flex items-center justify-center transition-all duration-500"
                      style={{ width: `${(result.supply / result.total) * 100}%` }}
                    >
                      <span className="text-xs font-bold text-white">
                        공급가 {Math.round((result.supply / result.total) * 100)}%
                      </span>
                    </div>
                    <div
                      className="bg-amber-500 flex items-center justify-center transition-all duration-500"
                      style={{ width: `${(result.vat / result.total) * 100}%` }}
                    >
                      <span className="text-xs font-bold text-white">
                        VAT {Math.round((result.vat / result.total) * 100)}%
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 금액대별 비교 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
            <h3 className="text-base font-bold text-slate-800 mb-4">공급가액별 부가세·합계 참조표</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left py-2 px-3 font-medium text-slate-500">공급가액</th>
                    <th className="text-right py-2 px-3 font-medium text-amber-600">부가세 ({vatRate}%)</th>
                    <th className="text-right py-2 px-3 font-medium text-slate-700">합계</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {compareTable.map((row) => {
                    const isActive = row.supply === result.supply;
                    return (
                      <tr
                        key={row.supply}
                        className={isActive ? 'bg-espresso-50 font-bold' : 'hover:bg-slate-50 cursor-pointer'}
                        onClick={() => { setMode('supply'); setAmount(row.supply); }}
                      >
                        <td className="py-2.5 px-3 text-slate-700 flex items-center gap-1.5">
                          {isActive && <ArrowRight size={12} className="text-espresso-600" />}
                          {fmt(row.supply)}원
                        </td>
                        <td className="py-2.5 px-3 text-right text-amber-600">{fmt(row.vat)}원</td>
                        <td className="py-2.5 px-3 text-right font-medium">{fmt(row.total)}원</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 참고 사항 */}
          <div className="bg-gradient-to-br from-golden-50 to-cream-100 rounded-2xl border border-golden-200 p-5 sm:p-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <AlertTriangle size={20} className="text-golden-600" />
              부가세 안내
            </h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-golden-500 mt-0.5">•</span>
                <span><strong>부가가치세(VAT)</strong>: 재화·용역의 공급 시 부과되는 간접세로, 한국은 <strong>10%</strong>가 기본세율입니다.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-golden-500 mt-0.5">•</span>
                <span><strong>면세 사업자</strong>: 의료, 교육, 금융, 도서, 농수산물 등은 부가세가 면제됩니다.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-golden-500 mt-0.5">•</span>
                <span><strong>간이과세자</strong>: 연 매출 8,000만원 미만 사업자는 업종별 부가가치율을 적용합니다.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-golden-500 mt-0.5">•</span>
                <span><strong>신고·납부</strong>: 1기(1~6월) → 7/25, 2기(7~12월) → 다음해 1/25까지 신고합니다.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default VatCalculator;
