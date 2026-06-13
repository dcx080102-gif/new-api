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
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import {
  Shield,
  FileText,
  Key,
  AlertTriangle,
  CreditCard,
  Copyright,
  ScrollText,
  Eye,
  RefreshCw,
  Power,
  Gavel,
  Mail,
  ChevronRight,
  ArrowUp,
} from 'lucide-react'
import { PublicLayout } from '@/components/layout'
import { cn } from '@/lib/utils'

/* ── 各节内容 + 图标 ── */
const sections = [
  {
    id: 'section-1',
    num: '一',
    title: '服务说明',
    icon: FileText,
    content: (
      <>
        <p><strong>1.1</strong> 本平台是一个 <strong>AI API 聚合网关服务</strong>，通过统一接口为用户提供对接多个 AI 服务提供商（如 OpenAI、Claude、Google Gemini 等）的能力。用户通过本平台可一站式管理和调用多种 AI 模型，无需分别对接各个厂商。</p>
        <p><strong>1.2</strong> 本平台本身 <strong>不生产或训练 AI 模型</strong>，所有 AI 能力均来自上游第三方服务商。各模型的响应质量、可用性、内容安全由对应的上游服务商负责。</p>
        <p><strong>1.3</strong> 本平台保留根据业务需要 <strong>随时调整、升级、暂停或终止部分或全部服务的权利</strong>，无需事先通知用户，但将尽可能提前公告。</p>
      </>
    ),
  },
  {
    id: 'section-2',
    num: '二',
    title: '账户注册与安全',
    icon: Shield,
    content: (
      <>
        <p><strong>2.1</strong> 用户注册时须提供 <strong>真实、准确、完整</strong> 的个人信息，并在信息变更时及时更新。因信息不实导致的任何后果由用户自行承担。</p>
        <p><strong>2.2</strong> 用户应妥善保管账户和密码，<strong>对通过其账户进行的所有活动和事件承担全部责任</strong>。如发现账户被盗用或存在安全漏洞，应立即通知本平台。</p>
        <p><strong>2.3</strong> 用户不得将账户 <strong>出借、出租、转让或与他人共享使用</strong>。同一账户在多设备、多 IP 异常使用时，本平台有权暂停或终止该账户。</p>
        <p><strong>2.4</strong> 每个用户仅允许注册 <strong>一个账户</strong>。禁止通过批量注册、虚假信息等方式获取多账户。违反者本平台有权注销相关账户。</p>
      </>
    ),
  },
  {
    id: 'section-3',
    num: '三',
    title: 'API 密钥（Key）管理',
    icon: Key,
    content: (
      <>
        <p><strong>3.1</strong> 本平台通过 <strong>API Key</strong> 进行接口鉴权。用户创建 Key 后应妥善保管，<strong>Key 一经创建，部分系统仅显示一次完整密钥</strong>，丢失后需重新创建。</p>
        <p><strong>3.2</strong> API Key 是用户调用本平台服务的唯一凭证，<strong>任何持有该 Key 的人均可代表用户进行操作</strong>。因 Key 泄露导致的一切损失（包括但不限于额度被盗用、数据泄露等）由用户自行承担。</p>
        <p><strong>3.3</strong> 用户可为 API Key 设置 <strong>额度限制、有效期、IP 白名单</strong> 等安全策略。建议用户合理配置以降低风险。</p>
        <p><strong>3.4</strong> 用户不得将 API Key 用于 <strong>违法、违规或侵犯他人合法权益</strong> 的用途，包括但不限于生成违法内容、侵犯知识产权、网络攻击、垃圾信息传播等。</p>
      </>
    ),
  },
  {
    id: 'section-4',
    num: '四',
    title: '使用规范',
    icon: AlertTriangle,
    content: (
      <>
        <p><strong>4.1</strong> 用户在使用本平台服务时，须遵守 <strong>中华人民共和国法律法规</strong> 以及国际相关法律法规。</p>
        <p><strong>4.2</strong> 用户 <strong>不得</strong> 利用本平台从事以下活动：</p>
        <ul>
          <li>生成、传播违法信息（包括但不限于色情、暴力、恐怖主义、赌博、诈骗等内容）；</li>
          <li>侵犯他人知识产权、商业秘密、隐私权、名誉权等合法权益；</li>
          <li>干扰、破坏本平台或上游服务商的正常运行（包括但不限于 DDoS 攻击、恶意爬虫、接口爆破等）；</li>
          <li>通过逆向工程、反编译等手段试图获取本平台的源代码或算法；</li>
          <li>以任何方式绕过本平台的计费系统或安全机制；</li>
          <li>将本平台用于生成虚假信息、深度伪造（Deepfake）、社会工程攻击等恶意用途。</li>
        </ul>
        <p><strong>4.3</strong> 如用户违反上述规定，本平台有权视情节严重程度采取以下措施：</p>
        <ul>
          <li>警告并要求限期整改；</li>
          <li>暂停或永久封禁账户；</li>
          <li>扣除或清零账户余额（不予退还）；</li>
          <li>保留追究法律责任的权利；</li>
          <li>向相关监管部门举报。</li>
        </ul>
      </>
    ),
  },
  {
    id: 'section-5',
    num: '五',
    title: '费用与支付',
    icon: CreditCard,
    content: (
      <>
        <p><strong>5.1</strong> 本平台采用 <strong>预付费充值模式</strong>。用户使用 API 服务前需先为账户充值。充值金额以平台实际到账为准。</p>
        <p><strong>5.2</strong> API 调用按 <strong>实际用量（Token 数）计费</strong>，不同模型单价不同，具体价格以 <Link to='/pricing' className='text-blue-700 hover:text-blue-800 underline underline-offset-2 font-medium'>定价页面</Link> 公示为准。价格调整时，平台将提前公告。</p>
        <p><strong>5.3</strong> 用户可在账户中查看 <strong>实时余额和消费记录</strong>。如对消费记录有异议，应在 7 日内向平台提出，逾期视为确认无误。</p>
        <p><strong>5.4</strong> 账户余额 <strong>不支持提现或退款</strong>（法律法规另有规定的除外）。充值即表示用户已充分了解并同意此条款。</p>
        <p><strong>5.5</strong> 本平台对接的支付服务（如 Stripe、易支付等）由第三方提供，支付过程中产生的任何问题（如支付失败、重复扣款等），本平台将协助用户与支付服务商沟通，但不承担直接赔偿责任。</p>
        <p><strong>5.6</strong> <strong>订阅服务</strong>（如有）：用户可根据需要选择购买订阅套餐，在有效期内享受约定的配额和服务。订阅到期后如未续费，相关特权将自动失效。</p>
      </>
    ),
  },
  {
    id: 'section-6',
    num: '六',
    title: '知识产权',
    icon: Copyright,
    content: (
      <>
        <p><strong>6.1</strong> 本平台的 <strong>软件、代码、Logo、界面设计、文档</strong> 等所有原创内容的知识产权归本平台所有，受相关法律保护。未经书面授权，用户不得复制、修改、分发或以其他方式使用。</p>
        <p><strong>6.2</strong> 用户通过本平台调用 AI 模型 <strong>生成的内容</strong>，其知识产权归属遵循上游服务商的相关规定。本平台不对 AI 生成内容的原创性、准确性、合法性做出任何保证。</p>
        <p><strong>6.3</strong> 用户上传至本平台的内容（如自定义模型参数、提示词模板等），用户保留所有权。但用户授予本平台为提供服务目的而 <strong>必要的使用权</strong>（如存储、传输）。</p>
      </>
    ),
  },
  {
    id: 'section-7',
    num: '七',
    title: '免责声明',
    icon: ScrollText,
    content: (
      <>
        <p><strong>7.1</strong> 本平台按"现状"提供服务，不作任何明示或暗示的保证，包括但不限于：</p>
        <ul>
          <li>服务的不间断、无错误、完全安全；</li>
          <li>AI 模型生成内容的准确性、完整性、合法性、适用性；</li>
          <li>上游第三方服务的持续可用性。</li>
        </ul>
        <p><strong>7.2</strong> 在适用法律允许的最大范围内，本平台不对以下情况承担责任：</p>
        <ul>
          <li>因上游服务商故障、网络中断、系统维护等导致的服务中断或数据丢失；</li>
          <li>因用户自身原因（如 Key 泄露、操作失误、配置错误）导致的损失；</li>
          <li>因不可抗力（自然灾害、战争、政策变化等）导致的服务中断；</li>
          <li>AI 模型生成内容的使用所带来的任何直接或间接损失。</li>
        </ul>
        <p><strong>7.3</strong> 在任何情况下，本平台对用户的赔偿总额不超过用户在事发前 6 个月内实际支付的费用总额。</p>
      </>
    ),
  },
  {
    id: 'section-8',
    num: '八',
    title: '隐私保护',
    icon: Eye,
    content: (
      <>
        <p><strong>8.1</strong> 本平台重视用户隐私。有关我们如何收集、使用和保护用户个人信息的详细规定，请参阅 <Link to='/privacy-policy' className='text-blue-700 hover:text-blue-800 underline underline-offset-2 font-medium'>《隐私政策》</Link>。</p>
        <p><strong>8.2</strong> 用户使用本平台调用 AI 服务时，请求数据将被转发至上游服务商。请勿在 API 请求中包含个人敏感信息（如身份证号、银行卡号、密码等）。本平台不对用户主动发送的敏感信息承担保密责任。</p>
        <p><strong>8.3</strong> 本平台可能会记录 API 调用日志（包括请求时间、模型名称、Token 用量等）用于计费、监控和故障排查，但不会记录完整的对话内容（除非用户主动开启日志记录功能）。</p>
      </>
    ),
  },
  {
    id: 'section-9',
    num: '九',
    title: '协议变更',
    icon: RefreshCw,
    content: (
      <>
        <p><strong>9.1</strong> 本平台有权随时修改本协议的条款。修改后的协议将在平台公示，公示后即生效。</p>
        <p><strong>9.2</strong> 如用户不同意修改后的条款，应立即停止使用本平台服务。继续使用即视为同意修订后的协议。</p>
        <p><strong>9.3</strong> 对于重大变更（如涉及费用调整、责任限制变化等），本平台将通过站内公告、邮件等方式提前通知用户。</p>
      </>
    ),
  },
  {
    id: 'section-10',
    num: '十',
    title: '服务终止',
    icon: Power,
    content: (
      <>
        <p><strong>10.1</strong> 用户可随时自行注销账户，终止使用本平台服务。账户注销后，已充值的余额不予退还。</p>
        <p><strong>10.2</strong> 本平台有权在以下情况下终止服务：</p>
        <ul>
          <li>用户违反本协议条款且情节严重；</li>
          <li>用户账户连续 12 个月无任何使用记录；</li>
          <li>根据法律法规或监管部门要求；</li>
          <li>本平台因经营调整决定停止运营。</li>
        </ul>
        <p><strong>10.3</strong> 因用户违规导致服务终止的，账户余额不予退还。因平台原因停止运营的，将按比例退还用户余额。</p>
      </>
    ),
  },
  {
    id: 'section-11',
    num: '十一',
    title: '其他条款',
    icon: Gavel,
    content: (
      <>
        <p><strong>11.1</strong> 本协议适用中华人民共和国法律。因本协议引起的争议，双方应友好协商解决；协商不成的，提交平台运营方所在地人民法院管辖。</p>
        <p><strong>11.2</strong> 本协议中的任何条款无论因何种原因完全或部分无效，不影响其余条款的效力。</p>
        <p><strong>11.3</strong> 本平台未行使或延迟行使本协议项下的任何权利，不视为对该权利的放弃。</p>
        <p><strong>11.4</strong> 本协议是用户与本平台之间关于本服务使用的完整协议，取代此前所有口头或书面的沟通和约定。</p>
      </>
    ),
  },
  {
    id: 'section-12',
    num: '十二',
    title: '联系方式',
    icon: Mail,
    content: (
      <>
        <p>如对本协议有任何疑问、意见或建议，请通过以下方式联系我们：</p>
        <ul>
          <li>📧 电子邮件：<strong>support@quantumnous.com</strong></li>
          <li>🌐 官方网站：通过平台在线客服或反馈渠道提交</li>
        </ul>
      </>
    ),
  },
]

