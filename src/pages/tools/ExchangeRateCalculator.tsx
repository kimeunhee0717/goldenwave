import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeftRight,
  RotateCcw,
  Info,
  ArrowUpDown,
  Search,
  RefreshCw,
} from 'lucide-react';

interface Currency {
  code: string;
  name: string;
  flag: string;
  rateToKRW: number; // 1 단위당 KRW (JPY,VND는 100단위 기준값을 /100 해서 저장)
}

interface RatesData {
  base: string;
  updatedAt: string;
  source: string;
  rates: Record<string, number>;
}

// 통화 메타 정보 (환율은 동적으로 주입)
const CURRENCY_META: { code: string; name: string; flag: string }[] = [
  { code: 'KRW', name: '대한민국 원', flag: '🇰🇷' },
  { code: 'USD', name: '미국 달러', flag: '🇺🇸' },
  { code: 'EUR', name: '유로', flag: '🇪🇺' },
  { code: 'JPY', name: '일본 엔 (100엔)', flag: '🇯🇵' },
  { code: 'CNY', name: '중국 위안', flag: '🇨🇳' },
  { code: 'GBP', name: '영국 파운드', flag: '🇬🇧' },
  { code: 'CHF', name: '스위스 프랑', flag: '🇨🇭' },
  { code: 'CAD', name: '캐나다 달러', flag: '🇨🇦' },
  { code: 'AUD', name: '호주 달러', flag: '🇦🇺' },
  { code: 'HKD', name: '홍콩 달러', flag: '🇭🇰' },
  { code: 'SGD', name: '싱가포르 달러', flag: '🇸🇬' },
  { code: 'THB', name: '태국 바트', flag: '🇹🇭' },
  { code: 'VND', name: '베트남 동 (100동)', flag: '🇻🇳' },
  { code: 'TWD', name: '대만 달러', flag: '🇹🇼' },
  { code: 'PHP', name: '필리핀 페소', flag: '🇵🇭' },
];

// 폴백 환율 (API JSON 로드 실패 시)
const FALLBACK_RATES: Record<string, number> = {
  USD: 1380, EUR: 1500, JPY: 9.2, CNY: 190, GBP: 1750,
  CHF: 1570, CAD: 1000, AUD: 890, HKD: 177, SGD: 1030,
  THB: 40, VND: 0.055, TWD: 43, PHP: 24,
};

// 100단위 통화 (JPY, VND)
const PER_HUNDRED = ['JPY', 'VND'];

function buildCurrencies(rates: Record<string, number>): Currency[] {
  return CURRENCY_META.map((meta) => ({
    ...meta,
    rateToKRW: meta.code === 'KRW' ? 1 : (rates[meta.code] ?? FALLBACK_RATES[meta.code] ?? 1),
  }));
}

