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
import { ExternalLink, MessageCircle } from 'lucide-react'

// ============================================================================
// Notice Card — micuapi-style layout for otter Link
// ============================================================================

function Badge({ children, color = 'default' }: { children: React.ReactNode; color?: 'default' | 'blue' | 'red' | 'green' | 'orange' }) {
  const colors: Record<string, string> = {
    default: 'bg-foreground/10 text-foreground/60',
    blue: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    red: 'bg-red-500/15 text-red-600 dark:text-red-400',
    green: 'bg-green-500/15 text-green-600 dark:text-green-400',
    orange: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
  }
  return (
    <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold ${colors[color] || colors.default}`}>
      {children}
    </span>
  )
}

function Card({ children, border = 'default', className = '' }: { children: React.ReactNode; border?: 'default' | 'blue' | 'red' | 'orange'; className?: string }) {
  const borders: Record<string, string> = {
    default: 'border-border',
    blue: 'border-blue-500/30 bg-blue-500/5',
    red: 'border-red-500/30 bg-red-500/5',
    orange: 'border-orange-500/30 bg-orange-500/5',
  }
  return (
    <div className={`rounded-lg border p-3.5 mb-3 ${borders[border] || borders.default} ${className}`}>
      {children}
    </div>
  )
}

export function NoticeCard() {
  return (
    <div className='px-1 py-0.5 text-sm leading-relaxed'>
      {/* ── Header ── */}
      <div className='flex items-center justify-between pb-3 mb-3 border-b'>
        <div className='flex items-center gap-2.5'>
          <span className='text-[9px] font-bold tracking-[3px] text-background bg-foreground px-2.5 py-1 rounded-full'>
            otter
          </span>
          <span className='text-base font-extrabold tracking-tight'>
            服务公告
          </span>
        </div>
        <span className='bg-muted text-muted-foreground text-[10px] px-2 py-1 rounded-full font-medium'>
          2026.7.3
        </span>
      </div>

      {/* ── Action Buttons ── */}
      <div className='flex gap-2 flex-wrap mb-3.5'>
        <a
          href='https://qm.qq.com/q/1044628414'
          target='_blank'
          rel='noopener noreferrer'
          className='flex-1 min-w-[100px] flex items-center justify-center gap-1.5 bg-[#1296db] text-white rounded-md py-2.5 px-3.5 text-xs font-semibold no-underline hover:opacity-90 transition-opacity'
        >
          <MessageCircle className='size-3.5' />
          加入QQ群
        </a>
        <a
          href='/'
          className='flex-1 min-w-[100px] flex items-center justify-center gap-1.5 bg-background border rounded-md py-2.5 px-3.5 text-xs font-semibold no-underline hover:bg-muted/50 transition-colors'
        >
          <ExternalLink className='size-3.5' />
          官网
        </a>
      </div>

      {/* ── API 接入地址 ── */}
      <Card border='blue'>
        <div className='flex items-center gap-1.5 mb-2'>
          <span className='inline-block size-1.5 rounded-full bg-blue-500 shrink-0' />
          <span className='text-[11px] font-bold text-blue-600 dark:text-blue-400 tracking-wide'>
            API 接入地址
          </span>
        </div>
        <div className='flex flex-col gap-2 mb-2.5'>
          <div className='flex items-center gap-2'>
            <Badge color='blue'>主站</Badge>
            <span className='text-xs font-semibold break-all'>https://otterl.com</span>
          </div>
        </div>
        <div className='bg-background rounded-md p-2.5 border border-blue-500/20 text-xs leading-relaxed text-muted-foreground'>
          OpenAI SDK 兼容，Base URL 末尾加 <code className='bg-blue-500/10 px-1 py-0.5 rounded text-[11px] font-mono'>/v1</code>
          <br />改一行 <code className='bg-blue-500/10 px-1 py-0.5 rounded text-[11px] font-mono'>base_url</code> 即可接入
        </div>
      </Card>

      {/* ── 令牌创建提醒 ── */}
      <Card border='red'>
        <div className='flex items-start gap-3'>
          <span className='inline-flex items-center justify-center size-8 rounded-md bg-red-500/15 text-red-500 shrink-0 font-extrabold text-[15px] leading-none'>
            !
          </span>
          <div>
            <div className='text-sm font-semibold text-red-600 dark:text-red-400'>
              创建令牌 · 务必选择对应分组
            </div>
            <div className='text-xs text-red-500/80 mt-1 leading-relaxed'>
              禁止使用默认分组，请按需选择对应分组，否则可能导致计费异常或调用失败。
            </div>
          </div>
        </div>
      </Card>

      {/* ── 售后服务 ── */}
      <Card border='default'>
        <div className='text-sm font-semibold mb-2'>🛟 售后服务</div>
        <div className='flex flex-col gap-2.5'>
          <div className='flex items-start gap-2.5'>
            <span className='inline-flex items-center justify-center size-5 rounded bg-foreground/10 text-xs font-bold shrink-0 mt-0.5'>1</span>
            <div className='text-xs leading-relaxed'>
              <div className='font-semibold'>QQ群答疑</div>
              <div className='text-muted-foreground'>群号：1044628414，解答 API 配置及使用问题</div>
            </div>
          </div>
          <div className='flex items-start gap-2.5'>
            <span className='inline-flex items-center justify-center size-5 rounded bg-foreground/10 text-xs font-bold shrink-0 mt-0.5'>2</span>
            <div className='text-xs leading-relaxed'>
              <div className='font-semibold'>远程协助</div>
              <div className='text-muted-foreground'>仅限 Claude Code / Codex 无法连接本站 API 的配置问题</div>
            </div>
          </div>
          <div className='flex items-start gap-2.5'>
            <span className='inline-flex items-center justify-center size-5 rounded bg-foreground/10 text-xs font-bold shrink-0 mt-0.5'>3</span>
            <div className='text-xs leading-relaxed'>
              <div className='font-semibold'>服务时间</div>
              <div className='text-muted-foreground'>工作日 09:00 – 18:00，其他时间根据客服情况处理</div>
            </div>
          </div>
        </div>
      </Card>

      {/* ── 日志与说明 ── */}
      <Card border='default'>
        <div className='text-sm font-semibold mb-2'>📋 调用日志与内容说明</div>
        <div className='flex flex-col gap-2 text-xs mb-3'>
          <div className='flex items-start gap-2'>
            <Badge color='green'>有记录</Badge>
            <span className='text-muted-foreground'>每条 API 调用均有日志，包含时间、Token 消耗等调用信息</span>
          </div>
          <div className='flex items-start gap-2'>
            <Badge color='red'>不保留</Badge>
            <span className='text-muted-foreground'>对话内容不作保存，密钥泄露问题平台无法核查，不承担责任与赔偿</span>
          </div>
        </div>
        <div className='rounded-md border border-red-500/20 bg-red-500/5 p-2.5'>
          <div className='flex items-start gap-2 mb-2'>
            <span className='text-red-500 text-xs font-bold shrink-0'>✗</span>
            <span className='text-xs font-semibold text-red-600 dark:text-red-400'>以下扣费问题不受理</span>
          </div>
          <div className='flex flex-wrap gap-1.5'>
            <Badge color='red'>余额消耗过快</Badge>
            <Badge color='red'>钱去哪里了</Badge>
            <Badge color='red'>我没用这么多</Badge>
            <Badge color='red'>为什么扣这么多</Badge>
          </div>
          <div className='text-[11px] text-muted-foreground mt-2'>
            如遇真实异常扣费，请携带详细的调用日志截图联系客服，方可受理。
          </div>
        </div>
      </Card>

      {/* ── 服务与政策 ── */}
      <Card border='default'>
        <div className='text-sm font-semibold mb-3'>📜 服务与政策</div>
        <div className='grid grid-cols-2 gap-2 text-xs'>
          <div className='rounded-md border p-2.5'>
            <div className='font-semibold mb-1'>按量充值</div>
            <div className='text-muted-foreground leading-relaxed'>先充值后使用，余额永久有效</div>
          </div>
          <div className='rounded-md border p-2.5'>
            <div className='font-semibold mb-1'>AFF 邀请</div>
            <div className='text-muted-foreground leading-relaxed'>邀请好友充值，双方得奖励</div>
          </div>
          <div className='rounded-md border p-2.5'>
            <div className='font-semibold mb-1'>透明定价</div>
            <div className='text-muted-foreground leading-relaxed'>每款模型价格实时公开可查</div>
          </div>
          <div className='rounded-md border p-2.5'>
            <div className='font-semibold mb-1'>合作联系</div>
            <div className='text-muted-foreground leading-relaxed'>量大从优，欢迎QQ群洽谈</div>
          </div>
        </div>
      </Card>

      {/* ── Footer ── */}
      <div className='text-center text-[10px] text-muted-foreground pt-2 pb-1'>
        otter Link Team
      </div>
    </div>
  )
}
