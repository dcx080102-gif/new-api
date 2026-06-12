/*
React Bits 风格的动态背景 — SoftAurora
柔和流动的渐变光晕，模拟极光效果
*/
import { cn } from '@/lib/utils'
import { useMemo } from 'react'

interface SoftAuroraProps {
  className?: string
  speed?: number
}

export function SoftAurora({ className, speed = 20 }: SoftAuroraProps) {
  const styles = useMemo(
    () => ({
      shape1: {
        animation: `aurora-1 ${speed}s ease-in-out infinite`,
        background:
          'radial-gradient(circle, rgba(120,80,255,0.3) 0%, rgba(60,180,255,0.2) 40%, transparent 70%)',
      } as React.CSSProperties,
      shape2: {
        animation: `aurora-2 ${speed * 1.1}s ease-in-out infinite`,
        background:
          'radial-gradient(circle, rgba(80,60,220,0.25) 0%, rgba(100,200,200,0.2) 40%, transparent 70%)',
      } as React.CSSProperties,
      shape3: {
        animation: `aurora-3 ${speed * 0.9}s ease-in-out infinite`,
        background:
          'radial-gradient(circle, rgba(140,100,255,0.2) 0%, rgba(200,150,255,0.15) 50%, transparent 80%)',
      } as React.CSSProperties,
    }),
    [speed]
  )

  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-0 -z-10 overflow-hidden',
        className
      )}
    >
      <div
        className='absolute -top-1/2 left-1/4 h-[120%] w-[120%] rounded-full opacity-40 blur-[100px]'
        style={styles.shape1}
      />
      <div
        className='absolute -bottom-1/2 right-1/4 h-[120%] w-[120%] rounded-full opacity-40 blur-[100px]'
        style={styles.shape2}
      />
      <div
        className='absolute left-1/3 top-1/4 h-[80%] w-[80%] rounded-full opacity-30 blur-[80px]'
        style={styles.shape3}
      />
    </div>
  )
}
