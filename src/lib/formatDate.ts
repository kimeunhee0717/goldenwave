import { format, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'

export function formatDate(dateString: string): string {
  const date = parseISO(dateString)
  return format(date, 'yyyy년 M월 d일', { locale: ko })
}

export function formatDateShort(dateString: string): string {
  const date = parseISO(dateString)
  return format(date, 'M월 d일', { locale: ko })
}
