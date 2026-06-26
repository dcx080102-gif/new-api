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
/**
 * Home page constants
 * All hardcoded data for home page sections
 */
import { type TFunction } from 'i18next'

// Layout - Main base classes
export const MAIN_BASE_CLASSES = 'bg-background text-foreground w-full'

// Hero section - AI Applications (Left side)
export const AI_APPLICATIONS = [
  'LobeHub.Color',
  'Dify.Color',
  'OpenWebUI',
  'Cline',
] as const

// Hero section - AI Models (Right side)
export const AI_MODELS = [
  'Qwen.Color',
  'DeepSeek.Color',
  'Doubao.Color',
  'OpenAI',
  'Claude.Color',
  'Gemini.Color',
] as const

// Hero section - Gateway Features
export const GATEWAY_FEATURES = [
  'Cost Tracking',
  'Model Access',
  'Guardrails',
  'Observability',
  'Budgets',
  'Load Balancing',
  'Rate Limiting',
  'Token Mgmt',
  'Prompt Caching',
  'Pass-Through',
] as const

// Stats section - Default statistics
export const DEFAULT_STATS = [
  {
    value: '76',
    suffix: '+',
    description: 'available models',
  },
  {
    value: '12',
    suffix: '+',
    description: 'providers connected',
  },
  {
    value: '100',
    suffix: '+',
    description: 'compatible API routes',
  },
  {
    value: '99.9',
    suffix: '%',
    description: 'uptime guarantee',
  },
] as const

// Why otter Link section — advantage cards
export const WHY_OTTER_CARDS = [
  {
    icon: 'Zap',
    title: 'Millisecond Latency',
    description: 'Hong Kong BGP nodes with mainland China direct connect under 150ms. No more overseas proxy lag.',
  },
  {
    icon: 'Eye',
    title: 'Transparent Pricing',
    description: 'Upstream 1:1 top-up, zero hidden markup. Every model price is publicly verifiable in real time.',
  },
  {
    icon: 'Shield',
    title: 'Zero Data Retention',
    description: 'Requests are never logged, trained on, or exported. Full HTTPS encryption for enterprise compliance.',
  },
  {
    icon: 'Plug',
    title: 'One-Line Migration',
    description: 'OpenAI SDK compatible. Change one base_url and you are done — zero refactoring cost.',
  },
  {
    icon: 'BarChart3',
    title: 'Real-Time Billing',
    description: 'T+0 billing sync. Every single credit is tracked and auditable in real time.',
  },
  {
    icon: 'BadgeCheck',
    title: 'Verified Model Authenticity',
    description: 'Every upstream channel is individually verified — identity checks, output quality comparison, knowledge cutoff validation.',
  },
] as const

// Model Capability section — capability cards
export const MODEL_CAPABILITIES = [
  {
    icon: 'MessagesSquare',
    title: 'Text & Chat',
    models: 'GPT-5.5, Claude Opus 4.7, DeepSeek V4, Gemini 3.1, Qwen 3, Llama 4, Grok 4, Mistral Large',
    count: '76+',
  },
  {
    icon: 'Image',
    title: 'Image Generation',
    models: 'DALL·E 4, Midjourney V7, Stable Diffusion 3.5, FLUX.1 Pro, Imagen 3, Playground v3',
    count: '15+',
  },
  {
    icon: 'Mic',
    title: 'Voice & Speech',
    models: 'Whisper large-v3, ElevenLabs, Azure TTS, MiniMax TTS, OpenAI TTS, Fish Audio',
    count: '12+',
  },
  {
    icon: 'Video',
    title: 'Video Generation',
    models: 'Kling 2.0, Sora, Vidu, Runway Gen-4, Pika 2.0, Luma Dream Machine',
    count: '8+',
  },
] as const

// Use Cases section — scenario cards
export const USE_CASES = [
  {
    emoji: '👨‍💻',
    title: 'Claude Code / Codex Users',
    description: 'The best companion for coding agents. Low latency, high availability, and battle-tested with Claude Code, Codex CLI, and Cursor.',
  },
  {
    emoji: '🏢',
    title: 'SaaS Product Integration',
    description: 'Inject AI capabilities into your product fast. Smart customer support, document summarization, data analysis — ship within a week.',
  },
  {
    emoji: '🚀',
    title: 'Indie Developers',
    description: 'No GPU cluster required. Pay-as-you-go, low entry barrier. From MVP to scale, costs grow with your business.',
  },
  {
    emoji: '🎓',
    title: 'AI Learning & Research',
    description: 'Access global mainstream models at lower cost. Supports academic research, AI coursework, and scientific experiments.',
  },
] as const

