import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface RateData {
  base: string
  updatedAt: string
  rates: Record<string, number>
}

const DISPLAY_CURRENCIES = [
  { code: 'USD', label: '달러', flag: '🇺🇸' },
  { code: 'EUR', label: '유로', flag: '🇪🇺' },
  { code: 'JPY', label: '엔(100)', flag: '🇯🇵' },
  { code: 'CNY', label: '위안', flag: '🇨🇳' },
]

export default function ExchangeRateTicker() {
  const [rates, setRates] = useState<RateData | null>(null)

  useEffect(() => {
    fetch('/data/exchange-rates.json')
      .then((res) => res.json())
      .then((data) => setRates(data))
      .catch(() => {})
  }, [])

  if (!rates) return null

  const updatedDate = new Date(rates.updatedAt).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="bg-soot-900 text-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex items-center gap-6 py-2.5 overflow-x-auto scrollbar-hide text-sm">
          <span className="text-golden-400 font-bold whitespace-nowrap flex-shrink-0">
            💰 환율
          </span>
          {DISPLAY_CURRENCIES.map(({ code, label, flag }) => {
            const rate = rates.rates[code]
            if (!rate) return null
            const displayRate = code === 'JPY' ? (rate * 100).toFixed(2) : rate.toFixed(2)

            return (
              <div
                key={code}
                className="flex items-center gap-1.5 whitespace-nowrap flex-shrink-0"
              >
                <span>{flag}</span>
                <span className="text-soot-300">{label}</span>
                <span className="font-semibold text-white">
                  {Number(displayRate).toLocaleString()}원
                </span>
              </div>
            )
          })}
          <span className="text-soot-500 text-xs whitespace-nowrap flex-shrink-0">
            {updatedDate} 기준
          </span>
        </div>
      </div>
    </div>
  )
}
