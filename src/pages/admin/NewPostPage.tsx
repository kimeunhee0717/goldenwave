import { useState } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { useAdmin } from '@/contexts/AdminContext'
import { usePosts } from '@/hooks/usePosts'
import BlogPostContent from '@/components/blog/BlogPostContent'
import {
  ArrowLeft, Save, Eye, Edit3, Loader2, Check, AlertCircle,
  Image, Tag, X, Plus, Rocket, Upload
} from 'lucide-react'

const LOCAL_API = 'http://localhost:18790'

// 슬러그 자동 생성 (한글 → 영문 변환은 안 됨, 영문만 허용)
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50)
}

export default function NewPostPage() {
  const navigate = useNavigate()
  const { isAdmin } = useAdmin()
  const { categories } = usePosts()

  // 폼 상태
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [categoryId, setCategoryId] = useState('digital-skill')
  const [excerpt, setExcerpt] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [content, setContent] = useState('')
  const [featured, setFeatured] = useState(false)

  // UI 상태
  const [isPreview, setIsPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [building, setBuilding] = useState(false)
  const [deploying, setDeploying] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [buildStatus, setBuildStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [deployStatus, setDeployStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  if (!isAdmin) {
    return <Navigate to="/admin" replace />
  }

  // 제목 변경 시 슬러그 자동 생성
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(newTitle))
    }
  }

  // 태그 추가
  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
      setTagInput('')
    }
  }

  // 태그 삭제
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove))
  }

  // 태그 입력 키 핸들러
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  // 저장하기 (로컬에만 저장)
  const handleSave = async () => {
    // 유효성 검사
    if (!title.trim()) {
      setErrorMsg('제목을 입력해주세요')
      setSaveStatus('error')
      return
    }
    if (!slug.trim()) {
      setErrorMsg('슬러그를 입력해주세요')
      setSaveStatus('error')
      return
    }
    if (!content.trim()) {
      setErrorMsg('본문을 입력해주세요')
      setSaveStatus('error')
      return
    }

    setSaving(true)
    setSaveStatus('idle')
    setErrorMsg('')

    try {
      const res = await fetch(`${LOCAL_API}/api/post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: slug.trim(),
          title: title.trim(),
          excerpt: excerpt.trim() || title.trim(),
          categoryId,
          tags,
          coverImage: coverImage.trim() || undefined,
          content: content.trim(),
          featured,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '저장 실패')
      }

      setSaveStatus('success')

    } catch (err: any) {
      setSaveStatus('error')
      setErrorMsg(
        err.message === 'Failed to fetch'
          ? '로컬 API 서버가 꺼져 있습니다. node local-api.cjs를 실행해주세요.'
          : err.message || '알 수 없는 오류'
      )
    } finally {
      setSaving(false)
    }
  }

  // 발행하기 (빌드만 - dist 폴더에 index.html 생성)
  const handleBuild = async () => {
    setBuilding(true)
    setBuildStatus('idle')
    setErrorMsg('')

    try {
      const res = await fetch(`${LOCAL_API}/api/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '발행 실패')
      }

      setBuildStatus('success')

    } catch (err: any) {
      setBuildStatus('error')
      setErrorMsg(err.message || '발행 중 오류 발생')
    } finally {
      setBuilding(false)
    }
  }

  // 배포하기 (git commit + push)
  const handleDeploy = async () => {
    setDeploying(true)
    setDeployStatus('idle')
    setErrorMsg('')

    try {
      const res = await fetch(`${LOCAL_API}/api/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Add blog post: ${title.trim() || 'new post'}`
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '배포 실패')
      }

      setDeployStatus('success')

    } catch (err: any) {
      setDeployStatus('error')
      setErrorMsg(err.message || '배포 중 오류 발생')
    } finally {
      setDeploying(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 바 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/admin/posts"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              포스트 목록
            </Link>
            <div className="h-6 w-px bg-gray-300" />
            <h1 className="text-lg font-semibold text-gray-900">
              새 포스트 작성
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* 미리보기 토글 */}
            <button
              onClick={() => setIsPreview(!isPreview)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                isPreview
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isPreview ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {isPreview ? '편집' : '미리보기'}
            </button>

            <div className="h-6 w-px bg-gray-300" />

            {/* 1. 저장 버튼 */}
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                saveStatus === 'success'
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : saveStatus === 'error'
                  ? 'bg-red-100 text-red-700 border border-red-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
              } disabled:opacity-50`}
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> 저장중</>
              ) : saveStatus === 'success' ? (
                <><Check className="w-4 h-4" /> 저장됨</>
              ) : (
                <><Save className="w-4 h-4" /> 저장</>
              )}
            </button>

            {/* 2. 발행 버튼 (빌드) */}
            <button
              onClick={handleBuild}
              disabled={building || saveStatus !== 'success'}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                buildStatus === 'success'
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : buildStatus === 'error'
                  ? 'bg-red-100 text-red-700 border border-red-300'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={saveStatus !== 'success' ? '먼저 저장해주세요' : ''}
            >
              {building ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> 발행중</>
              ) : buildStatus === 'success' ? (
                <><Check className="w-4 h-4" /> 발행됨</>
              ) : (
                <><Upload className="w-4 h-4" /> 발행</>
              )}
            </button>

            {/* 3. 배포 버튼 (git push) */}
            <button
              onClick={handleDeploy}
              disabled={deploying || buildStatus !== 'success'}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                deployStatus === 'success'
                  ? 'bg-green-500 text-white'
                  : deployStatus === 'error'
                  ? 'bg-red-500 text-white'
                  : 'bg-amber-500 text-white hover:bg-amber-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={buildStatus !== 'success' ? '먼저 발행해주세요' : ''}
            >
              {deploying ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> 배포중</>
              ) : deployStatus === 'success' ? (
                <><Check className="w-4 h-4" /> 배포완료</>
              ) : (
                <><Rocket className="w-4 h-4" /> 배포</>
              )}
            </button>
          </div>
        </div>

        {/* 에러 메시지 */}
        {saveStatus === 'error' && errorMsg && (
          <div className="max-w-7xl mx-auto px-4 py-2 bg-red-50 border-t border-red-200">
            <p className="text-sm text-red-700">{errorMsg}</p>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {isPreview ? (
          /* 미리보기 */
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg max-w-3xl mx-auto">
            <div className="mb-6">
              <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">
                {categories.find(c => c.id === categoryId)?.title || categoryId}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{title || '제목 없음'}</h1>
            <p className="text-gray-500 mb-8">{excerpt || '요약 없음'}</p>
            {coverImage && (
              <img src={coverImage} alt={title} className="w-full rounded-xl mb-8" />
            )}
            <BlogPostContent content={content || '*본문을 입력해주세요*'} />
          </div>
        ) : (
          /* 편집 폼 */
          <div className="grid lg:grid-cols-3 gap-6">
            {/* 왼쪽: 메타데이터 */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                <h2 className="font-semibold text-gray-900">포스트 정보</h2>

                {/* 제목 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    제목 *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => handleTitleChange(e.target.value)}
                    placeholder="포스트 제목을 입력하세요"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                {/* 슬러그 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    슬러그 (URL) *
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">/blog/</span>
                    <input
                      type="text"
                      value={slug}
                      onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      placeholder="my-post-slug"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono text-sm"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">영문 소문자, 숫자, 하이픈만 사용</p>
                </div>

                {/* 카테고리 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    카테고리 *
                  </label>
                  <select
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 요약 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    요약
                  </label>
                  <textarea
                    value={excerpt}
                    onChange={e => setExcerpt(e.target.value)}
                    placeholder="검색 결과에 표시될 요약 (선택)"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
                  />
                </div>

                {/* 커버 이미지 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Image className="w-4 h-4 inline mr-1" />
                    커버 이미지 URL
                  </label>
                  <input
                    type="url"
                    value={coverImage}
                    onChange={e => setCoverImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                  />
                </div>

                {/* 태그 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Tag className="w-4 h-4 inline mr-1" />
                    태그
                  </label>
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-sm rounded-full"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="hover:text-amber-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      placeholder="태그 입력 후 Enter"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                    />
                    <button
                      onClick={addTag}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 추천 글 */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={featured}
                    onChange={e => setFeatured(e.target.checked)}
                    className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
                  />
                  <label htmlFor="featured" className="text-sm text-gray-700">
                    추천 글로 설정
                  </label>
                </div>
              </div>
            </div>

            {/* 오른쪽: 본문 편집기 */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden h-full flex flex-col">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                  <span className="text-sm text-gray-500">마크다운 편집기</span>
                  <span className="text-xs text-gray-400">
                    {content.length.toLocaleString()}자
                  </span>
                </div>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="flex-1 w-full p-6 font-mono text-sm leading-relaxed resize-none focus:outline-none text-gray-800 min-h-[calc(100vh-300px)]"
                  placeholder={`안녕하세요, 부자타임입니다.

오늘은 ~~~에 대해 알아보겠습니다.

## 첫 번째 주제

내용을 작성해주세요...

## 두 번째 주제

내용을 작성해주세요...

---

지금까지 ~~~에 대해 알아보았습니다.
부자타임에서 여러분의 성공을 응원합니다!`}
                  spellCheck={false}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