// FAQ section — Q&A pairs
export const FAQ_ITEMS = [
  {
    q: "What's the difference between otter Link and official APIs?",
    a: "With otter Link, you don't need an overseas credit card, don't need to deal with network restrictions, and don't need to register with multiple providers separately. One API key, one base_url, recharge via Alipay/WeChat — you get access to the world's best AI models. We handle all the infrastructure headaches for you.",
  },
  {
    q: 'Are the models genuine? Will outputs be degraded?',
    a: "Every upstream channel we connect goes through individual verification — model identity checks, output quality comparison, and knowledge cutoff validation. We commit to no model swapping, no output degradation, and no impersonation. See our documentation for the full verification methodology.",
  },
  {
    q: 'Is my data safe? Do you store my requests?',
    a: 'Full end-to-end HTTPS encryption. Requests are never logged, never used for training, and never leave our infrastructure boundary. We are a pure conduit — your data passes through, it does not stay.',
  },
  {
    q: 'Why are your prices lower than official?',
    a: "We reduce costs through enterprise bulk purchasing and channel optimization. Upstream is 1:1 top-up — we don't add markup on resale. Our profit comes from volume, not from padding the unit price.",
  },
  {
    q: 'Will my balance expire?',
    a: 'No. Your balance never expires. Top up as much or as little as you need, with no forced subscription.',
  },
  {
    q: 'What payment methods do you support?',
    a: 'We currently support WeChat Pay and Alipay. More payment methods are being added over time.',
  },
] as const

// Hero section - Platform stats bar
export const HERO_STATS = [
  { value: '76+', label: 'available models' },
  { value: '12', label: 'providers connected' },
  { value: 'T+0', label: 'real-time billing' },
  { value: '99.9%', label: 'uptime guarantee' },
] as const

// Brand wall - Model provider logos
export const BRAND_LOGOS = [
  'OpenAI',
  'Claude',
  'Gemini',
  'DeepSeek',
  'Qwen',
  'Llama',
  'Grok',
  'Mistral',
  'Kimi',
  'MiniMax',
  'GLM',
  'Stable Diffusion',
] as const

// Features section - Default features
export const DEFAULT_FEATURES = [
  {
    title: 'Lightning Fast',
    description:
      'Optimized network architecture ensures millisecond response times',
    iconName: 'Zap',
  },
  {
    title: 'Secure & Reliable',
    description:
      'Enterprise-grade security with comprehensive permission management',
    iconName: 'Shield',
  },
  {
    title: 'Global Coverage',
    description: 'Multi-region deployment for stable global access',
    iconName: 'Globe',
  },
  {
    title: 'Developer Friendly',
    description: 'Compatible API routes for common AI application workflows',
    iconName: 'Code',
  },
  {
    title: 'High Performance',
    description: 'Support for high concurrency with automatic load balancing',
    iconName: 'Gauge',
  },
  {
    title: 'Transparent Billing',
    description: 'Pay-as-you-go with real-time usage monitoring',
    iconName: 'DollarSign',
  },
  {
    title: 'Team Collaboration',
    description: 'Multi-user management with flexible permission allocation',
    iconName: 'Users',
  },
  {
    title: 'Open Source',
    description: 'Community driven, self-hosted, and extensible',
    iconName: 'HeartHandshake',
  },
] as const

export function getGatewayFeatures(t: TFunction) {
  return GATEWAY_FEATURES.map((feature) => t(feature))
}

export function getDefaultStats(t: TFunction) {
  return DEFAULT_STATS.map((stat) => ({
    ...stat,
    description: stat.description ? t(stat.description) : undefined,
  }))
}

export function getDefaultFeatures(t: TFunction) {
  return DEFAULT_FEATURES.map((feature) => ({
    ...feature,
    title: t(feature.title),
    description: t(feature.description),
  }))
}

// Footer — custom column links for the homepage
export const FOOTER_COLUMNS = [
  {
    title: 'footer.home.models.title',
    links: [
      { text: 'footer.home.models.pricing', href: '/pricing' },
      { text: 'footer.home.models.browse', href: '/rankings' },
    ],
  },
  {
    title: 'footer.home.resources.title',
    links: [
      { text: 'footer.home.resources.docs', href: '/docs' },
      { text: 'footer.home.resources.faq', href: '/about' },
    ],
  },
  {
    title: 'footer.home.company.title',
    links: [
      { text: 'footer.home.company.about', href: '/about' },
      { text: 'footer.home.company.referral', href: '/about' },
      { text: 'footer.home.company.contact', href: '/about' },
    ],
  },
] as const
