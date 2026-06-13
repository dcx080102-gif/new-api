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
// TODO: This page contains hardcoded Chinese text mixed with i18n keys that needs full migration (AGENTS.md 3.1).
// Section descriptions should use t() with proper translation keys.
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BookOpen,
  Key,
  Terminal,
  Cpu,
  Coins,
  HelpCircle,
  Rocket,
  Copy,
  Check,
  ArrowUp,
  ChevronRight,
  Zap,
  Globe,
} from 'lucide-react'
import { PublicLayout } from '@/components/layout'
import { cn } from '@/lib/utils'

/* ── 代码块复制按钮 ── */
function CodeBlock({ code, lang = 'bash', t }: { code: string; lang?: string; t: (key: string) => string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <div className='group relative mt-2 overflow-hidden rounded-xl border border-slate-200 bg-slate-950 dark:border-slate-700'>
      <div className='flex items-center justify-between border-b border-slate-800 px-4 py-2'>
        <span className='text-xs text-slate-400'>{lang}</span>
        <button
          type='button'
          onClick={handleCopy}
          className='flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-400 transition-colors hover:bg-slate-800 hover:text-white'
        >
          {copied ? <Check className='h-3 w-3 text-green-400' /> : <Copy className='h-3 w-3' />}
          {copied ? t('Copied') : t('Copy')}
        </button>
      </div>
      <pre className='overflow-x-auto p-4 text-sm leading-relaxed'><code className='text-slate-300'>{code}</code></pre>
    </div>
  )
}

