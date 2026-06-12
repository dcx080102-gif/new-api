/*
React Bits 风格的渐进入场 — FadeContent
子元素依次淡入 + 上移，间隔可配置
*/
import { useEffect, useRef, useState, type ReactNode } from 'react'

interface FadeContentProps {
  children: ReactNode
  /** 元素之间的延迟（秒），默认 0.1 */
  stagger?: number
  /** 初始延迟（秒），默认 0 */
  initialDelay?: number
  /** 动画持续时间 */
  duration?: number
  className?: string
  /** 是否从视口出现时才开始动画 */
  viewportOnly?: boolean
}

export function FadeContent({
  children,
  stagger = 0.1,
  initialDelay = 0,
  duration = 0.5,
  className,
  viewportOnly = true,
}: FadeContentProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(!viewportOnly)

  useEffect(() => {
    if (!viewportOnly) return
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [viewportOnly])

  return (
    <div ref={ref} className={className}>
      {Array.isArray(children)
        ? (children as ReactNode[]).map((child, i) => (
            <div
              key={i}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(12px)',
                transition: `opacity ${duration}s ease-out ${initialDelay + i * stagger}s, transform ${duration}s ease-out ${initialDelay + i * stagger}s`,
              }}
            >
              {child}
            </div>
          ))
        : (
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(12px)',
              transition: `opacity ${duration}s ease-out ${initialDelay}s, transform ${duration}s ease-out ${initialDelay}s`,
            }}
          >
            {children}
          </div>
        )}
    </div>
  )
}
