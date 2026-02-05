import { useState } from 'react'
import { Mail, ArrowRight } from 'lucide-react'

export default function NewsletterCTA() {
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: 뉴스레터 구독 API 연동
    alert('뉴스레터 구독 기능은 준비 중입니다.')
    setEmail('')
  }

  return (
    <section data-newsletter className="py-16 bg-gradient-to-br from-soot-900 via-soot-800 to-moss-900">
      <div className="container mx-auto px-6 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-moss-600 rounded-2xl mb-6">
          <Mail className="text-white" size={24} />
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
          매일 아침, 부자 브리핑을 받아보세요
        </h2>
        <p className="text-soot-300 text-lg mb-8 max-w-xl mx-auto">
          AI, 재테크, 부업 인사이트를 매일 아침 이메일로 보내드립니다.
          <br className="hidden md:block" />
          5,000명 이상의 구독자와 함께하세요.
        </p>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일 주소 입력"
            required
            className="w-full px-5 py-3.5 bg-white/10 border border-white/20 rounded-full text-white placeholder-soot-400 focus:outline-none focus:ring-2 focus:ring-moss-500 focus:border-transparent text-sm"
          />
          <button
            type="submit"
            className="w-full sm:w-auto flex-shrink-0 px-6 py-3.5 bg-moss-600 hover:bg-moss-500 text-white rounded-full font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-moss-900/30"
          >
            구독하기 <ArrowRight size={16} />
          </button>
        </form>
        <p className="mt-4 text-xs text-soot-500">
          구독은 언제든 취소할 수 있습니다. 스팸 없이, 가치 있는 콘텐츠만 보내드립니다.
        </p>
      </div>
    </section>
  )
}
