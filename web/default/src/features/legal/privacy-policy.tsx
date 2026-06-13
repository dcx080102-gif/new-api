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
// TODO: This page contains hardcoded Chinese text that needs i18n migration (AGENTS.md 3.1).
// All section content should use t() wrappers with proper translation keys.
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Shield,
  HardDrive,
  Share2,
  Cookie,
  Hand,
  Baby,
  Globe,
  Plane,
  Bell,
  Mail,
  ChevronRight,
  ArrowUp,
  Database,
  Cpu,
} from 'lucide-react'
import { PublicLayout } from '@/components/layout'
import { cn } from '@/lib/utils'

/* ── 各节内容 ── */
const sections = [
  {
    id: 'section-1',
    num: '一',
    title: '信息收集',
    icon: Database,
    content: (
      <>
        <p>我们仅在为您提供服务所必需的范围内收集信息。具体包括：</p>

        <h3>1.1 您主动提供的信息</h3>
        <ul>
          <li><strong>账户信息</strong>：注册时提供的用户名、电子邮件地址、密码（加密存储）。</li>
          <li><strong>支付信息</strong>：充值时的交易记录。请注意，完整的支付卡号等敏感信息由第三方支付服务商（如 Stripe、易支付）直接处理，本平台不存储您的完整支付卡信息。</li>
          <li><strong>联系信息</strong>：您通过客服、反馈渠道主动提交的联系方式和问题描述。</li>
        </ul>

        <h3>1.2 自动收集的信息</h3>
        <ul>
          <li><strong>日志信息</strong>：API 调用时间、模型名称、Token 用量、请求 IP 地址等，用于计费、监控和故障排查。</li>
          <li><strong>设备信息</strong>：浏览器类型、操作系统版本、设备型号、屏幕分辨率等，用于优化用户体验。</li>
          <li><strong>使用数据</strong>：页面访问记录、功能使用频率、会话时长等，用于改进服务质量。</li>
        </ul>

        <h3>1.3 不收集的信息</h3>
        <ul>
          <li>我们<strong>不会</strong>主动记录您的完整 API 对话内容（除非您明确开启日志记录功能）。</li>
          <li>我们<strong>不会</strong>在未经您同意的情况下收集您的精确地理位置信息。</li>
        </ul>
      </>
    ),
  },
  {
    id: 'section-2',
    num: '二',
    title: '信息使用',
    icon: Cpu,
    content: (
      <>
        <p>我们收集的信息仅用于以下目的：</p>
        <ul>
          <li><strong>服务提供</strong>：处理 API 请求、管理账户、完成交易。</li>
          <li><strong>计费结算</strong>：根据 API 调用量（Token 数）准确计算费用。</li>
          <li><strong>安全保障</strong>：检测和防范欺诈、滥用、未授权访问等安全威胁。</li>
          <li><strong>服务优化</strong>：分析使用趋势，改进产品功能和用户体验。</li>
          <li><strong>客户支持</strong>：响应您的咨询、投诉和技术支持请求。</li>
          <li><strong>合规要求</strong>：遵守适用的法律法规和监管要求。</li>
          <li><strong>服务通告</strong>：向您发送与服务相关的重要通知（如价格调整、功能变更、安全警报等）。</li>
        </ul>
      </>
    ),
  },
  {
    id: 'section-3',
    num: '三',
    title: '信息存储与安全',
    icon: HardDrive,
    content: (
      <>
        <p><strong>3.1 存储位置</strong>：您的信息存储于位于美国和中国境内的服务器上。我们根据业务需要选择适当的存储区域，并确保符合当地数据保护法规。</p>

        <p><strong>3.2 保留期限</strong>：我们仅在实现收集目的所必需的期限内保留您的个人信息，除非法律要求更长的保留期。账户注销后，我们将在合理时间内删除或匿名化处理您的数据。</p>

        <p><strong>3.3 安全措施</strong>：我们采用行业标准的安全措施保护您的信息：</p>
        <ul>
          <li><strong>传输加密</strong>：所有数据传输均使用 TLS/SSL 加密协议。</li>
          <li><strong>密码保护</strong>：用户密码使用 bcrypt 等强哈希算法加密存储，任何人均无法反向破解。</li>
          <li><strong>访问控制</strong>：严格的内部权限管理，只有授权人员才能访问必要的用户数据。</li>
          <li><strong>安全审计</strong>：定期进行安全扫描和渗透测试，及时修复潜在漏洞。</li>
          <li><strong>数据备份</strong>：关键数据定期备份，防止因硬件故障或灾难事件导致的数据丢失。</li>
        </ul>

        <p><strong>3.4 安全提示</strong>：尽管我们采取了上述措施，但请注意没有任何一种互联网传输或电子存储方法是 100% 安全的。请妥善保管您的账户密码和 API Key，不要在公共网络或不安全的环境中访问本平台。</p>
      </>
    ),
  },
  {
    id: 'section-4',
    num: '四',
    title: '信息共享与披露',
    icon: Share2,
    content: (
      <>
        <p>我们<strong>不会出售</strong>您的个人信息。在以下情况下，我们可能会共享或披露您的信息：</p>

        <p><strong>4.1 上游 AI 服务商</strong>：当您调用 AI 模型时，您的 API 请求数据（提示词、参数等）将被转发至对应的上游服务商（如 OpenAI、Anthropic 等）。这是提供服务的必要步骤。请勿在 API 请求中包含个人敏感信息。</p>

        <p><strong>4.2 第三方支付处理商</strong>：充值交易由 Stripe、易支付等第三方支付服务商处理，相关交易信息将直接传输至支付服务商。</p>

        <p><strong>4.3 法律要求</strong>：如收到有效的法律文书（法院命令、传票等），或为保护我们及他人的权利、财产和安全，我们可能需要披露相关信息。</p>

        <p><strong>4.4 业务转让</strong>：如发生合并、收购或资产出售，您的信息可能作为资产转让。我们将通过站内公告或邮件通知您。</p>

        <p><strong>4.5 经您同意</strong>：在获得您明确同意的情况下，我们可能与其他方共享您的信息。</p>
      </>
    ),
  },
  {
    id: 'section-5',
    num: '五',
    title: 'Cookie 与追踪技术',
    icon: Cookie,
    content: (
      <>
        <p>我们使用 Cookie 和类似技术来提升您的使用体验：</p>

        <p><strong>5.1 必要 Cookie</strong>：用于维持登录状态、记住语言偏好和主题设置等基本功能。这些 Cookie 是提供服务所必需的，无法禁用。</p>

        <p><strong>5.2 功能 Cookie</strong>：用于记住您的个性化设置（如侧栏折叠状态、表格列显示偏好等），提升使用便利性。</p>

        <p><strong>5.3 分析 Cookie</strong>：我们可能使用自建或第三方分析工具来了解用户如何使用本平台，以便改进服务。这些数据以匿名聚合形式使用。</p>

        <p><strong>5.4 您的选择</strong>：您可以通过浏览器设置管理或删除 Cookie。但请注意，禁用必要 Cookie 可能导致部分功能无法正常使用。</p>
      </>
    ),
  },
  {
    id: 'section-6',
    num: '六',
    title: '用户权利',
    icon: Hand,
    content: (
      <>
        <p>根据适用的数据保护法律（包括但不限于 GDPR、CCPA 等），您享有以下权利：</p>
        <ul>
          <li><strong>访问权</strong>：您可以随时登录账户查看我们存储的您的个人信息。</li>
          <li><strong>更正权</strong>：如发现信息不准确或不完整，您可以在账户设置中进行修改。</li>
          <li><strong>删除权</strong>：您可以随时注销账户，我们将删除或匿名化处理您的数据（法律要求保留的除外）。</li>
          <li><strong>数据可携带权</strong>：您可以申请导出我们持有的您的个人数据副本。</li>
          <li><strong>限制处理权</strong>：在某些情况下，您可以要求限制我们对您数据的处理。</li>
          <li><strong>反对权</strong>：您可以反对我们基于合法利益处理您的数据。</li>
          <li><strong>撤回同意权</strong>：对于我们基于同意收集的信息，您可以随时撤回同意（不影响撤回前已进行处理的合法性）。</li>
        </ul>
        <p>如需行使上述权利，请通过 <a href='/user-agreement#section-12' className='text-blue-700 hover:text-blue-800 underline underline-offset-2 font-medium'>联系方式</a> 与我们联系。我们将在 30 日内回复您的请求。</p>
      </>
    ),
  },
  {
    id: 'section-7',
    num: '七',
    title: '未成年人保护',
    icon: Baby,
    content: (
      <>
        <p><strong>7.1</strong> 本平台服务面向能够依法缔结有效合同的成年人。我们<strong>不会故意收集</strong> 18 周岁以下未成年人的个人信息。</p>

        <p><strong>7.2</strong> 如您是未成年人的父母或监护人，并发现未成年人向我们提供了个人信息，请立即联系我们。我们将在核实后尽快删除相关数据。</p>

        <p><strong>7.3</strong> 如您是 13 至 18 周岁的未成年人，请在父母或监护人的陪同下阅读本政策，并在获得同意后使用本平台。</p>
      </>
    ),
  },
  {
    id: 'section-8',
    num: '八',
    title: '第三方服务',
    icon: Globe,
    content: (
      <>
        <p>本平台可能包含指向第三方网站或服务的链接，或依赖于第三方提供的服务组件：</p>
        <ul>
          <li><strong>AI 模型服务商</strong>：OpenAI、Anthropic、Google 等。您在调用模型时发送的数据受各服务商的隐私政策约束。</li>
          <li><strong>支付服务商</strong>：Stripe、易支付等。您的支付信息由这些服务商直接处理并受其隐私政策保护。</li>
          <li><strong>CDN 与托管服务</strong>：Cloudflare、Vercel 等基础设施服务商。</li>
        </ul>
        <p>我们不对第三方网站或服务的隐私实践负责。建议您在使用前查阅相关第三方的隐私政策。</p>
      </>
    ),
  },
  {
    id: 'section-9',
    num: '九',
    title: '跨境数据传输',
    icon: Plane,
    content: (
      <>
        <p><strong>9.1</strong> 您的信息可能在您所在国境外的服务器上存储和处理。这些国家/地区的数据保护法律可能与您所在地不同。</p>

        <p><strong>9.2</strong> 在进行跨境数据传输时，我们将采取适当的保障措施（如标准合同条款），确保您的数据获得与您所在地同等水平的保护。</p>

        <p><strong>9.3</strong> 使用本平台即表示您同意本条款所述的跨境数据传输。</p>
      </>
    ),
  },
  {
    id: 'section-10',
    num: '十',
    title: '政策更新',
    icon: Bell,
    content: (
      <>
        <p><strong>10.1</strong> 我们可能不时更新本隐私政策。更新后的政策将在本页面发布，发布后即生效。</p>

        <p><strong>10.2</strong> 对于重大变更（如收集信息的目的变化、共享范围扩大等），我们将通过站内公告、邮件等方式提前通知您。</p>

        <p><strong>10.3</strong> 我们建议您定期查阅本政策，以了解我们如何保护您的信息。继续使用本平台即表示您同意更新后的政策。</p>
      </>
    ),
  },
  {
    id: 'section-11',
    num: '十一',
    title: '联系方式',
    icon: Mail,
    content: (
      <>
        <p>如对本隐私政策或我们的数据处理实践有任何疑问、意见或请求，请通过以下方式联系我们：</p>
        <ul>
          <li>📧 电子邮件：<strong>support@quantumnous.com</strong></li>
          <li>🌐 官方网站：通过平台在线客服或反馈渠道提交</li>
          <li>⏱️ 响应时间：我们将在 <strong>15 个工作日内</strong> 回复您的隐私相关请求</li>
        </ul>
      </>
    ),
  },
]

