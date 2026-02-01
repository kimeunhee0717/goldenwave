import { useScrollProgress } from '@/hooks/useScrollProgress'

export default function ReadingProgressBar() {
  const progress = useScrollProgress()

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-[60]">
      <div
        className="h-full bg-gradient-to-r from-primary-500 to-indigo-500 transition-all duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
