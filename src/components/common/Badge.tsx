import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray'
  size?: 'sm' | 'md'
  className?: string
}

const colorStyles = {
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  purple: 'bg-purple-100 text-purple-700',
  orange: 'bg-orange-100 text-orange-700',
  red: 'bg-red-100 text-red-700',
  gray: 'bg-gray-100 text-gray-700',
}

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
}

export default function Badge({
  children,
  color = 'blue',
  size = 'md',
  className
}: BadgeProps) {
  return (
    <span className={cn(
      'inline-block font-medium rounded-full',
      colorStyles[color],
      sizeStyles[size],
      className
    )}>
      {children}
    </span>
  )
}