export function PrivacyPolicy() {
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
              {t('Privacy Policy')}
            </h1>
            <p className='mt-3 text-sm text-slate-500 dark:text-slate-400'>
              最后更新日期：2026年6月13日
            </p>
            <div className='mx-auto mt-6 max-w-xl rounded-xl border border-blue-200/80 bg-blue-50/60 p-4 text-left dark:border-blue-800/30 dark:bg-blue-950/30'>
              <p className='text-sm leading-relaxed text-blue-800 dark:text-blue-200'>
                <strong>📋 概要：</strong>我们重视您的隐私。本政策详细说明了我们如何收集、使用、存储和保护您的个人信息。使用本平台即表示您已阅读并理解本政策。
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
                <div className='prose prose-slate max-w-none dark:prose-invert prose-p:leading-relaxed prose-p:text-sm prose-strong:text-slate-900 dark:prose-strong:text-white prose-li:text-sm prose-li:leading-relaxed prose-ul:my-2 prose-ul:list-disc prose-ul:pl-5 prose-h3:text-base prose-h3:font-semibold prose-h3:mt-5 prose-h3:mb-2'>
                  {section.content}
                </div>
              </section>
            ))}

            {/* 结尾提醒 */}
            <div className='rounded-2xl border border-blue-200/60 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 text-center dark:border-blue-800/30 dark:from-blue-950/30 dark:to-indigo-950/30 sm:p-8'>
              <Shield className='mx-auto mb-3 h-8 w-8 text-blue-500' />
              <p className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                如对本隐私政策有任何疑问，请随时
                <a href='mailto:support@quantumnous.com' className='text-blue-700 hover:text-blue-800 underline underline-offset-2 font-medium mx-1'>
                  联系我们
                </a>
                。
                <br />
                我们将竭诚为您解答。
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