export function UserAgreement() {
  const { t } = useTranslation()
  const [activeSection, setActiveSection] = useState('section-1')
  const [showBackTop, setShowBackTop] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // 滚动时高亮当前章节
  useEffect(() => {
    const sectionEls = sections.map((s) => document.getElementById(s.id)).filter(Boolean)
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
            break
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    )
    sectionEls.forEach((el) => el && observerRef.current?.observe(el))

    // 回到顶部按钮
    const onScroll = () => setShowBackTop(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      observerRef.current?.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const tocLinks = useMemo(
    () =>
      sections.map((s) => ({
        id: s.id,
        label: `第${s.num}条 · ${s.title}`,
        shortLabel: s.title,
      })),
    []
  )

  return (
    <PublicLayout showMainContainer={false}>
      {/* ═══ Hero 头部 ═══ */}
      <section className='relative overflow-hidden border-b bg-gradient-to-b from-blue-50/80 via-white to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950'>
        <div className='absolute inset-0 opacity-[0.03] dark:opacity-[0.06]'
          style={{
            backgroundImage: 'radial-gradient(circle at 25% 30%, #1d4ed8 1px, transparent 1px), radial-gradient(circle at 75% 70%, #1d4ed8 1px, transparent 1px)',
            backgroundSize: '40px 40px, 60px 60px',
          }}
        />
        <div className='container relative mx-auto px-4 py-16 md:py-20'>
          <div className='mx-auto max-w-3xl text-center'>
            <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-blue-50/80 px-4 py-1.5 text-sm font-medium text-blue-700 dark:border-blue-800/40 dark:bg-blue-950/50 dark:text-blue-300'>
              <Shield className='h-4 w-4' />
              法律文档
            </div>
            <h1 className='text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl'>
              {t('User Agreement')}
            </h1>
            <p className='mt-3 text-sm text-slate-500 dark:text-slate-400'>
              最后更新日期：2026年6月11日
            </p>
            <div className='mx-auto mt-6 max-w-xl rounded-xl border border-amber-200/80 bg-amber-50/60 p-4 text-left dark:border-amber-800/30 dark:bg-amber-950/30'>
              <p className='text-sm leading-relaxed text-amber-800 dark:text-amber-200'>
                <strong>⚠️ 重要提示：</strong>注册、登录或使用本平台即表示您已充分阅读、理解并同意本协议的全部内容。如果您不同意本协议的任何条款，请立即停止注册和使用本平台。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 主体：侧栏 TOC + 内容 ═══ */}
      <div className='container mx-auto px-4 py-10'>
        <div className='mx-auto flex max-w-6xl gap-10'>
          {/* ── 桌面端侧栏目录 ── */}
          <aside className='hidden w-56 shrink-0 lg:block'>
            <nav className='sticky top-24'>
              <h4 className='mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500'>
                目录
              </h4>
              <ul className='space-y-0.5'>
                {tocLinks.map((link) => (
                  <li key={link.id}>
                    <a
                      href={`#${link.id}`}
                      onClick={(e) => {
                        e.preventDefault()
                        document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }}
                      className={cn(
                        'group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-200',
                        activeSection === link.id
                          ? 'bg-blue-50 font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200'
                      )}
                    >
                      <ChevronRight
                        className={cn(
                          'h-3 w-3 shrink-0 transition-transform duration-200',
                          activeSection === link.id ? 'text-blue-500' : 'text-slate-300 group-hover:translate-x-0.5 dark:text-slate-600'
                        )}
                      />
                      <span className='truncate'>{link.shortLabel}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* ── 主内容区 ── */}
          <div className='min-w-0 flex-1 space-y-8'>
            {sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className='scroll-mt-24 rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md dark:border-slate-800/60 dark:bg-slate-900/50 sm:p-8'
              >
                {/* 章节标题 */}
                <h2 className='mb-5 flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white'>
                  <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'>
                    <section.icon className='h-4 w-4' />
                  </span>
                  <span className='mr-2 text-sm font-normal text-slate-400 dark:text-slate-500'>第{section.num}条</span>
                  {section.title}
                </h2>

                {/* 章节内容 */}
                <div className='prose prose-slate max-w-none dark:prose-invert prose-p:leading-relaxed prose-p:text-sm prose-strong:text-slate-900 dark:prose-strong:text-white prose-li:text-sm prose-li:leading-relaxed prose-ul:my-2 prose-ul:list-disc prose-ul:pl-5'>
                  {section.content}
                </div>
              </section>
            ))}

            {/* 结尾提醒 */}
            <div className='rounded-2xl border border-blue-200/60 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 text-center dark:border-blue-800/30 dark:from-blue-950/30 dark:to-indigo-950/30 sm:p-8'>
              <Shield className='mx-auto mb-3 h-8 w-8 text-blue-500' />
              <p className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                使用本平台即表示您已阅读、理解并同意本协议的全部条款。
                <br />
                请合理、合规使用 AI 服务，共同维护良好的网络环境。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 回到顶部 ── */}
      {showBackTop && (
        <button
          type='button'
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className='fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800'
          aria-label='回到顶部'
        >
          <ArrowUp className='h-4 w-4 text-slate-600 dark:text-slate-300' />
        </button>
      )}
    </PublicLayout>
  )
}
