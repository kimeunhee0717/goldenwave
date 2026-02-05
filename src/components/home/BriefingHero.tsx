import { Clock } from 'lucide-react'

export default function BriefingHero() {
  const today = new Date()
  const formattedDate = today.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  return (
    <section className="pt-28 pb-8 bg-gradient-to-b from-cream-50 to-cream-100">
      <div className="container mx-auto px-6">
        <div className="flex items-center gap-2 text-soot-500 text-sm mb-3">
          <Clock size={14} />
          <time>{formattedDate}</time>
        </div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-soot-900 tracking-tight">
          오늘의 부자 브리핑
        </h1>
        <p className="mt-3 text-base md:text-lg text-soot-500 max-w-2xl">
          AI, 재테크, 부업, 마인드셋 — 경제적 자유를 향한 오늘의 인사이트
        </p>
      </div>
    </section>
  )
}