export function Docs() {
  const { t } = useTranslation()
  const [activeSection, setActiveSection] = useState('quickstart')
  const [showBackTop, setShowBackTop] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  /* ── 章节定义 ── */
  const sections = [
    {
      id: 'quickstart',
      num: t('I'),
      title: t('Quick Start'),
      icon: Rocket,
      content: (
        <>
          <p>{t('Just three steps to start calling AI models:')}</p>
          <div className='my-4 grid gap-4 sm:grid-cols-3'>
            {[
              { step: '1', title: t('Register Account'), desc: t('Go to the registration page to create an account and verify your email') },
              { step: '2', title: t('Get API Key'), desc: t('Create an API Key in the console and keep it safe') },
              { step: '3', title: t('Call API'), desc: t('Send your first request using the example code below') },
            ].map((s) => (
              <div key={s.step} className='rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 text-center dark:border-slate-800/60 dark:bg-slate-900/50'>
                <span className='mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 mx-auto dark:bg-blue-900/40 dark:text-blue-300'>{s.step}</span>
                <h4 className='text-sm font-semibold text-slate-900 dark:text-white'>{s.title}</h4>
                <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>{s.desc}</p>
              </div>
            ))}
          </div>
        </>
      ),
    },
    {
      id: 'apikey',
      num: t('II'),
      title: t('API Key Management'),
      icon: Key,
      content: (
        <>
          <p>{t('API Key is the sole credential for accessing this platform. Please keep it safe and never share it with others.')}</p>
          <ul>
            <li>{t('After logging in, go to Console → API Keys')}</li>
            <li>{t('Click "New Key", set name, quota limit, and expiration')}</li>
            <li>{t('The full key is displayed only once after creation, please copy and save it immediately')}</li>
            <li>{t('You can configure IP whitelist for the Key to restrict access sources')}</li>
            <li>{t('Rotate keys regularly to reduce the risk of exposure')}</li>
          </ul>
          <div className='mt-3 rounded-xl border border-amber-200/60 bg-amber-50/50 p-4 dark:border-amber-800/30 dark:bg-amber-950/30'>
            <p className='text-sm text-amber-800 dark:text-amber-200'>
              <strong>{t('⚠️ Security Notice: ')}</strong>{t('A Key is equivalent to your account password. Anyone holding the Key can call the API and consume quota on your behalf.')}
            </p>
          </div>
        </>
      ),
    },
    {
      id: 'apicall',
      num: t('III'),
      title: t('API Calls'),
      icon: Terminal,
      content: (
        <>
          <p>{t('This platform is compatible with the OpenAI API format. You can directly use the official OpenAI SDK.')}</p>

          <h3>{t('Base URL')}</h3>
          <CodeBlock code='https://你的域名/v1' lang='url' t={t} />

          <h3>{t('Authentication')}</h3>
          <p>{t('Include the API Key in the request header:')}</p>
          <CodeBlock code={`Authorization: Bearer sk-你的Key`} lang='http' t={t} />

          <h3>{t('cURL Example')}</h3>
          <CodeBlock code={`curl https://你的域名/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-你的Key" \\
  -d '{
    "model": "gpt-4o",
    "messages": [
      {"role": "user", "content": "你好，请介绍一下你自己"}
    ]
  }'`} lang='bash' t={t} />

          <h3>{t('Python Example')}</h3>
          <CodeBlock code={`from openai import OpenAI

client = OpenAI(
    api_key="sk-你的Key",
    base_url="https://你的域名/v1"
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "user", "content": "你好，请介绍一下你自己"}
    ]
)

print(response.choices[0].message.content)`} lang='python' t={t} />

          <h3>{t('JavaScript Example')}</h3>
          <CodeBlock code={`import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "sk-你的Key",
  baseURL: "https://你的域名/v1",
});

const response = await client.chat.completions.create({
  model: "gpt-4o",
  messages: [
    { role: "user", content: "你好，请介绍一下你自己" }
  ],
});

console.log(response.choices[0].message.content);`} lang='javascript' t={t} />
        </>
      ),
    },
    {
      id: 'models',
      num: t('IV'),
      title: t('Model List'),
      icon: Cpu,
      content: (
        <>
          <p>{t('This platform brings together 40+ mainstream AI models, covering chat, image generation, video, and more. For available models and real-time pricing, please check the ')}<a href='/pricing' className='text-blue-700 hover:text-blue-800 underline underline-offset-2 font-medium'>{t('Pricing')}</a>{t(' page.')}</p>

          <div className='mt-4 grid gap-3 sm:grid-cols-2'>
            {[
              { name: 'GPT-4o', provider: 'OpenAI', desc: t('Multimodal flagship model') },
              { name: 'Claude 3.5 Sonnet', provider: 'Anthropic', desc: t('Strong in coding and reasoning') },
              { name: 'Gemini 2.0 Flash', provider: 'Google', desc: t('Ultra-fast response, high concurrency') },
              { name: 'DeepSeek-V3', provider: 'DeepSeek', desc: t('Cost-effective domestic model') },
              { name: 'Qwen-Max', provider: t('Alibaba Tongyi'), desc: t('Leading Chinese language understanding') },
              { name: 'DALL·E 3', provider: 'OpenAI', desc: t('AI image generation') },
            ].map((m) => (
              <div key={m.name} className='flex items-start gap-3 rounded-xl border border-slate-200/60 bg-white p-4 dark:border-slate-800/60 dark:bg-slate-900/50'>
                <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'>
                  AI
                </div>
                <div>
                  <p className='text-sm font-semibold text-slate-900 dark:text-white'>{m.name}</p>
                  <p className='text-xs text-slate-500 dark:text-slate-400'>{m.provider} · {m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      ),
    },
    {
      id: 'billing',
      num: t('V'),
      title: t('Billing'),
      icon: Coins,
      content: (
        <>
          <p>{t('This platform adopts a prepaid pay-as-you-go model — transparent, flexible, with no hidden fees.')}</p>

          <div className='my-4 grid gap-4 sm:grid-cols-2'>
            <div className='rounded-xl border border-slate-200/60 bg-white p-5 dark:border-slate-800/60 dark:bg-slate-900/50'>
              <h4 className='mb-2 text-sm font-semibold text-slate-900 dark:text-white'>💰 {t('Billing Unit')}</h4>
              <ul className='space-y-1 text-sm text-slate-600 dark:text-slate-400'>
                <li>{t('Charged by Token (input + output)')}</li>
                <li>{t('Different models have different unit prices')}</li>
                <li>{t('Real-time deduction, auto-disable when balance is insufficient')}</li>
              </ul>
            </div>
            <div className='rounded-xl border border-slate-200/60 bg-white p-5 dark:border-slate-800/60 dark:bg-slate-900/50'>
              <h4 className='mb-2 text-sm font-semibold text-slate-900 dark:text-white'>💳 {t('Top-up Methods')}</h4>
              <ul className='space-y-1 text-sm text-slate-600 dark:text-slate-400'>
                <li>{t('Supports Stripe / EasyPay')}</li>
                <li>{t('Top-up credited instantly')}</li>
                <li>{t('Balance does not support withdrawal or refund')}</li>
              </ul>
            </div>
          </div>

          <p className='text-sm text-slate-500 dark:text-slate-400'>
            {t('For detailed pricing, please check the ')}<a href='/pricing' className='text-blue-700 hover:text-blue-800 underline underline-offset-2 font-medium'>{t('Pricing')}</a>{t(' page.')}
          </p>
        </>
      ),
    },
    {
      id: 'faq',
      num: t('VI'),
      title: t('FAQ'),
      icon: HelpCircle,
      content: (
        <>
          <div className='space-y-4'>
            {[
              {
                q: t('How do I get an API Key?'),
                a: t('After logging in, go to "Console → API Keys" and click "New Key" to create one.'),
              },
              {
                q: t('Which models are supported?'),
                a: t('We support GPT-4o, Claude, Gemini, DeepSeek, Qwen and 40+ other models. See the Pricing page for the full list.'),
              },
              {
                q: t('What if my API call fails?'),
                a: t('Check whether the Key is correct, the balance is sufficient, and the network is working. If the problem persists, please contact customer service.'),
              },
              {
                q: t('Is the OpenAI SDK supported?'),
                a: t('Fully compatible. Simply change the base_url to this platform\'s address — no code changes needed.'),
              },
              {
                q: t('How do I top up?'),
                a: t('Go to "Console → Wallet", select the amount and payment method to complete the top-up.'),
              },
              {
                q: t('Is my data secure?'),
                a: t('All data transmission uses TLS encryption. We do not log complete conversation content. See the Privacy Policy for details.'),
              },
            ].map((faq, i) => (
              <div key={i} className='rounded-xl border border-slate-200/60 bg-white p-4 dark:border-slate-800/60 dark:bg-slate-900/50'>
                <p className='text-sm font-semibold text-slate-900 dark:text-white'>Q: {faq.q}</p>
                <p className='mt-1 text-sm text-slate-600 dark:text-slate-400'>{faq.a}</p>
              </div>
            ))}
          </div>
        </>
      ),
    },
    {
      id: 'support',
      num: t('VII'),
      title: t('Technical Support'),
      icon: Globe,
      content: (
        <>
          <p>{t('Having issues? We\'re here to help:')}</p>
          <ul>
            <li>📧 {t('Email Support: ')}<strong>support@quantumnous.com</strong></li>
            <li>💬 {t('Live Chat: Submit via the platform support channel after logging in')}</li>
            <li>📖 GitHub: <a href='https://github.com/QuantumNous/new-api' target='_blank' rel='noopener noreferrer' className='text-blue-700 hover:text-blue-800 underline underline-offset-2 font-medium'>{t('Submit an Issue')}</a></li>
          </ul>
        </>
      ),
    },
  ];

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

    const onScroll = () => setShowBackTop(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      observerRef.current?.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [sections])

  const tocLinks = useMemo(
    () => sections.map((s) => ({ id: s.id, shortLabel: s.title })),
    [sections]
  )

  return (
    <PublicLayout showMainContainer={false}>
      {/* ═══ Hero ═══ */}
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
              <BookOpen className='h-4 w-4' />
              {t('Documentation')}
            </div>
            <h1 className='text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl'>
              {t('Developer Documentation')}
            </h1>
            <p className='mt-4 max-w-xl mx-auto text-base text-slate-500 dark:text-slate-400 leading-relaxed'>
              {t('Quickly integrate AI capabilities into your application. Compatible with OpenAI SDK — no code changes needed, just swap the API address.')}
            </p>
          </div>
        </div>
      </section>

      {/* ═══ 主体 ═══ */}
      <div className='container mx-auto px-4 py-10'>
        <div className='mx-auto flex max-w-6xl gap-10'>
          {/* ── 侧栏目录 ── */}
          <aside className='hidden w-48 shrink-0 lg:block'>
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

          {/* ── 主内容 ── */}
          <div className='min-w-0 flex-1 space-y-8'>
            {sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className='scroll-mt-24 rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md dark:border-slate-800/60 dark:bg-slate-900/50 sm:p-8'
              >
                <h2 className='mb-5 flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white'>
                  <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'>
                    <section.icon className='h-4 w-4' />
                  </span>
                  <span className='mr-2 text-sm font-normal text-slate-400 dark:text-slate-500'>{t('Section {{num}}', { num: section.num })}</span>
                  {section.title}
                </h2>
                <div className='prose prose-slate max-w-none dark:prose-invert prose-p:leading-relaxed prose-p:text-sm prose-strong:text-slate-900 dark:prose-strong:text-white prose-li:text-sm prose-li:leading-relaxed prose-ul:my-2 prose-ul:list-disc prose-ul:pl-5 prose-h3:text-base prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-2'>
                  {section.content}
                </div>
              </section>
            ))}

            {/* 结尾 */}
            <div className='rounded-2xl border border-blue-200/60 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 text-center dark:border-blue-800/30 dark:from-blue-950/30 dark:to-indigo-950/30 sm:p-8'>
              <Zap className='mx-auto mb-3 h-8 w-8 text-blue-500' />
              <p className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                {t('Start building your AI application today!')}
                <br />
                {t('If you have any questions, feel free to ')}<a href='mailto:support@quantumnous.com' className='text-blue-700 hover:text-blue-800 underline underline-offset-2 font-medium'>{t('contact us')}</a>{t('.')}
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
          aria-label={t('Back to Top')}
        >
          <ArrowUp className='h-4 w-4 text-slate-600 dark:text-slate-300' />
        </button>
      )}
    </PublicLayout>
  )
}
