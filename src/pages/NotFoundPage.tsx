import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">페이지를 찾을 수 없습니다</p>
      <Link
        to="/"
        className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
      >
        홈으로 돌아가기
      </Link>
    </div>
  )
}
