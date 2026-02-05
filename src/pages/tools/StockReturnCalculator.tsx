import React, { useState, useMemo } from 'react';
import { BarChart3, RotateCcw, Info, TrendingUp, TrendingDown } from 'lucide-react';

type Market = 'kospi' | 'kosdaq' | 'us';

const MARKET_INFO: Record<Market, { label: string; taxRate: number; taxName: string }> = {
  kospi: { label: 'KOSPI', taxRate: 0.0018, taxName: '증권거래세 0.18%' },
  kosdaq: { label: 'KOSDAQ', taxRate: 0.0018, taxName: '증권거래세 0.18%' },
  us: { label: '해외(미국)', taxRate: 0, taxName: '양도세 별도 (22%)' },
};

const StockReturnCalculator: React.FC = () => {
  const [market, setMarket] = useState<Market>('kospi');
  const [buyPrice, setBuyPrice] = useState<string>('50000');
  const [sellPrice, setSellPrice] = useState<string>('65000');
  const [quantity, setQuantity] = useState<string>('100');
  const [commissionRate, setCommissionRate] = useState<string>('0.015'); // 수수료율 %
  // 해외 주식용
  const [usCapitalGainExempt] = useState<number>(2500000); // 기본공제 250만원

  const result = useMemo(() => {
    const bp = parseFloat(buyPrice) || 0;
    const sp = parseFloat(sellPrice) || 0;
    const qty = parseInt(quantity) || 0;
    const commRate = (parseFloat(commissionRate) || 0) / 100;
    const mkt = MARKET_INFO[market];

    if (bp <= 0 || qty <= 0) return null;

    const totalBuy = bp * qty;
    const totalSell = sp * qty;

    const buyCommission = totalBuy * commRate;
    const sellCommission = totalSell * commRate;
    const totalCommission = buyCommission + sellCommission;

    // 거래세 (매도 시에만, 국내만)
    const transactionTax = market !== 'us' ? totalSell * mkt.taxRate : 0;

    // 해외주식 양도세 (순이익 250만원 초과분의 22%)
    let capitalGainTax = 0;
    const grossProfit = totalSell - totalBuy;
    if (market === 'us' && grossProfit > 0) {
      const taxableGain = Math.max(0, grossProfit - totalCommission - usCapitalGainExempt);
      capitalGainTax = taxableGain * 0.22;
    }

    const totalCost = totalCommission + transactionTax + capitalGainTax;
    const netProfit = totalSell - totalBuy - totalCost;
    const returnRate = totalBuy > 0 ? (netProfit / (totalBuy + buyCommission)) * 100 : 0;
    const grossReturnRate = totalBuy > 0 ? (grossProfit / totalBuy) * 100 : 0;

    // 목표가별 수익률 비교 (현재 매수가 기준)
    const targets = [-30, -20, -10, 0, 10, 20, 30, 50, 100].map((pct) => {
      const target = bp * (1 + pct / 100);
      const tSell = target * qty;
      const tBuyComm = totalBuy * commRate;
      const tSellComm = tSell * commRate;
      const tComm = tBuyComm + tSellComm;
      const tTax = market !== 'us' ? tSell * mkt.taxRate : 0;
      let tCapTax = 0;
      const tGross = tSell - totalBuy;
      if (market === 'us' && tGross > 0) {
        const tTaxable = Math.max(0, tGross - tComm - usCapitalGainExempt);
        tCapTax = tTaxable * 0.22;
      }
      const tNet = tSell - totalBuy - tComm - tTax - tCapTax;
      const tRate = (totalBuy + tBuyComm) > 0 ? (tNet / (totalBuy + tBuyComm)) * 100 : 0;
      return { pct, targetPrice: target, netProfit: tNet, returnRate: tRate };
    });

    return {
      totalBuy,
      totalSell,
      buyCommission,
      sellCommission,
      totalCommission,
      transactionTax,
      capitalGainTax,
      totalCost,
      grossProfit,
      netProfit,
      returnRate,
      grossReturnRate,
      targets,
    };
  }, [buyPrice, sellPrice, quantity, commissionRate, market]);

  const handleReset = () => {
    setMarket('kospi');
    setBuyPrice('50000');
    setSellPrice('65000');
    setQuantity('100');
    setCommissionRate('0.015');
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

  const isProfit = result ? result.netProfit >= 0 : true;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-golden-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-espresso-800 to-espresso-950 text-white py-16 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-golden-100 rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-espresso-800" />
            </div>
            <span className="text-golden-200 text-sm font-medium tracking-wider uppercase">부자타임 도구</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">주식 수익률 계산기</h1>
          <p className="text-oatmeal-300 text-base sm:text-lg max-w-2xl">
            매수가·매도가를 입력하면 수수료와 세금을 반영한 실질 수익률을 계산합니다.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* ── 입력 패널 ── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-espresso-800">매매 조건</h2>
                <button
                  onClick={handleReset}
                  className="text-cocoa-500 hover:text-cocoa-700 transition-colors p-1.5 rounded-lg hover:bg-oatmeal-100"
                  title="초기화"
                >
                  <RotateCcw size={18} />
                </button>
              </div>

              <div className="space-y-5">
                {/* 시장 선택 */}
                <div>
                  <label className="block text-xs font-semibold text-espresso-600 mb-2">시장</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['kospi', 'kosdaq', 'us'] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => setMarket(m)}
                        className={`py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          market === m
                            ? 'bg-golden-100 text-espresso-800 border-2 border-golden-300'
                            : 'bg-oatmeal-50 text-cocoa-400 border-2 border-transparent hover:bg-oatmeal-100'
                        }`}
                      >
                        {MARKET_INFO[m].label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-cocoa-400 mt-1">{MARKET_INFO[market].taxName}</p>
                </div>

                {/* 매수가 */}
                <div>
                  <label className="block text-xs font-semibold text-espresso-600 mb-1.5">매수가 (1주)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={buyPrice}
                      onChange={(e) => setBuyPrice(e.target.value)}
                      className="w-full px-4 py-3 pr-8 border-2 border-oatmeal-200 rounded-xl focus:border-golden-400 focus:ring-2 focus:ring-golden-100 outline-none transition-all text-lg font-medium text-espresso-800"
                      min="0"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-cocoa-400 text-sm">원</span>
                  </div>
                </div>

                {/* 매도가 */}
                <div>
                  <label className="block text-xs font-semibold text-espresso-600 mb-1.5">매도가 (1주)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={sellPrice}
                      onChange={(e) => setSellPrice(e.target.value)}
                      className="w-full px-4 py-3 pr-8 border-2 border-oatmeal-200 rounded-xl focus:border-golden-400 focus:ring-2 focus:ring-golden-100 outline-none transition-all text-lg font-medium text-espresso-800"
                      min="0"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-cocoa-400 text-sm">원</span>
                  </div>
                </div>

                {/* 수량 */}
                <div>
                  <label className="block text-xs font-semibold text-espresso-600 mb-1.5">수량</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full px-4 py-3 pr-8 border-2 border-oatmeal-200 rounded-xl focus:border-golden-400 focus:ring-2 focus:ring-golden-100 outline-none transition-all text-lg font-medium text-espresso-800"
                      min="1"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-cocoa-400 text-sm">주</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {['10', '50', '100', '500', '1000'].map((v) => (
                      <button
                        key={v}
                        onClick={() => setQuantity(v)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                          quantity === v
                            ? 'bg-golden-100 text-espresso-800 border border-golden-300'
                            : 'bg-oatmeal-100 text-cocoa-500 hover:bg-oatmeal-200 border border-transparent'
                        }`}
                      >
                        {parseInt(v).toLocaleString()}주
                      </button>
                    ))}
                  </div>
                </div>

                {/* 수수료율 */}
                <div>
                  <label className="block text-xs font-semibold text-espresso-600 mb-1.5">증권사 수수료율</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={commissionRate}
                      onChange={(e) => setCommissionRate(e.target.value)}
                      className="w-full px-4 py-3 pr-8 border-2 border-oatmeal-200 rounded-xl focus:border-golden-400 focus:ring-2 focus:ring-golden-100 outline-none transition-all text-lg font-medium text-espresso-800"
                      step="0.001"
                      min="0"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-cocoa-400 text-sm">%</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[
                      { label: 'MTS 무료', val: '0' },
                      { label: '0.015%', val: '0.015' },
                      { label: '0.05%', val: '0.05' },
                      { label: '0.1%', val: '0.1' },
                    ].map(({ label, val }) => (
                      <button
                        key={val}
                        onClick={() => setCommissionRate(val)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                          commissionRate === val
                            ? 'bg-golden-100 text-espresso-800 border border-golden-300'
                            : 'bg-oatmeal-100 text-cocoa-500 hover:bg-oatmeal-200 border border-transparent'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── 결과 패널 ── */}
          <div className="lg:col-span-3 space-y-6">
            {result && (
              <>
                {/* 핵심 결과 */}
                <div className="bg-gradient-to-br from-espresso-800 to-espresso-950 rounded-2xl p-6 text-white shadow-xl">
                  <h3 className="text-sm font-medium text-golden-200 mb-4 tracking-wider uppercase">
                    실질 수익률
                  </h3>
                  <div className="flex items-end gap-3 mb-5">
                    <div className={`text-4xl sm:text-5xl font-bold ${isProfit ? 'text-green-300' : 'text-red-300'}`}>
                      {isProfit ? '+' : ''}{result.returnRate.toFixed(2)}%
                    </div>
                    {isProfit ? <TrendingUp className="text-green-300 mb-2" size={28} /> : <TrendingDown className="text-red-300 mb-2" size={28} />}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                      <p className="text-xs text-oatmeal-300 mb-1">총 매수금</p>
                      <p className="text-sm font-bold">{formatKRW(result.totalBuy)}</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                      <p className="text-xs text-oatmeal-300 mb-1">총 매도금</p>
                      <p className="text-sm font-bold">{formatKRW(result.totalSell)}</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                      <p className="text-xs text-oatmeal-300 mb-1">총 비용</p>
                      <p className="text-sm font-bold text-amber-200">{formatKRW(result.totalCost)}</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                      <p className="text-xs text-oatmeal-300 mb-1">순수익</p>
                      <p className={`text-sm font-bold ${isProfit ? 'text-green-300' : 'text-red-300'}`}>
                        {isProfit ? '+' : ''}{formatKRW(result.netProfit)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 비용 상세 */}
                <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-5 sm:p-6">
                  <h3 className="text-sm font-semibold text-espresso-700 mb-4">비용 상세 내역</h3>
                  <div className="space-y-3">
                    {[
                      { label: '총 매수금액', value: result.totalBuy, color: '' },
                      { label: '총 매도금액', value: result.totalSell, color: '' },
                      { label: `매수 수수료 (${commissionRate}%)`, value: result.buyCommission, color: 'text-amber-600' },
                      { label: `매도 수수료 (${commissionRate}%)`, value: result.sellCommission, color: 'text-amber-600' },
                      ...(market !== 'us'
                        ? [{ label: MARKET_INFO[market].taxName, value: result.transactionTax, color: 'text-amber-600' }]
                        : []),
                      ...(market === 'us' && result.capitalGainTax > 0
                        ? [{ label: '양도소득세 (22%, 250만원 공제 후)', value: result.capitalGainTax, color: 'text-red-500' }]
                        : []),
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-oatmeal-100 last:border-0">
                        <span className="text-sm text-cocoa-600">{item.label}</span>
                        <span className={`text-sm font-medium ${item.color || 'text-espresso-800'}`}>
                          {formatKRW(item.value)}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-3 border-t-2 border-oatmeal-200">
                      <span className="text-sm font-bold text-espresso-800">순수익</span>
                      <span className={`text-lg font-bold ${isProfit ? 'text-green-600' : 'text-red-500'}`}>
                        {isProfit ? '+' : ''}{formatKRW(result.netProfit)}
                      </span>
                    </div>
                  </div>

                  {/* 수익률 비교 바 */}
                  <div className="mt-5 space-y-2">
                    <div className="flex items-center justify-between text-xs text-cocoa-500">
                      <span>단순 수익률</span>
                      <span className={result.grossReturnRate >= 0 ? 'text-green-600' : 'text-red-500'}>
                        {result.grossReturnRate >= 0 ? '+' : ''}{result.grossReturnRate.toFixed(2)}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-oatmeal-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${result.grossReturnRate >= 0 ? 'bg-green-300' : 'bg-red-300'}`}
                        style={{ width: `${Math.min(100, Math.abs(result.grossReturnRate))}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-cocoa-500">
                      <span>실질 수익률 (비용 차감)</span>
                      <span className={result.returnRate >= 0 ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>
                        {result.returnRate >= 0 ? '+' : ''}{result.returnRate.toFixed(2)}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-oatmeal-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${result.returnRate >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(100, Math.abs(result.returnRate))}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* 목표가별 수익률 */}
                <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-5 sm:p-6">
                  <h3 className="text-sm font-semibold text-espresso-700 mb-4">목표가별 수익률 비교</h3>
                  <div className="overflow-x-auto -mx-2">
                    <table className="w-full text-sm min-w-[450px]">
                      <thead>
                        <tr className="border-b-2 border-oatmeal-200">
                          <th className="text-left py-3 px-3 text-cocoa-500 font-semibold">등락률</th>
                          <th className="text-right py-3 px-3 text-cocoa-500 font-semibold">목표가</th>
                          <th className="text-right py-3 px-3 text-cocoa-500 font-semibold">순수익</th>
                          <th className="text-right py-3 px-3 text-cocoa-500 font-semibold">실질 수익률</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.targets.map((t) => {
                          const isCurrent =
                            Math.abs(t.targetPrice - (parseFloat(sellPrice) || 0)) < 1;
                          return (
                            <tr
                              key={t.pct}
                              className={`border-b border-oatmeal-100 transition-colors ${
                                isCurrent ? 'bg-golden-50' : 'hover:bg-cream-50/50'
                              }`}
                            >
                              <td className={`py-2.5 px-3 font-medium ${t.pct >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {t.pct >= 0 ? '+' : ''}{t.pct}%
                              </td>
                              <td className="py-2.5 px-3 text-right text-espresso-700">
                                {Math.round(t.targetPrice).toLocaleString()}원
                              </td>
                              <td className={`py-2.5 px-3 text-right font-medium ${t.netProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {t.netProfit >= 0 ? '+' : ''}{formatKRW(t.netProfit)}
                              </td>
                              <td className={`py-2.5 px-3 text-right font-bold ${t.returnRate >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {t.returnRate >= 0 ? '+' : ''}{t.returnRate.toFixed(2)}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 팁 */}
                <div className="bg-gradient-to-br from-golden-50 to-cream-100 rounded-2xl border border-golden-200 p-6">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-golden-600 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-bold text-espresso-800 mb-2">주식 거래 비용 참고</h4>
                      <ul className="text-sm text-cocoa-600 space-y-1.5">
                        <li>
                          • <strong>증권거래세</strong>: KOSPI·KOSDAQ 모두 0.18% (2025년 기준, 매도 시 부과).
                        </li>
                        <li>
                          • <strong>증권사 수수료</strong>: MTS 기준 0.003~0.05%, 이벤트로 무료인 경우도 많습니다.
                        </li>
                        <li>
                          • <strong>해외주식 양도세</strong>: 연간 순이익 250만원 초과분에 22% (지방세 포함).
                          매년 5월 신고·납부.
                        </li>
                        <li>
                          • <strong>국내주식 양도세</strong>: 대주주(종목별 10억 이상)가 아니면 비과세입니다.
                        </li>
                        <li>
                          • 실질 수익률은 수수료·세금 차감 후 기준이므로, 단순 수익률과 차이가 있습니다.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockReturnCalculator;
