import { useScrollProgress } from '@/hooks/useScrollProgress'

export default function ReadingProgressBar() {
  const progress = useScrollProgress()

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-oatmeal-200 z-[60]">
      <div
        className="h-full bg-gradient-to-r from-cocoa-500 via-sand-400 to-golden-400 transition-all duration-150 shadow-sm"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
