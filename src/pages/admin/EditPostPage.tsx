import { useState, useEffect } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { usePosts } from '@/hooks/usePosts'
import { useAdmin } from '@/contexts/AdminContext'
import BlogPostContent from '@/components/blog/BlogPostContent'
import { Save, Eye, Edit3, ArrowLeft, Loader2, Check, AlertCircle } from 'lucide-react'

const GITHUB_REPO = 'kimeunhee0717/goldenwave'
const GITHUB_BRANCH = 'main'

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
  const [githubToken, setGithubToken] = useState('')
  const [showTokenInput, setShowTokenInput] = useState(false)

  useEffect(() => {
    if (post) {
      setContent(post.content)
      setTitle(post.title)
    }
    const saved = sessionStorage.getItem('github_token')
    if (saved) setGithubToken(saved)
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
    if (!githubToken) {
      setShowTokenInput(true)
      return
    }

    setSaving(true)
    setSaveStatus('idle')
    setErrorMsg('')

    try {
      // 1. 파일 경로 찾기 (카테고리 폴더 안의 slug.md)
      const filePath = `src/data/posts/${post.category.id}/${slug}.md`

      // 2. 기존 파일의 SHA 가져오기
      const getRes = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}?ref=${GITHUB_BRANCH}`,
        { headers: { Authorization: `Bearer ${githubToken}` } }
      )

      if (!getRes.ok) {
        throw new Error(`파일을 찾을 수 없습니다: ${filePath}`)
      }

      const fileData = await getRes.json()
      const sha = fileData.sha

      // 3. 파일 업데이트
      const putRes = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${githubToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `edit: ${post.title} 수정`,
            content: btoa(unescape(encodeURIComponent(content))),
            sha,
            branch: GITHUB_BRANCH,
          }),
        }
      )

      if (!putRes.ok) {
        const err = await putRes.json()
        throw new Error(err.message || '저장 실패')
      }

      setSaveStatus('success')
      sessionStorage.setItem('github_token', githubToken)

      // 3초 후 상태 리셋
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (err: any) {
      setSaveStatus('error')
      setErrorMsg(err.message || '알 수 없는 오류')
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

        {/* GitHub 토큰 입력 */}
        {showTokenInput && !githubToken && (
          <div className="max-w-7xl mx-auto px-4 py-3 bg-amber-50 border-t border-amber-200">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-amber-800 whitespace-nowrap">
                GitHub Token:
              </label>
              <input
                type="password"
                placeholder="ghp_xxxxxxxxxxxx"
                className="flex-1 px-3 py-2 border border-amber-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
                onChange={(e) => {
                  setGithubToken(e.target.value)
                  if (e.target.value) sessionStorage.setItem('github_token', e.target.value)
                }}
              />
              <button
                onClick={() => setShowTokenInput(false)}
                className="px-3 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600"
              >
                확인
              </button>
            </div>
            <p className="text-xs text-amber-600 mt-1">
              GitHub Personal Access Token이 필요합니다. repo 권한이 있어야 합니다.
            </p>
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
