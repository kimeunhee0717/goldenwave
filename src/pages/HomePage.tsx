import ExchangeRateTicker from '@/components/home/ExchangeRateTicker'
import BriefingHero from '@/components/home/BriefingHero'
import BriefingFeed from '@/components/home/BriefingFeed'
import PopularPosts from '@/components/home/PopularPosts'
import NewsletterCTA from '@/components/home/NewsletterCTA'

export default function HomePage() {
  return (
    <>
      <ExchangeRateTicker />
      <BriefingHero />
      <BriefingFeed />
      <PopularPosts />
      <NewsletterCTA />
    </>
  )
}
