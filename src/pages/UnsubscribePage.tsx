import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { MailX, Loader2, CheckCircle2, AlertCircle, Home } from 'lucide-react'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export default function UnsubscribePage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('no-token')
      setMessage('유효하지 않은 구독 해지 링크입니다.')
      return
    }

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      setStatus('error')
      setMessage('서비스 준비 중입니다.')
      return
    }

    const unsubscribe = async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/unsubscribe?token=${token}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            },
          }
        )

        const data = await res.json()

        if (res.ok && data.success) {
          setStatus('success')
          setMessage(data.message || '구독이 해지되었습니다.')
        } else {
          setStatus('error')
          setMessage(data.error || '구독 해지 처리 중 오류가 발생했습니다.')
        }
      } catch {
        setStatus('error')
        setMessage('네트워크 오류가 발생했습니다.')
      }
    }

    unsubscribe()
  }, [token])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-20">
      <div className="max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 size={48} className="mx-auto text-soot-400 animate-spin mb-6" />
            <h1 className="text-2xl font-bold text-soot-800 mb-2">구독 해지 처리 중...</h1>
            <p className="text-soot-500">잠시만 기다려주세요.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-moss-100 rounded-full mb-6">
              <CheckCircle2 size={32} className="text-moss-600" />
            </div>
            <h1 className="text-2xl font-bold text-soot-800 mb-3">구독이 해지되었습니다</h1>
            <p className="text-soot-500 mb-8">{message}</p>
            <p className="text-sm text-soot-400 mb-6">
              마음이 바뀌시면 언제든 다시 구독하실 수 있습니다.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-espresso-800 hover:bg-espresso-700 text-white rounded-full font-semibold text-sm transition-colors"
            >
              <Home size={16} /> 홈으로 돌아가기
            </Link>
          </>
        )}

        {(status === 'error' || status === 'no-token') && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-6">
              <AlertCircle size={32} className="text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-soot-800 mb-3">오류가 발생했습니다</h1>
            <p className="text-soot-500 mb-8">{message}</p>
            <p className="text-sm text-soot-400 mb-6">
              문제가 계속되면 <a href="mailto:hello@bujatime.com" className="text-moss-600 underline">hello@bujatime.com</a>으로 문의해주세요.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-espresso-800 hover:bg-espresso-700 text-white rounded-full font-semibold text-sm transition-colors"
            >
              <Home size={16} /> 홈으로 돌아가기
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
