/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

/**
 * Animated logo: "otter Link" → "Otterl"
 *
 * Sequence:
 *  1. Initial: "otter Link" displayed
 *  2. "k" shrinks → disappears
 *  3. "in" fades out
 *  4. "L" slides left to after "r"
 *  5. "L" shrinks to lowercase
 *  6. First "o" → "O" (capital)
 */

type Phase = 'initial' | 'shrinkK' | 'fadeIn' | 'slideL' | 'lowerL' | 'capO' | 'done'

export function AnimatedLogo() {
  const [phase, setPhase] = useState<Phase>('initial')

  useEffect(() => {
    const timeline: [Phase, number][] = [
      ['initial', 1200],
      ['shrinkK', 300],
      ['fadeIn', 250],
      ['slideL', 500],
      ['lowerL', 300],
      ['capO', 200],
      ['done', 0],
    ]

    let timeout: ReturnType<typeof setTimeout>
    let i = 1
    const next = () => {
      if (i < timeline.length) {
        setPhase(timeline[i][0])
        timeout = setTimeout(next, timeline[i][1])
        i++
      }
    }
    timeout = setTimeout(next, timeline[0][1])
    return () => clearTimeout(timeout)
  }, [])

  return (
    <div className='flex items-center justify-center'>
      <h1
        className='text-[clamp(2.5rem,7vw,4.5rem)] font-extrabold tracking-tight select-none'
        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        {/* "otter" */}
        <Letter char='o' phase={phase} index={0} finalChar='O' delayPhase='capO' />
        <Letter char='t' phase={phase} index={1} />
        <Letter char='t' phase={phase} index={2} />
        <Letter char='e' phase={phase} index={3} />
        <Letter char='r' phase={phase} index={4} />

        {/* space */}
        <span
          className={cn(
            'inline-block transition-all duration-500',
            phase === 'slideL' || phase === 'lowerL' || phase === 'capO' || phase === 'done'
              ? 'w-0 opacity-0'
              : 'w-[0.3em]'
          )}
        />

        {/* "L" — slides left to become the 'l' in Otterl */}
        <span
          className={cn(
            'inline-block transition-all duration-500 ease-out',
            phase === 'initial' || phase === 'shrinkK'
              ? 'translate-x-0'
              : '-translate-x-[calc(100%+0.3em)]'
          )}
        >
          <span
            className={cn(
              'inline-block transition-all duration-300',
              phase === 'lowerL' || phase === 'capO' || phase === 'done'
                ? 'text-[0.7em]'
                : ''
            )}
          >
            L
          </span>
        </span>

        {/* "in" — fades out */}
        <span
          className={cn(
            'inline-block transition-all duration-300',
            phase === 'fadeIn' || phase === 'slideL' || phase === 'lowerL' || phase === 'capO' || phase === 'done'
              ? 'opacity-0 w-0 overflow-hidden'
              : ''
          )}
        >
          in
        </span>

        {/* "k" — shrinks */}
        <span
          className={cn(
            'inline-block origin-left transition-all duration-300',
            phase === 'shrinkK' || phase === 'fadeIn' || phase === 'slideL' || phase === 'lowerL' || phase === 'capO' || phase === 'done'
              ? 'scale-x-0 opacity-0 w-0'
              : ''
          )}
        >
          k
        </span>
      </h1>
    </div>
  )
}

function Letter(props: {
  char: string
  phase: Phase
  index: number
  finalChar?: string
  delayPhase?: Phase
}) {
  const isCapitalO = props.finalChar && (props.phase === props.delayPhase || props.phase === 'done')
  const displayChar = isCapitalO ? props.finalChar! : props.char

  return (
    <span
      className={cn(
        'inline-block transition-all duration-200',
        isCapitalO && 'text-[1.15em]'
      )}
    >
      {displayChar}
    </span>
  )
}