const ExchangeRateCalculator: React.FC = () => {
  const [ratesData, setRatesData] = useState<RatesData | null>(null);
  const [loadError, setLoadError] = useState(false);

  // 환율 JSON 불러오기
  useEffect(() => {
    fetch('/data/exchange-rates.json')
      .then((res) => {
        if (!res.ok) throw new Error('fetch failed');
        return res.json();
      })
      .then((data: RatesData) => {
        setRatesData(data);
        setLoadError(false);
      })
      .catch(() => {
        setLoadError(true);
        setRatesData({
          base: 'KRW',
          updatedAt: '',
          source: 'fallback',
          rates: FALLBACK_RATES,
        });
      });
  }, []);

  const currencies = useMemo(
    () => buildCurrencies(ratesData?.rates ?? FALLBACK_RATES),
    [ratesData],
  );

  const [fromCode, setFromCode] = useState('USD');
  const [toCode, setToCode] = useState('KRW');
  const [amount, setAmount] = useState<string>('1000');
  const [searchTerm, setSearchTerm] = useState('');

  const fromCurrency = currencies.find((c) => c.code === fromCode)!;
  const toCurrency = currencies.find((c) => c.code === toCode)!;

  const result = useMemo(() => {
    const amt = parseFloat(amount) || 0;
    if (amt <= 0) return { converted: 0, rate: 0, reverseRate: 0 };

    let fromToKRW = fromCurrency.rateToKRW;
    let toToKRW = toCurrency.rateToKRW;

    if (PER_HUNDRED.includes(fromCode)) fromToKRW = fromToKRW / 100;
    if (PER_HUNDRED.includes(toCode)) toToKRW = toToKRW / 100;

    const rate = fromToKRW / toToKRW;
    const converted = amt * rate;
    const reverseRate = toToKRW / fromToKRW;

    return { converted, rate, reverseRate };
  }, [amount, fromCode, toCode, currencies]);

  const handleSwap = () => {
    setFromCode(toCode);
    setToCode(fromCode);
  };

  const handleReset = () => {
    setFromCode('USD');
    setToCode('KRW');
    setAmount('1000');
  };

  const formatNumber = (n: number, decimals = 2) => {
    if (Math.abs(n) >= 1) {
      return n.toLocaleString('ko-KR', { maximumFractionDigits: decimals, minimumFractionDigits: decimals });
    }
    return n.toFixed(6);
  };

  // 업데이트 시각 포맷
  const updatedAtDisplay = useMemo(() => {
    if (!ratesData?.updatedAt) return null;
    try {
      const d = new Date(ratesData.updatedAt);
      return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    } catch {
      return null;
    }
  }, [ratesData]);

  // 교차 환율
  const CROSS_CODES = ['KRW', 'USD', 'EUR', 'JPY', 'CNY', 'GBP'];
  const crossCurrencies = CROSS_CODES.map((code) => currencies.find((c) => c.code === code)!);

  const getCrossRate = (from: Currency, to: Currency) => {
    if (from.code === to.code) return 1;
    let fRate = from.rateToKRW;
    let tRate = to.rateToKRW;
    if (PER_HUNDRED.includes(from.code)) fRate /= 100;
    if (PER_HUNDRED.includes(to.code)) tRate /= 100;
    return fRate / tRate;
  };

  const formatCrossRate = (rate: number) => {
    if (rate >= 1000) return rate.toLocaleString('ko-KR', { maximumFractionDigits: 0 });
    if (rate >= 1) return rate.toLocaleString('ko-KR', { maximumFractionDigits: 2 });
    if (rate >= 0.01) return rate.toFixed(4);
    return rate.toFixed(6);
  };

  const CurrencySelect = ({
    value,
    onChange,
    label,
  }: {
    value: string;
    onChange: (code: string) => void;
    label: string;
  }) => (
    <div>
      <label className="block text-xs font-semibold text-espresso-600 mb-1.5">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border-2 border-oatmeal-200 rounded-xl focus:border-golden-400 focus:ring-2 focus:ring-golden-100 outline-none transition-all text-base font-medium text-espresso-800 bg-white appearance-none cursor-pointer"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M3 5l3 3 3-3'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
        }}
      >
        {currencies.map((c) => (
          <option key={c.code} value={c.code}>
            {c.flag} {c.code} — {c.name}
          </option>
        ))}
      </select>
    </div>
  );

  const filteredCurrencies = currencies.filter(
    (c) =>
      c.code !== 'KRW' &&
      (searchTerm === '' ||
        c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.name.includes(searchTerm)),
  );

  return (
    <>
      <SEOHead
        title="환율 계산기"
        description="실시간 환율 기반으로 통화를 변환합니다. USD, EUR, JPY, CNY 등 주요 통화 환율을 간편하게 계산하세요."
        url="/tools/exchange-rate"
      />
      <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-golden-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-espresso-800 to-espresso-950 text-white py-16 px-6">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-golden-100 rounded-2xl flex items-center justify-center">
              <ArrowLeftRight className="w-6 h-6 text-espresso-800" />
            </div>
            <span className="text-golden-200 text-sm font-medium tracking-wider uppercase">
              부자타임 도구
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">환율 계산기</h1>
          <p className="text-oatmeal-300 text-base sm:text-lg max-w-xl mx-auto">
            주요 15개 통화 간 환율을 빠르게 변환합니다.
            <br className="hidden sm:block" />
            교차 환율 테이블로 여러 통화를 한눈에 비교하세요.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-10 space-y-6">
        {/* ── 환율 갱신 상태 ── */}
        <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs ${
          ratesData?.source === 'fallback' || loadError
            ? 'bg-amber-50 border border-amber-200 text-amber-700'
            : 'bg-moss-50 border border-moss-200 text-moss-700'
        }`}>
          <div className="flex items-center gap-1.5">
            <RefreshCw size={12} />
            {ratesData?.source === 'fallback' || loadError ? (
              <span>참고용 기본 환율 사용 중 (매일 자동 업데이트 예정)</span>
            ) : (
              <span>
                환율 업데이트: {updatedAtDisplay || '알 수 없음'}
                <span className="text-moss-500 ml-1">(매일 자동 갱신)</span>
              </span>
            )}
          </div>
          {ratesData?.source && ratesData.source !== 'fallback' && (
            <span className="text-[10px] text-moss-500">출처: {ratesData.source}</span>
          )}
        </div>

        {/* ── 환율 변환 ── */}
        <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-espresso-800">환율 변환</h2>
            <button
              onClick={handleReset}
              className="text-cocoa-500 hover:text-cocoa-700 transition-colors p-1.5 rounded-lg hover:bg-oatmeal-100"
              title="초기화"
            >
              <RotateCcw size={18} />
            </button>
          </div>

          <div className="space-y-4">
            <CurrencySelect value={fromCode} onChange={setFromCode} label="보내는 통화" />

            <div>
              <label className="block text-xs font-semibold text-espresso-600 mb-1.5">금액</label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 pr-16 border-2 border-oatmeal-200 rounded-xl focus:border-golden-400 focus:ring-2 focus:ring-golden-100 outline-none transition-all text-lg font-medium text-espresso-800"
                  min="0"
                  step="any"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-cocoa-400 font-medium text-sm">
                  {fromCurrency.flag} {fromCode}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {(fromCode === 'KRW'
                  ? ['10000', '50000', '100000', '500000', '1000000']
                  : fromCode === 'JPY'
                  ? ['1000', '5000', '10000', '50000', '100000']
                  : ['100', '500', '1000', '5000', '10000']
                ).map((v) => (
                  <button
                    key={v}
                    onClick={() => setAmount(v)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                      amount === v
                        ? 'bg-golden-100 text-espresso-800 border border-golden-300'
                        : 'bg-oatmeal-100 text-cocoa-500 hover:bg-oatmeal-200 border border-transparent'
                    }`}
                  >
                    {parseInt(v).toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleSwap}
                className="w-10 h-10 rounded-full bg-moss-50 text-moss-600 hover:bg-moss-100 transition-colors flex items-center justify-center border border-moss-200"
                title="통화 전환"
              >
                <ArrowUpDown size={18} />
              </button>
            </div>

            <CurrencySelect value={toCode} onChange={setToCode} label="받는 통화" />
          </div>
        </div>

        {/* ── 변환 결과 ── */}
        <div className="bg-gradient-to-br from-espresso-800 to-espresso-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl text-center">
          <p className="text-sm text-oatmeal-400 mb-2">
            {fromCurrency.flag} {parseFloat(amount || '0').toLocaleString()} {fromCode} =
          </p>
          <div className="text-3xl sm:text-5xl font-bold text-golden-100 mb-4">
            {toCurrency.flag} {formatNumber(result.converted)}{' '}
            <span className="text-xl sm:text-2xl text-golden-200">{toCode}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <p className="text-xs text-oatmeal-400 mb-1">1 {fromCode} =</p>
              <p className="text-base font-bold">{formatNumber(result.rate, 4)} {toCode}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <p className="text-xs text-oatmeal-400 mb-1">1 {toCode} =</p>
              <p className="text-base font-bold">{formatNumber(result.reverseRate, 4)} {fromCode}</p>
            </div>
          </div>
        </div>

        {/* ── 원화 기준 환율표 ── */}
        <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h3 className="text-sm font-semibold text-espresso-700">원화(KRW) 기준 환율표</h3>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cocoa-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="통화 검색..."
                className="pl-8 pr-3 py-1.5 border border-oatmeal-200 rounded-lg text-xs outline-none focus:border-golden-400 w-full sm:w-44"
              />
            </div>
          </div>
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm min-w-[400px]">
              <thead>
                <tr className="border-b-2 border-oatmeal-200">
                  <th className="text-left py-3 px-3 text-cocoa-500 font-semibold">통화</th>
                  <th className="text-right py-3 px-3 text-cocoa-500 font-semibold">매매기준율 (원)</th>
                  <th className="text-right py-3 px-3 text-cocoa-500 font-semibold">1원 =</th>
                </tr>
              </thead>
              <tbody>
                {filteredCurrencies.map((c) => {
                  const isSelected = c.code === fromCode || c.code === toCode;
                  const unitLabel = PER_HUNDRED.includes(c.code) ? '100' : '1';
                  const rateDisplay = PER_HUNDRED.includes(c.code)
                    ? c.rateToKRW * 100
                    : c.rateToKRW;
                  const reverseDisplay = PER_HUNDRED.includes(c.code)
                    ? 100 / c.rateToKRW
                    : 1 / c.rateToKRW;
                  return (
                    <tr
                      key={c.code}
                      className={`border-b border-oatmeal-100 transition-colors cursor-pointer ${
                        isSelected ? 'bg-golden-50' : 'hover:bg-cream-50/50'
                      }`}
                      onClick={() => {
                        setFromCode(c.code);
                        setToCode('KRW');
                      }}
                    >
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{c.flag}</span>
                          <div>
                            <span className="font-medium text-espresso-800">{c.code}</span>
                            <span className="text-xs text-cocoa-400 ml-1.5 hidden sm:inline">
                              {c.name}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="font-medium text-espresso-800">
                          {formatNumber(rateDisplay, 2)}원
                        </span>
                        <span className="text-xs text-cocoa-400 ml-1">
                          / {unitLabel}{c.code}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-cocoa-600 text-xs">
                        {reverseDisplay >= 1
                          ? formatNumber(reverseDisplay, 4)
                          : reverseDisplay.toFixed(6)}{' '}
                        {c.code}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 교차 환율 테이블 ── */}
        <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-5 sm:p-6">
          <h3 className="text-sm font-semibold text-espresso-700 mb-4">주요 통화 교차 환율</h3>
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-xs min-w-[500px]">
              <thead>
                <tr className="border-b-2 border-oatmeal-200">
                  <th className="py-2 px-2 text-cocoa-500 font-semibold text-left">1 단위 →</th>
                  {crossCurrencies.map((c) => (
                    <th key={c.code} className="py-2 px-2 text-cocoa-500 font-semibold text-center">
                      {c.flag}
                      <br />
                      {c.code}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {crossCurrencies.map((from) => (
                  <tr key={from.code} className="border-b border-oatmeal-100 hover:bg-cream-50/50 transition-colors">
                    <td className="py-2 px-2 font-medium text-espresso-700">
                      {from.flag} {from.code}
                    </td>
                    {crossCurrencies.map((to) => {
                      const rate = getCrossRate(from, to);
                      const isSelf = from.code === to.code;
                      return (
                        <td
                          key={to.code}
                          className={`py-2 px-2 text-center ${
                            isSelf ? 'bg-oatmeal-50 text-cocoa-300' : 'text-espresso-700'
                          }`}
                        >
                          {isSelf ? '—' : formatCrossRate(rate)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-cocoa-400 mt-2">* JPY는 100엔 기준</p>
        </div>

        {/* ── 여행자 환전 팁 ── */}
        <div className="bg-white rounded-2xl shadow-lg shadow-espresso-900/5 border border-oatmeal-200 p-5 sm:p-6">
          <h3 className="text-sm font-semibold text-espresso-700 mb-4">여행자 빠른 환전 참고</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { code: 'USD', amounts: [100, 500, 1000] },
              { code: 'EUR', amounts: [100, 500, 1000] },
              { code: 'JPY', amounts: [10000, 50000, 100000] },
            ].map(({ code, amounts }) => {
              const cur = currencies.find((c) => c.code === code)!;
              const perUnit = PER_HUNDRED.includes(code) ? cur.rateToKRW / 100 : cur.rateToKRW;
              return (
                <div key={code} className="bg-cream-50 rounded-xl p-4">
                  <p className="text-sm font-bold text-espresso-800 mb-2">
                    {cur.flag} {code}
                  </p>
                  <div className="space-y-1.5">
                    {amounts.map((a) => (
                      <div key={a} className="flex justify-between text-xs">
                        <span className="text-cocoa-500">
                          {a.toLocaleString()} {code}
                        </span>
                        <span className="font-medium text-espresso-700">
                          ≈ {Math.round(a * perUnit).toLocaleString()}원
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 팁 ── */}
        <div className="bg-gradient-to-br from-golden-50 to-cream-100 rounded-2xl border border-golden-200 p-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-golden-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-bold text-espresso-800 mb-2">환율 & 환전 참고 사항</h4>
              <ul className="text-sm text-cocoa-600 space-y-1.5">
                <li>
                  • 환율은 <strong>매일 자동 갱신</strong>되며, 실제 은행 매매기준율과 소폭 차이가 있을 수 있습니다.
                </li>
                <li>
                  • <strong>은행 환전</strong> 시 매매기준율에 수수료(스프레드)가 추가됩니다. 보통 1~2% 수준입니다.
                </li>
                <li>
                  • <strong>환전 우대 쿠폰</strong>을 활용하면 수수료를 50~90%까지 절약할 수 있습니다.
                </li>
                <li>
                  • <strong>해외 결제 시</strong> 신용카드의 해외 결제 수수료(약 1~1.5%)도 고려하세요.
                </li>
                <li>
                  • 대량 환전이 필요하면 <strong>환율 알림</strong>을 설정해 유리한 시점에 환전하는 것이
                  좋습니다.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  
    </>);
};

export default ExchangeRateCalculator;
