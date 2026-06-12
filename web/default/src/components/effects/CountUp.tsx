/*
React Bits 风格的数字滚动动画 — CountUp
数字从 0 滚动到目标值，支持后缀格式（如 128K+）
*/
import { useEffect, useRef, useState } from 'react'

interface CountUpProps {
  /** 目标值（数字） */
  to: number
  /** 前缀，如 '128K+' 中的数字部分通过 to 传入 */
  prefix?: string
  /** 后缀，如 '+', 'K+', 'M+' */
  suffix?: string
  /** 动画持续时间（秒），默认 2 */
  duration?: number
  /** 延迟开始（秒），默认 0 */
  delay?: number
  className?: string
}

export function CountUp({
  to,
  prefix = '',
  suffix = '',
  duration = 2,
  delay = 0,
  className,
}: CountUpProps) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const timeout = setTimeout(() => setStarted(true), delay * 1000)
    return () => clearTimeout(timeout)
  }, [delay])

  useEffect(() => {
    if (!started || to === 0) return

    const startTime = performance.now()
    let raf: number
    function tick(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / (duration * 1000), 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * to))

      if (progress < 1) {
        raf = requestAnimationFrame(tick)
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [started, to, duration])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}
