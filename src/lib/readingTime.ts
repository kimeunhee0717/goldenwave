export function calculateReadingTime(content: string): number {
  // 한국어 기준 분당 약 500자
  const wordsPerMinute = 500
  const textLength = content.replace(/\s+/g, '').length
  const minutes = Math.ceil(textLength / wordsPerMinute)
  return Math.max(1, minutes)
}
