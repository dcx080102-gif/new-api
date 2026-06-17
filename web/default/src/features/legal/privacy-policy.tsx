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

export function PrivacyPolicy() {
  const { t } = useTranslation()
  const [activeSection, setActiveSection] = useState('section-1')
  const [showBackTop, setShowBackTop] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const sections = useMemo(
    () => [
      {
        id: 'section-1',
        num: '1',
        title: t('Information Collection'),
        icon: Database,
        content: (
          <>
            <p>
              {t(
                'We collect information only to the extent necessary to provide you with our services. Specifically:'
              )}
            </p>

            <h3>{t('1.1 Information You Provide Voluntarily')}</h3>
            <ul>
              <li>
                <strong>{t('Account Information')}:</strong>{' '}
                {t(
                  'Username, email address, and password (stored encrypted) provided during registration.'
                )}
              </li>
              <li>
                <strong>{t('Payment Information')}:</strong>{' '}
                {t(
                  'Transaction records during top-ups. Please note that sensitive information such as full payment card numbers is processed directly by third-party payment service providers (such as Stripe, Yipay), and this platform does not store your complete payment card information.'
                )}
              </li>
              <li>
                <strong>{t('Contact Information')}:</strong>{' '}
                {t(
                  'Contact details and problem descriptions voluntarily submitted by you through customer service or feedback channels.'
                )}
              </li>
            </ul>

            <h3>{t('1.2 Information Collected Automatically')}</h3>
            <ul>
              <li>
                <strong>{t('Log Information')}:</strong>{' '}
                {t(
                  'API call time, model name, token usage, request IP address, etc., used for billing, monitoring, and troubleshooting.'
                )}
              </li>
              <li>
                <strong>{t('Device Information')}:</strong>{' '}
                {t(
                  'Browser type, operating system version, device model, screen resolution, etc., used to optimize user experience.'
                )}
              </li>
              <li>
                <strong>{t('Usage Data')}:</strong>{' '}
                {t(
                  'Page visit records, feature usage frequency, session duration, etc., used to improve service quality.'
                )}
              </li>
            </ul>

            <h3>{t('1.3 Information We Do Not Collect')}</h3>
            <ul>
              <li>
                {t(
                  'We do not actively record your complete API conversation content (unless you explicitly enable the logging feature).'
                )}
              </li>
              <li>
                {t(
                  'We do not collect your precise geographic location information without your consent.'
                )}
              </li>
            </ul>
          </>
        ),
      },
      {
        id: 'section-2',
        num: '2',
        title: t('Information Usage'),
        icon: Cpu,
        content: (
          <>
            <p>
              {t(
                'The information we collect is used only for the following purposes:'
              )}
            </p>
            <ul>
              <li>
                <strong>{t('Service Provision')}:</strong>{' '}
                {t('Processing API requests, managing accounts, and completing transactions.')}
              </li>
              <li>
                <strong>{t('Billing & Settlement')}:</strong>{' '}
                {t(
                  'Accurately calculating fees based on API call volume (token count).'
                )}
              </li>
              <li>
                <strong>{t('Security Assurance')}:</strong>{' '}
                {t(
                  'Detecting and preventing security threats such as fraud, abuse, and unauthorized access.'
                )}
              </li>
              <li>
                <strong>{t('Service Optimization')}:</strong>{' '}
                {t(
                  'Analyzing usage trends to improve product features and user experience.'
                )}
              </li>
              <li>
                <strong>{t('Customer Support')}:</strong>{' '}
                {t(
                  'Responding to your inquiries, complaints, and technical support requests.'
                )}
              </li>
              <li>
                <strong>{t('Compliance Requirements')}:</strong>{' '}
                {t(
                  'Complying with applicable laws, regulations, and regulatory requirements.'
                )}
              </li>
              <li>
                <strong>{t('Service Announcements')}:</strong>{' '}
                {t(
                  'Sending you important service-related notifications (such as price adjustments, feature changes, security alerts, etc.).'
                )}
              </li>
            </ul>
          </>
        ),
      },
      {
        id: 'section-3',
        num: '3',
        title: t('Information Storage & Security'),
        icon: HardDrive,
        content: (
          <>
            <p>
              <strong>{t('3.1 Storage Location')}:</strong>{' '}
              {t(
                'Your information is stored on servers located in the United States and China. We select appropriate storage regions based on business needs and ensure compliance with local data protection regulations.'
              )}
            </p>

            <p>
              <strong>{t('3.2 Retention Period')}:</strong>{' '}
              {t(
                'We retain your personal information only for the period necessary to fulfill the purposes of collection, unless a longer retention period is required by law. After account cancellation, we will delete or anonymize your data within a reasonable timeframe.'
              )}
            </p>

            <p>
              <strong>{t('3.3 Security Measures')}:</strong>{' '}
              {t(
                'We use industry-standard security measures to protect your information:'
              )}
            </p>
            <ul>
              <li>
                <strong>{t('Transmission Encryption')}:</strong>{' '}
                {t(
                  'All data transmission uses TLS/SSL encryption protocols.'
                )}
              </li>
              <li>
                <strong>{t('Password Protection')}:</strong>{' '}
                {t(
                  'User passwords are stored using strong hash algorithms such as bcrypt, and no one can reverse-decrypt them.'
                )}
              </li>
              <li>
                <strong>{t('Access Control')}:</strong>{' '}
                {t(
                  'Strict internal permission management ensures only authorized personnel can access necessary user data.'
                )}
              </li>
              <li>
                <strong>{t('Security Audits')}:</strong>{' '}
                {t(
                  'Regular security scanning and penetration testing are conducted to promptly fix potential vulnerabilities.'
                )}
              </li>
              <li>
                <strong>{t('Data Backup')}:</strong>{' '}
                {t(
                  'Critical data is regularly backed up to prevent data loss due to hardware failure or disaster events.'
                )}
              </li>
            </ul>

            <p>
              <strong>{t('3.4 Security Advisory')}:</strong>{' '}
              {t(
                'Despite the measures we have taken, please note that no method of internet transmission or electronic storage is 100% secure. Please safeguard your account password and API Key, and avoid accessing this platform on public networks or in insecure environments.'
              )}
            </p>
          </>
        ),
      },
      {
        id: 'section-4',
        num: '4',
        title: t('Information Sharing & Disclosure'),
        icon: Share2,
        content: (
          <>
            <p>
              {t(
                'We do not sell your personal information. We may share or disclose your information under the following circumstances:'
              )}
            </p>

            <p>
              <strong>{t('4.1 Upstream AI Service Providers')}:</strong>{' '}
              {t(
                'When you call AI models, your API request data (prompts, parameters, etc.) will be forwarded to the corresponding upstream service providers (such as OpenAI, Anthropic, etc.). This is a necessary step for providing the service. Please do not include sensitive personal information in API requests.'
              )}
            </p>

            <p>
              <strong>{t('4.2 Third-Party Payment Processors')}:</strong>{' '}
              {t(
                'Top-up transactions are processed by third-party payment service providers such as Stripe and Yipay. Relevant transaction information will be transmitted directly to the payment service provider.'
              )}
            </p>

            <p>
              <strong>{t('4.3 Legal Requirements')}:</strong>{' '}
              {t(
                'If we receive valid legal documents (court orders, subpoenas, etc.), or to protect our rights, property, and safety and those of others, we may need to disclose relevant information.'
              )}
            </p>

            <p>
              <strong>{t('4.4 Business Transfer')}:</strong>{' '}
              {t(
                'In the event of a merger, acquisition, or asset sale, your information may be transferred as an asset. We will notify you through on-site announcements or email.'
              )}
            </p>

            <p>
              <strong>{t('4.5 With Your Consent')}:</strong>{' '}
              {t(
                'With your explicit consent, we may share your information with other parties.'
              )}
            </p>
          </>
        ),
      },
      {
        id: 'section-5',
        num: '5',
        title: t('Cookies & Tracking Technologies'),
        icon: Cookie,
        content: (
          <>
            <p>
              {t(
                'We use cookies and similar technologies to enhance your experience:'
              )}
            </p>

            <p>
              <strong>{t('5.1 Necessary Cookies')}:</strong>{' '}
              {t(
                'Used for basic functions such as maintaining login status, remembering language preferences, and theme settings. These cookies are necessary to provide the service and cannot be disabled.'
              )}
            </p>

            <p>
              <strong>{t('5.2 Functional Cookies')}:</strong>{' '}
              {t(
                'Used to remember your personalization settings (such as sidebar collapse state, table column display preferences, etc.), enhancing convenience.'
              )}
            </p>

            <p>
              <strong>{t('5.3 Analytics Cookies')}:</strong>{' '}
              {t(
                'We may use self-built or third-party analytics tools to understand how users use this platform to improve services. This data is used in anonymous, aggregated form.'
              )}
            </p>

            <p>
              <strong>{t('5.4 Your Choices')}:</strong>{' '}
              {t(
                'You can manage or delete cookies through your browser settings. However, please note that disabling necessary cookies may prevent some features from functioning properly.'
              )}
            </p>
          </>
        ),
      },
      {
        id: 'section-6',
        num: '6',
        title: t('User Rights'),
        icon: Hand,
        content: (
          <>
            <p>
              {t(
                'Under applicable data protection laws (including but not limited to GDPR, CCPA, etc.), you have the following rights:'
              )}
            </p>
            <ul>
              <li>
                <strong>{t('Right of Access')}:</strong>{' '}
                {t(
                  'You can log into your account at any time to view the personal information we store about you.'
                )}
              </li>
              <li>
                <strong>{t('Right of Rectification')}:</strong>{' '}
                {t(
                  'If you find information to be inaccurate or incomplete, you can modify it in your account settings.'
                )}
              </li>
              <li>
                <strong>{t('Right of Erasure')}:</strong>{' '}
                {t(
                  'You can cancel your account at any time, and we will delete or anonymize your data (except as required by law to be retained).'
                )}
              </li>
              <li>
                <strong>{t('Right of Data Portability')}:</strong>{' '}
                {t(
                  'You can request to export a copy of the personal data we hold about you.'
                )}
              </li>
              <li>
                <strong>{t('Right to Restrict Processing')}:</strong>{' '}
                {t(
                  'Under certain circumstances, you can request that we restrict the processing of your data.'
                )}
              </li>
              <li>
                <strong>{t('Right to Object')}:</strong>{' '}
                {t(
                  'You can object to our processing of your data based on legitimate interests.'
                )}
              </li>
              <li>
                <strong>{t('Right to Withdraw Consent')}:</strong>{' '}
                {t(
                  'For information collected based on your consent, you can withdraw consent at any time (without affecting the lawfulness of processing carried out prior to the withdrawal).'
                )}
              </li>
            </ul>
            <p>
              {t(
                'To exercise the above rights, please contact us via '
              )}
              <a
                href="/user-agreement#section-12"
                className="text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2 font-medium"
              >
                {t('Contact Information')}
              </a>
              {t(
                '. We will respond to your request within 30 days.'
              )}
            </p>
          </>
        ),
      },
      {
        id: 'section-7',
        num: '7',
        title: t('Minors Protection'),
        icon: Baby,
        content: (
          <>
            <p>
              <strong>7.1</strong>{' '}
              {t(
                'This platform\'s services are intended for adults who can enter into legally binding contracts. We do not knowingly collect personal information from minors under the age of 18.'
              )}
            </p>

            <p>
              <strong>7.2</strong>{' '}
              {t(
                'If you are a parent or guardian of a minor and discover that a minor has provided us with personal information, please contact us immediately. We will delete the relevant data as soon as possible after verification.'
              )}
            </p>

            <p>
              <strong>7.3</strong>{' '}
              {t(
                'If you are a minor between 13 and 18 years of age, please read this policy accompanied by a parent or guardian and obtain their consent before using this platform.'
              )}
            </p>
          </>
        ),
      },
      {
        id: 'section-8',
        num: '8',
        title: t('Third-Party Services'),
        icon: Globe,
        content: (
          <>
            <p>
              {t(
                'This platform may contain links to third-party websites or services, or rely on service components provided by third parties:'
              )}
            </p>
            <ul>
              <li>
                <strong>{t('AI Model Service Providers')}:</strong>{' '}
                {t(
                  'OpenAI, Anthropic, Google, etc. The data you send when calling models is subject to each service provider\'s privacy policy.'
                )}
              </li>
              <li>
                <strong>{t('Payment Service Providers')}:</strong>{' '}
                {t(
                  'Stripe, Yipay, etc. Your payment information is processed directly by these service providers and protected by their privacy policies.'
                )}
              </li>
              <li>
                <strong>{t('CDN & Hosting Services')}:</strong>{' '}
                {t(
                  'Infrastructure service providers such as Cloudflare, Vercel, etc.'
                )}
              </li>
            </ul>
            <p>
              {t(
                'We are not responsible for the privacy practices of third-party websites or services. We recommend that you review the privacy policies of relevant third parties before use.'
              )}
            </p>
          </>
        ),
      },
      {
        id: 'section-9',
        num: '9',
        title: t('Cross-Border Data Transfer'),
        icon: Plane,
        content: (
          <>
            <p>
              <strong>9.1</strong>{' '}
              {t(
                'Your information may be stored and processed on servers outside your country of residence. The data protection laws of these countries/regions may differ from those in your location.'
              )}
            </p>

            <p>
              <strong>9.2</strong>{' '}
              {t(
                'When conducting cross-border data transfers, we will take appropriate safeguards (such as standard contractual clauses) to ensure your data receives protection equivalent to that in your location.'
              )}
            </p>

            <p>
              <strong>9.3</strong>{' '}
              {t(
                'By using this platform, you consent to the cross-border data transfer described in this section.'
              )}
            </p>
          </>
        ),
      },
      {
        id: 'section-10',
        num: '10',
        title: t('Policy Updates'),
        icon: Bell,
        content: (
          <>
            <p>
              <strong>10.1</strong>{' '}
              {t(
                'We may update this privacy policy from time to time. The updated policy will be published on this page and shall take effect upon publication.'
              )}
            </p>

            <p>
              <strong>10.2</strong>{' '}
              {t(
                'For significant changes (such as changes to the purposes of information collection, expansion of sharing scope, etc.), we will notify you in advance through on-site announcements, email, and other means.'
              )}
            </p>

            <p>
              <strong>10.3</strong>{' '}
              {t(
                'We recommend that you review this policy periodically to understand how we protect your information. Continued use of this platform constitutes your agreement to the updated policy.'
              )}
            </p>
          </>
        ),
      },
      {
        id: 'section-11',
        num: '11',
        title: t('Contact Information'),
        icon: Mail,
        content: (
          <>
            <p>
              {t(
                'If you have any questions, comments, or requests regarding this privacy policy or our data processing practices, please contact us through the following methods:'
              )}
            </p>
            <ul>
              <li>
                📧 {t('Email')}: <strong>support@quantumnous.com</strong>
              </li>
              <li>
                🌐 {t('Website')}: {t('Submit via the platform\'s online customer service or feedback channel')}
              </li>
              <li>
                ⏱️ {t('Response Time')}: {t('We will respond to your privacy-related requests within 15 business days')}
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
              {t('Privacy Policy')}
            </h1>
            <p className='mt-3 text-sm text-slate-500 dark:text-slate-400'>
              {t('Last updated: June 13, 2026')}
            </p>
            <div className='mx-auto mt-6 max-w-xl rounded-xl border border-blue-200/80 bg-blue-50/60 p-4 text-left dark:border-blue-800/30 dark:bg-blue-950/30'>
              <p className='text-sm leading-relaxed text-blue-800 dark:text-blue-200'>
                <strong>📋 {t('Summary')}:</strong>{' '}
                {t(
                  'We value your privacy. This policy details how we collect, use, store, and protect your personal information. By using this platform, you confirm that you have read and understood this policy.'
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
                <div className='prose prose-slate max-w-none dark:prose-invert prose-p:leading-relaxed prose-p:text-sm prose-strong:text-slate-900 dark:prose-strong:text-white prose-li:text-sm prose-li:leading-relaxed prose-ul:my-2 prose-ul:list-disc prose-ul:pl-5 prose-h3:text-base prose-h3:font-semibold prose-h3:mt-5 prose-h3:mb-2'>
                  {section.content}
                </div>
              </section>
            ))}

            {/* 结尾提醒 */}
            <div className='rounded-2xl border border-blue-200/60 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 text-center dark:border-blue-800/30 dark:from-blue-950/30 dark:to-indigo-950/30 sm:p-8'>
              <Shield className='mx-auto mb-3 h-8 w-8 text-blue-500' />
              <p className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                {t('If you have any questions about this privacy policy, please feel free to')}{' '}
                <a
                  href="mailto:support@quantumnous.com"
                  className="text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2 font-medium mx-1"
                >
                  {t('contact us')}
                </a>
                {t('.')}
                <br />
                {t('We are here to help.')}
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
