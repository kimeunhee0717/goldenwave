import ExchangeRateTicker from '@/components/home/ExchangeRateTicker'
import BriefingHero from '@/components/home/BriefingHero'
import BriefingFeed from '@/components/home/BriefingFeed'
import PopularPosts from '@/components/home/PopularPosts'
import NewsletterCTA from '@/components/home/NewsletterCTA'
import SEOHead from '@/components/common/SEOHead'

export default function HomePage() {
  return (
    <>
      <SEOHead
        title="부자타임"
        description="AI, 재테크, 부업, 비즈니스 — 경제적 자유를 향한 매일의 인사이트를 전합니다. 복리 계산기, 연봉 계산기 등 무료 재무 도구도 이용하세요."
        url="/"
      />
      <BriefingHero />
      <BriefingFeed />
      <PopularPosts />
      <NewsletterCTA />
    </>
  )
}
