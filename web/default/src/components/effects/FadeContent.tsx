/*
React Bits 风格的渐进入场 — FadeContent
子元素依次淡入 + 上移，间隔可配置
*/
import { useEffect, useRef, useState, type ReactNode } from 'react'

interface FadeContentProps {
  children: ReactNode
  stagger?: number
  initialDelay?: number
  duration?: number
  className?: string
}

export function FadeContent({
  children,
  stagger = 0.1,
  initialDelay = 0,
  duration = 0.5,
  className,
}: FadeContentProps) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 先尝试 IntersectionObserver，失败则直接显示
    const node = ref.current
    if (!node) {
      setVisible(true)
      return
    }

    try {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
          }
        },
        { threshold: 0.05 }
      )
      observer.observe(node)
      // 兜底：2 秒后如果还没触发，直接显示
      const fallback = setTimeout(() => {
        setVisible(true)
        observer.disconnect()
      }, 2000)
      return () => {
        observer.disconnect()
        clearTimeout(fallback)
      }
    } catch {
      setVisible(true)
    }
  }, [])

  return (
    <div ref={ref} className={className}>
      {Array.isArray(children)
        ? (children as ReactNode[]).map((child, i) => (
            <div
              key={i}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible
                  ? 'translateY(0)'
                  : 'translateY(16px)',
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
              transform: visible ? 'translateY(0)' : 'translateY(16px)',
              transition: `opacity ${duration}s ease-out ${initialDelay}s, transform ${duration}s ease-out ${initialDelay}s`,
            }}
          >
            {children}
          </div>
        )}
    </div>
  )
}
