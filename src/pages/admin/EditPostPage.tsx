import { useState, useEffect } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { usePosts } from '@/hooks/usePosts'
import { useAdmin } from '@/contexts/AdminContext'
import BlogPostContent from '@/components/blog/BlogPostContent'
import { Save, Eye, Edit3, ArrowLeft, Loader2, Check, AlertCircle, Wrench } from 'lucide-react'
import { fixMarkdown } from '@/lib/fixMarkdown'

const LOCAL_API = 'http://localhost:18790'

export default function EditPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { getPostBySlug, isLoading } = usePosts()
  const { isAdmin, adminPassword } = useAdmin()

  const post = slug ? getPostBySlug(slug) : undefined

  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [isPreview, setIsPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [fixLog, setFixLog] = useState<string[]>([])
  const [showFixLog, setShowFixLog] = useState(false)
  useEffect(() => {
    if (post) {
      setContent(post.content)
      setTitle(post.title)
    }
  }, [post])

  if (!isAdmin) {
    return <Navigate to="/admin" replace />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    )
  }

  if (!post) {
    return <Navigate to="/blog" replace />
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveStatus('idle')
    setErrorMsg('')

    try {
      const res = await fetch(
        `${LOCAL_API}/api/post/${post.category.id}/${slug}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        }
      )

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || '저장 실패')
      }

      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (err: any) {
      setSaveStatus('error')
      setErrorMsg(
        err.message === 'Failed to fetch'
          ? '로컬 API 서버가 꺼져 있습니다. node local-api.js를 실행해주세요.'
          : err.message || '알 수 없는 오류'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 바 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/blog/${slug}`)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              돌아가기
            </button>
            <div className="h-6 w-px bg-gray-300" />
            <h1 className="text-lg font-semibold text-gray-900 truncate max-w-md">
              {title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* 마크다운 자동 수정 */}
            <button
              onClick={() => {
                const { fixed, changes } = fixMarkdown(content)
                if (changes.length === 0) {
                  setFixLog(['✅ 수정할 오류가 없습니다!'])
                } else {
                  setContent(fixed)
                  setFixLog(changes)
                }
                setShowFixLog(true)
                setTimeout(() => setShowFixLog(false), 5000)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg transition-colors"
            >
              <Wrench className="w-4 h-4" />
              자동 수정
            </button>

            {/* 미리보기 토글 */}
            <button
              onClick={() => setIsPreview(!isPreview)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isPreview
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isPreview ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {isPreview ? '편집' : '미리보기'}
            </button>

            {/* 저장 버튼 */}
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg font-semibold transition-all ${
                saveStatus === 'success'
                  ? 'bg-green-500 text-white'
                  : saveStatus === 'error'
                  ? 'bg-red-500 text-white'
                  : 'bg-amber-500 text-white hover:bg-amber-600'
              } disabled:opacity-50`}
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> 저장 중...</>
              ) : saveStatus === 'success' ? (
                <><Check className="w-4 h-4" /> 저장 완료!</>
              ) : saveStatus === 'error' ? (
                <><AlertCircle className="w-4 h-4" /> 실패</>
              ) : (
                <><Save className="w-4 h-4" /> 저장</>
              )}
            </button>
          </div>
        </div>

        {/* 자동 수정 로그 */}
        {showFixLog && fixLog.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 py-2 bg-purple-50 border-t border-purple-200">
            <p className="text-sm font-medium text-purple-700 mb-1">🔧 자동 수정 결과 ({fixLog.length}건)</p>
            {fixLog.map((log, i) => (
              <p key={i} className="text-xs text-purple-600">• {log}</p>
            ))}
          </div>
        )}

        {/* 에러 메시지 */}
        {saveStatus === 'error' && errorMsg && (
          <div className="max-w-7xl mx-auto px-4 py-2 bg-red-50 border-t border-red-200">
            <p className="text-sm text-red-700">❌ {errorMsg}</p>
          </div>
        )}
      </div>

      {/* 에디터 / 미리보기 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {isPreview ? (
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg max-w-3xl mx-auto">
            <BlogPostContent content={content} />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-500">마크다운 편집기</span>
              <span className="text-xs text-gray-400">
                {content.length.toLocaleString()}자
              </span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-[calc(100vh-200px)] p-6 font-mono text-sm leading-relaxed resize-none focus:outline-none text-gray-800"
              placeholder="마크다운 내용을 입력하세요..."
              spellCheck={false}
            />
          </div>
        )}
      </div>
    </div>
  )
}
