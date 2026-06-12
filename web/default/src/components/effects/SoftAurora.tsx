/*
React Bits 风格的动态背景 — SoftAurora
柔和流动的渐变光晕，模拟极光效果
使用 CSS @keyframes 实现动画
*/
import { cn } from '@/lib/utils'
import { useMemo } from 'react'

interface SoftAuroraProps {
  className?: string
  /** 流动速度（秒），默认 20 */
  speed?: number
}

export function SoftAurora({ className, speed = 20 }: SoftAuroraProps) {
  const style1 = useMemo(
    () => ({ animationDuration: `${speed}s` } as React.CSSProperties),
    [speed]
  )
  const style2 = useMemo(
    () => ({ animationDuration: `${speed * 1.1}s` } as React.CSSProperties),
    [speed]
  )
  const style3 = useMemo(
    () => ({ animationDuration: `${speed * 0.9}s` } as React.CSSProperties),
    [speed]
  )

  return (
    <div className={cn('pointer-events-none fixed inset-0 -z-10 overflow-hidden', className)}>
      {/* 顶部光晕 */}
      <div
        className="[animation:aurora-1_20s_ease-in-out_infinite] absolute -top-1/2 left-1/4 h-[120%] w-[120%] rounded-full opacity-40 blur-[100px]"
        style={{
          ...style1,
          background:
            'radial-gradient(circle, rgba(120,80,255,0.3) 0%, rgba(60,180,255,0.2) 40%, transparent 70%)',
        }}
      />
      {/* 底部光晕 */}
      <div
        className="[animation:aurora-2_20s_ease-in-out_infinite] absolute -bottom-1/2 right-1/4 h-[120%] w-[120%] rounded-full opacity-40 blur-[100px]"
        style={{
          ...style2,
          background:
            'radial-gradient(circle, rgba(80,60,220,0.25) 0%, rgba(100,200,200,0.2) 40%, transparent 70%)',
        }}
      />
      {/* 中间漂浮光晕 */}
      <div
        className="[animation:aurora-3_20s_ease-in-out_infinite] absolute left-1/3 top-1/4 h-[80%] w-[80%] rounded-full opacity-30 blur-[80px]"
        style={{
          ...style3,
          background:
            'radial-gradient(circle, rgba(140,100,255,0.2) 0%, rgba(200,150,255,0.15) 50%, transparent 80%)',
        }}
      />
    </div>
  )
}
