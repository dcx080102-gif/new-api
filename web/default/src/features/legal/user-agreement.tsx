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

export function UserAgreement() {
  const { t } = useTranslation()
  const [activeSection, setActiveSection] = useState('section-1')
  const [showBackTop, setShowBackTop] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const sections = useMemo(
    () => [
      {
        id: 'section-1',
        num: '1',
        title: t('Service Description'),
        icon: FileText,
        content: (
          <>
            <p>
              <strong>1.1</strong>{' '}
              {t(
                'This platform is an AI API aggregation gateway service. Through a unified interface, it provides users with the ability to connect to multiple AI service providers (such as OpenAI, Claude, Google Gemini, etc.). Users can manage and invoke various AI models through this platform without separately integrating with each provider.'
              )}
            </p>
            <p>
              <strong>1.2</strong>{' '}
              {t(
                'This platform itself does not produce or train AI models. All AI capabilities come from upstream third-party service providers. The response quality, availability, and content safety of each model are the responsibility of the corresponding upstream providers.'
              )}
            </p>
            <p>
              <strong>1.3</strong>{' '}
              {t(
                'This platform reserves the right to adjust, upgrade, suspend, or terminate part or all of its services at any time according to business needs, without prior notice to users, but will make every effort to announce changes in advance.'
              )}
            </p>
          </>
        ),
      },
      {
        id: 'section-2',
        num: '2',
        title: t('Account Registration & Security'),
        icon: Shield,
        content: (
          <>
            <p>
              <strong>2.1</strong>{' '}
              {t(
                'Users must provide true, accurate, and complete personal information when registering, and promptly update any changes. Any consequences arising from false information shall be borne solely by the user.'
              )}
            </p>
            <p>
              <strong>2.2</strong>{' '}
              {t(
                'Users shall properly safeguard their account and password and bear full responsibility for all activities and events conducted through their account. If account theft or security vulnerabilities are discovered, notify this platform immediately.'
              )}
            </p>
            <p>
              <strong>2.3</strong>{' '}
              {t(
                'Users may not lend, rent, transfer, or share their account with others. This platform reserves the right to suspend or terminate accounts exhibiting abnormal usage across multiple devices or IP addresses.'
              )}
            </p>
            <p>
              <strong>2.4</strong>{' '}
              {t(
                'Each user is permitted to register only one account. Bulk registration, use of false information, or other means to obtain multiple accounts is prohibited. Violators may have their accounts canceled by this platform.'
              )}
            </p>
          </>
        ),
      },
      {
        id: 'section-3',
        num: '3',
        title: t('API Key Management'),
        icon: Key,
        content: (
          <>
            <p>
              <strong>3.1</strong>{' '}
              {t(
                'This platform uses API Keys for interface authentication. After creating a Key, users should store it securely. In some systems, the full Key is displayed only once upon creation; if lost, a new Key must be created.'
              )}
            </p>
            <p>
              <strong>3.2</strong>{' '}
              {t(
                'The API Key is the sole credential for calling this platform\'s services. Anyone holding the Key can perform operations on behalf of the user. All losses resulting from Key leaks (including but not limited to quota theft, data breaches, etc.) shall be borne by the user.'
              )}
            </p>
            <p>
              <strong>3.3</strong>{' '}
              {t(
                'Users may set quota limits, expiration dates, IP whitelists, and other security policies for API Keys. Reasonable configuration is recommended to reduce risk.'
              )}
            </p>
            <p>
              <strong>3.4</strong>{' '}
              {t(
                'Users may not use API Keys for illegal, violative, or rights-infringing purposes, including but not limited to generating illegal content, infringing intellectual property, network attacks, spam dissemination, etc.'
              )}
            </p>
          </>
        ),
      },
      {
        id: 'section-4',
        num: '4',
        title: t('Usage Guidelines'),
        icon: AlertTriangle,
        content: (
          <>
            <p>
              <strong>4.1</strong>{' '}
              {t(
                'When using this platform\'s services, users must comply with applicable national laws and regulations as well as relevant international laws and regulations.'
              )}
            </p>
            <p>
              <strong>4.2</strong>{' '}
              {t('Users may not use this platform to engage in the following activities:')}
            </p>
            <ul>
              <li>
                {t(
                  'Generate or disseminate illegal information (including but not limited to pornography, violence, terrorism, gambling, fraud, etc.);'
                )}
              </li>
              <li>
                {t(
                  'Infringe upon the intellectual property, trade secrets, privacy rights, reputation rights, or other legitimate rights of others;'
                )}
              </li>
              <li>
                {t(
                  'Interfere with or disrupt the normal operation of this platform or upstream service providers (including but not limited to DDoS attacks, malicious crawling, API brute-forcing, etc.);'
                )}
              </li>
              <li>
                {t(
                  'Attempt to obtain this platform\'s source code or algorithms through reverse engineering, decompilation, or other means;'
                )}
              </li>
              <li>
                {t(
                  'Bypass this platform\'s billing system or security mechanisms in any way;'
                )}
              </li>
              <li>
                {t(
                  'Use this platform to generate false information, deepfakes, social engineering attacks, or other malicious purposes.'
                )}
              </li>
            </ul>
            <p>
              <strong>4.3</strong>{' '}
              {t(
                'If a user violates the above provisions, this platform may take the following measures depending on the severity:'
              )}
            </p>
            <ul>
              <li>{t('Issue a warning and require rectification within a deadline;')}</li>
              <li>{t('Suspend or permanently ban the account;')}</li>
              <li>{t('Deduct or zero out the account balance (non-refundable);')}</li>
              <li>{t('Reserve the right to pursue legal liability;')}</li>
              <li>{t('Report to relevant regulatory authorities.')}</li>
            </ul>
          </>
        ),
      },
      {
        id: 'section-5',
        num: '5',
        title: t('Fees & Payments'),
        icon: CreditCard,
        content: (
          <>
            <p>
              <strong>5.1</strong>{' '}
              {t(
                'This platform adopts a prepaid recharge model. Users must top up their accounts before using API services. The recharge amount is based on the actual funds received by the platform.'
              )}
            </p>
            <p>
              <strong>5.2</strong>{' '}
              {t(
                'API calls are billed based on actual usage (token count). Different models have different unit prices. For specific pricing, please refer to the '
              )}
              <Link
                to="/pricing"
                className="text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2 font-medium"
              >
                {t('Pricing page')}
              </Link>
              {t(
                '. When prices are adjusted, the platform will announce the changes in advance.'
              )}
            </p>
            <p>
              <strong>5.3</strong>{' '}
              {t(
                'Users can view real-time balances and consumption records in their accounts. If there are objections to consumption records, they must be raised with the platform within 7 days; otherwise, they are deemed confirmed and correct.'
              )}
            </p>
            <p>
              <strong>5.4</strong>{' '}
              {t(
                'Account balances do not support withdrawal or refund (except as otherwise provided by applicable laws and regulations). Recharging signifies that the user has fully understood and agreed to this term.'
              )}
            </p>
            <p>
              <strong>5.5</strong>{' '}
              {t(
                'Payment services connected to this platform (such as Stripe, Yipay, etc.) are provided by third parties. For any issues arising during the payment process (such as payment failures, duplicate charges, etc.), this platform will assist users in communicating with the payment service provider but does not assume direct liability for compensation.'
              )}
            </p>
            <p>
              <strong>5.6</strong>{' '}
              {t(
                'Subscription services (if available): Users may choose to purchase subscription plans and enjoy agreed-upon quotas and services during the validity period. If a subscription expires without renewal, relevant privileges will automatically lapse.'
              )}
            </p>
          </>
        ),
      },
      {
        id: 'section-6',
        num: '6',
        title: t('Intellectual Property'),
        icon: Copyright,
        content: (
          <>
            <p>
              <strong>6.1</strong>{' '}
              {t(
                'The intellectual property rights of all original content of this platform, including software, code, logos, interface designs, and documentation, belong to this platform and are protected by relevant laws. Without written authorization, users may not copy, modify, distribute, or otherwise use such content.'
              )}
            </p>
            <p>
              <strong>6.2</strong>{' '}
              {t(
                'The intellectual property rights of content generated by users through calling AI models on this platform shall follow the relevant regulations of upstream service providers. This platform makes no guarantees regarding the originality, accuracy, or legality of AI-generated content.'
              )}
            </p>
            <p>
              <strong>6.3</strong>{' '}
              {t(
                'Users retain ownership of content uploaded to this platform (such as custom model parameters, prompt templates, etc.). However, users grant this platform necessary usage rights (such as storage and transmission) for the purpose of providing services.'
              )}
            </p>
          </>
        ),
      },
      {
        id: 'section-7',
        num: '7',
        title: t('Disclaimer'),
        icon: ScrollText,
        content: (
          <>
            <p>
              <strong>7.1</strong>{' '}
              {t(
                'This platform provides services on an "as-is" basis without any express or implied warranties, including but not limited to:'
              )}
            </p>
            <ul>
              <li>{t('Uninterrupted, error-free, and completely secure service;')}</li>
              <li>
                {t(
                  'Accuracy, completeness, legality, and suitability of AI model-generated content;'
                )}
              </li>
              <li>{t('Continued availability of upstream third-party services.')}</li>
            </ul>
            <p>
              <strong>7.2</strong>{' '}
              {t(
                'To the maximum extent permitted by applicable law, this platform shall not be liable for:'
              )}
            </p>
            <ul>
              <li>
                {t(
                  'Service interruptions or data loss caused by upstream service provider failures, network disruptions, system maintenance, etc.;'
                )}
              </li>
              <li>
                {t(
                  'Losses caused by user-related reasons (such as Key leaks, operational errors, configuration mistakes);'
                )}
              </li>
              <li>
                {t(
                  'Service interruptions caused by force majeure (natural disasters, war, policy changes, etc.);'
                )}
              </li>
              <li>
                {t(
                  'Any direct or indirect losses arising from the use of AI model-generated content.'
                )}
              </li>
            </ul>
            <p>
              <strong>7.3</strong>{' '}
              {t(
                'In any case, the total compensation from this platform to users shall not exceed the total fees actually paid by the user in the 6 months prior to the incident.'
              )}
            </p>
          </>
        ),
      },
      {
        id: 'section-8',
        num: '8',
        title: t('Privacy Protection'),
        icon: Eye,
        content: (
          <>
            <p>
              <strong>8.1</strong>{' '}
              {t(
                'This platform values user privacy. For detailed provisions on how we collect, use, and protect user personal information, please refer to the '
              )}
              <Link
                to="/privacy-policy"
                className="text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2 font-medium"
              >
                {t('Privacy Policy')}
              </Link>
              {t('.')}
            </p>
            <p>
              <strong>8.2</strong>{' '}
              {t(
                'When users call AI services through this platform, request data will be forwarded to upstream service providers. Please do not include sensitive personal information (such as ID numbers, bank card numbers, passwords, etc.) in API requests. This platform does not assume confidentiality responsibility for sensitive information actively sent by users.'
              )}
            </p>
            <p>
              <strong>8.3</strong>{' '}
              {t(
                'This platform may record API call logs (including request time, model name, token usage, etc.) for billing, monitoring, and troubleshooting purposes, but will not record complete conversation content (unless the user actively enables the logging feature).'
              )}
            </p>
          </>
        ),
      },
      {
        id: 'section-9',
        num: '9',
        title: t('Agreement Changes'),
        icon: RefreshCw,
        content: (
          <>
            <p>
              <strong>9.1</strong>{' '}
              {t(
                'This platform reserves the right to modify the terms of this agreement at any time. The modified agreement will be published on the platform and shall take effect upon publication.'
              )}
            </p>
            <p>
              <strong>9.2</strong>{' '}
              {t(
                'If a user does not agree with the modified terms, they should immediately stop using this platform\'s services. Continued use shall be deemed acceptance of the revised agreement.'
              )}
            </p>
            <p>
              <strong>9.3</strong>{' '}
              {t(
                'For significant changes (such as fee adjustments, liability limitation changes, etc.), this platform will notify users in advance through on-site announcements, email, and other means.'
              )}
            </p>
          </>
        ),
      },
      {
        id: 'section-10',
        num: '10',
        title: t('Service Termination'),
        icon: Power,
        content: (
          <>
            <p>
              <strong>10.1</strong>{' '}
              {t(
                'Users may cancel their accounts at any time and terminate their use of this platform\'s services. After account cancellation, the remaining balance is non-refundable.'
              )}
            </p>
            <p>
              <strong>10.2</strong>{' '}
              {t(
                'This platform reserves the right to terminate services under the following circumstances:'
              )}
            </p>
            <ul>
              <li>
                {t(
                  'The user violates the terms of this agreement and the circumstances are serious;'
                )}
              </li>
              <li>
                {t(
                  'The user account has no usage records for 12 consecutive months;'
                )}
              </li>
              <li>
                {t(
                  'As required by applicable laws, regulations, or regulatory authorities;'
                )}
              </li>
              <li>
                {t(
                  'This platform decides to cease operations due to business adjustments.'
                )}
              </li>
            </ul>
            <p>
              <strong>10.3</strong>{' '}
              {t(
                'If service termination is due to user violations, the account balance is non-refundable. If service termination is due to platform cessation, the user\'s remaining balance will be refunded on a pro-rata basis.'
              )}
            </p>
          </>
        ),
      },
      {
        id: 'section-11',
        num: '11',
        title: t('Other Terms'),
        icon: Gavel,
        content: (
          <>
            <p>
              <strong>11.1</strong>{' '}
              {t(
                'This agreement is governed by the laws of the People\'s Republic of China. Any disputes arising from this agreement shall be resolved through friendly negotiation between the parties; if negotiation fails, the dispute shall be submitted to the People\'s Court in the location of the platform operator for jurisdiction.'
              )}
            </p>
            <p>
              <strong>11.2</strong>{' '}
              {t(
                'If any provision of this agreement is wholly or partially invalid for any reason, the validity of the remaining provisions shall not be affected.'
              )}
            </p>
            <p>
              <strong>11.3</strong>{' '}
              {t(
                'The failure or delay by this platform in exercising any right under this agreement shall not be deemed a waiver of such right.'
              )}
            </p>
            <p>
              <strong>11.4</strong>{' '}
              {t(
                'This agreement constitutes the complete agreement between the user and this platform regarding the use of this service, superseding all prior oral or written communications and agreements.'
              )}
            </p>
          </>
        ),
      },
      {
        id: 'section-12',
        num: '12',
        title: t('Contact Information'),
        icon: Mail,
        content: (
          <>
            <p>
              {t(
                'If you have any questions, comments, or suggestions regarding this agreement, please contact us through the following methods:'
              )}
            </p>
            <ul>
              <li>
                📧 {t('Email')}: <strong>support@quantumnous.com</strong>
              </li>
              <li>
                🌐 {t('Website')}: {t('Submit via the platform\'s online customer service or feedback channel')}
              </li>
            </ul>
          </>
        ),
      },
    ],
    [t]
  )

  const tocLinks = useMemo(
    () =>
      sections.map((s) => ({
        id: s.id,
        label: t('Article {{num}} — {{title}}', { num: s.num, title: s.title }),
        shortLabel: s.title,
      })),
    [sections, t]
  )

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
  }, [sections])

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
              {t('Legal Documents')}
            </div>
            <h1 className='text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl'>
              {t('User Agreement')}
            </h1>
            <p className='mt-3 text-sm text-slate-500 dark:text-slate-400'>
              {t('Last updated: June 11, 2026')}
            </p>
            <div className='mx-auto mt-6 max-w-xl rounded-xl border border-amber-200/80 bg-amber-50/60 p-4 text-left dark:border-amber-800/30 dark:bg-amber-950/30'>
              <p className='text-sm leading-relaxed text-amber-800 dark:text-amber-200'>
                <strong>⚠️ {t('Important Notice')}:</strong>{' '}
                {t(
                  'By registering, logging in, or using this platform, you confirm that you have fully read, understood, and agreed to all terms of this agreement. If you do not agree with any provision of this agreement, please immediately stop registering and using this platform.'
                )}
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
                {t('Table of Contents')}
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
                  <span className='mr-2 text-sm font-normal text-slate-400 dark:text-slate-500'>
                    {t('Section {{num}}', { num: section.num })}
                  </span>
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
                {t(
                  'By using this platform, you confirm that you have read, understood, and agreed to all terms of this agreement.'
                )}
                <br />
                {t(
                  'Please use AI services reasonably and compliantly, and work together to maintain a healthy online environment.'
                )}
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
          aria-label={t('Back to top')}
        >
          <ArrowUp className='h-4 w-4 text-slate-600 dark:text-slate-300' />
        </button>
      )}
    </PublicLayout>
  )
}
