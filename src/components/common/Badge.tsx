import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'teal' | 'gray'
  size?: 'sm' | 'md'
  className?: string
}

const colorStyles = {
  blue: 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200',
  green: 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200',
  purple: 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border border-purple-200',
  orange: 'bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border border-orange-200',
  red: 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200',
  teal: 'bg-gradient-to-r from-teal-50 to-teal-100 text-teal-700 border border-teal-200',
  gray: 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200',
}

const sizeStyles = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-3.5 py-1.5 text-sm',
}

export default function Badge({
  children,
  color = 'blue',
  size = 'md',
  className
}: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center font-semibold rounded-full transition-all duration-200',
      colorStyles[color],
      sizeStyles[size],
      className
    )}>
      {children}
    </span>
  )
}
