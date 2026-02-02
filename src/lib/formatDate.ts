import { format, parseISO } from 'date-fns'

export function formatDate(dateString: string): string {
  const date = parseISO(dateString)
  return format(date, 'yyyy.MM.dd')
}

export function formatDateShort(dateString: string): string {
  const date = parseISO(dateString)
  return format(date, 'MM.dd')
}

export function formatDateKorean(dateString: string): string {
  const date = parseISO(dateString)
  return format(date, 'yyyy년 M월 d일')
}
