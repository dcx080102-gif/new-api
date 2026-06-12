/*
React Bits 风格的形状模糊组件 — ShapeBlur
在容器背景中渲染流动的模糊形状，营造动态氛围
*/
import { useMemo } from 'react'
import { cn } from '@/lib/utils'

interface ShapeConfig {
  color?: string
  size?: number
  x?: number
  y?: number
}

interface ShapeBlurProps {
  children?: React.ReactNode
  className?: string
  blur?: number
  shapes?: ShapeConfig[]
  borderRadius?: string
  /** 动画速度 (s)，默认 16 */
  speed?: number
}

const DEFAULT_SHAPES: ShapeConfig[] = [
  { color: 'rgba(120,80,255,0.25)', size: 100, x: 5, y: 15 },
  { color: 'rgba(60,180,255,0.20)', size: 80, x: 75, y: 55 },
  { color: 'rgba(140,100,255,0.20)', size: 90, x: 45, y: 70 },
]

export function ShapeBlur({
  children,
  className,
  blur = 35,
  shapes = DEFAULT_SHAPES,
  borderRadius = '40%',
  speed = 16,
}: ShapeBlurProps) {
  const shapeData = useMemo(
    () =>
      shapes.map((shape, i) => ({
        color: shape.color ?? 'rgba(120,80,255,0.25)',
        width: shape.size ?? 100,
        height: shape.size ?? 100,
        left: `${shape.x ?? 50}%`,
        top: `${shape.y ?? 50}%`,
        animationDelay: `${-i * (speed / shapes.length)}s`,
      })),
    [shapes, speed]
  )

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <div className='pointer-events-none absolute inset-0 -z-[1]' aria-hidden>
        {shapeData.map((s, i) => (
          <div
            key={i}
            className='absolute'
            style={{
              width: s.width,
              height: s.height,
              left: s.left,
              top: s.top,
              background: `radial-gradient(circle at center, ${s.color}, transparent 70%)`,
              borderRadius,
              filter: `blur(${blur}px)`,
              animation: `shape-float ${speed}s ease-in-out infinite`,
              animationDelay: s.animationDelay,
            }}
          />
        ))}
      </div>
      {children}
    </div>
  )
}
