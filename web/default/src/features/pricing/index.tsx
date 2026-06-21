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
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SlidersHorizontal } from 'lucide-react'
import { PublicLayout } from '@/components/layout'
import { PageTransition } from '@/components/page-transition'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import {
  LoadingSkeleton,
  EmptyState,
  SearchBar,
  CtaBanner,
  ModelCardGrid,
  ModelDetailsDrawer,
  PricingSidebar,
  QuickFilterPills,
} from './components'
import { CATEGORIES, EXCLUDED_GROUPS, getCategoryLabels } from './constants'
import type { Category } from './constants'
import { useFilters } from './hooks/use-filters'
import { usePricingData } from './hooks/use-pricing-data'

export function Pricing() {
  const { t, i18n } = useTranslation()
  const [selectedModelName, setSelectedModelName] = useState<string | null>(
    null
  )
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const {
    models,
    vendors,
    groupRatio,
    usableGroup,
    endpointMap,
    autoGroups,
    isLoading,
    priceRate,
    usdExchangeRate,
  } = usePricingData()

  const {
    searchInput,
    categoryFilter,
    tokenUnit,
    viewMode,
    showRechargePrice,
    vendorFilter,
    groupFilter,
    quotaTypeFilter,
    endpointTypeFilter,
    tagFilter,
    seriesFilter,
    protocolFilter,
    contextFilter,
    quickFilter,
    setSearchInput,
    setCategoryFilter,
    setVendorFilter,
    setGroupFilter,
    setQuotaTypeFilter,
    setEndpointTypeFilter,
    setTagFilter,
    setSeriesFilter,
    setProtocolFilter,
    setContextFilter,
    setQuickFilter,
    filteredModels,
    hasActiveFilters,
    availableTags,
    clearFilters,
    clearSearch,
  } = useFilters(models || [])

  // Derive groups from groupRatio keys, excluding empty/auto
  const groups = useMemo(
    () =>
      Object.keys(groupRatio || {}).filter(
        (g) => !EXCLUDED_GROUPS.includes(g)
      ),
    [groupRatio]
  )

  const handleModelClick = useCallback((modelName: string) => {
    setSelectedModelName(modelName)
  }, [])

  const selectedModel = useMemo(
    () =>
      selectedModelName
        ? (models || []).find(
            (model) => model.model_name === selectedModelName
          ) || null
        : null,
    [models, selectedModelName]
  )

  const categoryLabels = useMemo(
    () => getCategoryLabels(t),
    [t, i18n.language]
  )

  const categories: { key: Category; label: string }[] = [
    { key: CATEGORIES.ALL, label: categoryLabels[CATEGORIES.ALL] },
    { key: CATEGORIES.TEXT, label: categoryLabels[CATEGORIES.TEXT] },
    { key: CATEGORIES.IMAGE, label: categoryLabels[CATEGORIES.IMAGE] },
    { key: CATEGORIES.AUDIO, label: categoryLabels[CATEGORIES.AUDIO] },
    { key: CATEGORIES.VIDEO, label: categoryLabels[CATEGORIES.VIDEO] },
  ]

  // ---- sidebar element (reused in desktop and mobile) ----
  const sidebarElement = (
    <PricingSidebar
      quotaTypeFilter={quotaTypeFilter}
      endpointTypeFilter={endpointTypeFilter}
      vendorFilter={vendorFilter}
      groupFilter={groupFilter}
      tagFilter={tagFilter}
      seriesFilter={seriesFilter}
      protocolFilter={protocolFilter}
      contextFilter={contextFilter}
      onQuotaTypeChange={setQuotaTypeFilter}
      onEndpointTypeChange={setEndpointTypeFilter}
      onVendorChange={setVendorFilter}
      onGroupChange={setGroupFilter}
      onTagChange={setTagFilter}
      onSeriesChange={setSeriesFilter}
      onProtocolChange={setProtocolFilter}
      onContextChange={setContextFilter}
      vendors={vendors}
      groups={groups}
      groupRatios={groupRatio || {}}
      tags={availableTags}
      models={models || []}
      hasActiveFilters={hasActiveFilters}
      onClearFilters={clearFilters}
    />
  )

  // ---- category pills (modality filter, shared) ----
  const modalityPills = (
    <div className='flex flex-wrap gap-1.5'>
      {categories.map((cat) => (
        <button
          key={cat.key}
          type='button'
          onClick={() => setCategoryFilter(cat.key)}
          className={cn(
            'inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium transition-all duration-200',
            'hover:border-primary/40 hover:bg-primary/5',
            'focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-none',
            categoryFilter === cat.key
              ? 'border-primary/40 bg-primary/10 text-primary dark:bg-primary/15'
              : 'border-border/60 text-muted-foreground'
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )

  // ---- loading state ----
  if (isLoading) {
    return (
      <PublicLayout showMainContainer={false}>
        <div className='mx-auto w-full max-w-[1400px] px-4 pt-16 pb-8 sm:px-6 sm:pt-20 sm:pb-10'>
          <LoadingSkeleton viewMode={viewMode} />
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout showMainContainer={false}>
      <div className='relative'>
        {/* Background glow effect */}
        <div
          aria-hidden
          className='pointer-events-none absolute inset-x-0 top-0 h-[600px] opacity-20 dark:opacity-[0.10]'
          style={{
            background: [
              'radial-gradient(ellipse 60% 50% at 20% 20%, oklch(0.72 0.18 250 / 80%) 0%, transparent 70%)',
              'radial-gradient(ellipse 50% 40% at 80% 15%, oklch(0.65 0.15 200 / 60%) 0%, transparent 70%)',
              'radial-gradient(ellipse 40% 35% at 50% 70%, oklch(0.70 0.12 280 / 40%) 0%, transparent 70%)',
            ].join(', '),
            maskImage:
              'linear-gradient(to bottom, black 40%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, black 40%, transparent 100%)',
          }}
        />

        <PageTransition className='relative mx-auto w-full max-w-[1400px] px-4 pt-16 pb-8 sm:px-6 sm:pt-20 sm:pb-10'>
          {/* Header — full width */}
          <header className='mx-auto mb-8 max-w-3xl pt-5 text-center sm:mb-10 sm:pt-10'>
            <h1 className='text-[clamp(2rem,5.5vw,3.5rem)] leading-[1.15] font-bold tracking-tight'>
              {t('Model Square')}
            </h1>
            <p className='text-muted-foreground/80 mt-3 text-sm sm:mt-4 sm:text-base'>
              {t(
                'This site currently has {{count}} models enabled',
                {
                  count: models?.length || 0,
                }
              )}
            </p>
            <p className='text-muted-foreground/60 mx-auto mt-2 max-w-2xl text-xs leading-relaxed sm:text-sm'>
              {t(
                'Discover curated AI models, compare pricing and capabilities, and choose the right model for every scenario.'
              )}
            </p>
          </header>

          {/* Mobile filter trigger */}
          <div className='lg:hidden mb-4'>
            <Sheet
              open={mobileSidebarOpen}
              onOpenChange={setMobileSidebarOpen}
            >
              <SheetTrigger className='inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium shadow-xs transition-[color,box-shadow] outline-none hover:bg-accent hover:text-accent-foreground min-h-[44px] w-full'>
                <SlidersHorizontal className='size-4' />
                {t('Filters')}
                {hasActiveFilters && (
                  <span className='ml-1 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] text-primary'>
                    {t('Active')}
                  </span>
                )}
              </SheetTrigger>
              <SheetContent side='left' className='w-80 p-0'>
                <SheetHeader className='border-b px-4 py-3'>
                  <SheetTitle>{t('Filters')}</SheetTitle>
                </SheetHeader>
                <div className='flex-1 overflow-y-auto px-4 py-3 space-y-4'>
                  {/* Modality filter in mobile sheet */}
                  <div>
                    <h3 className='text-sm font-semibold mb-2.5'>
                      {t('Modality')}
                    </h3>
                    {modalityPills}
                  </div>
                  {sidebarElement}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Two-column layout */}
          <div className='flex gap-6'>
            {/* Desktop left sidebar — sticky */}
            <aside className='hidden lg:block w-64 shrink-0'>
              <div className='sticky top-[72px] space-y-4'>
                {/* Modality filter (category pills) */}
                <div className='rounded-xl border p-3'>
                  <h3 className='text-sm font-semibold mb-2.5'>
                    {t('Modality')}
                  </h3>
                  {modalityPills}
                </div>
                {sidebarElement}
              </div>
            </aside>

            {/* Right content area */}
            <div className='flex-1 min-w-0'>
              {/* ── Unified search + quick filter bar (sticky) ── */}
              <div className='sticky top-[72px] z-20 -mx-2 px-2 pt-2 pb-3 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80'>
                <div className='rounded-xl border bg-card p-3 shadow-sm overflow-visible'>
                  {/* Row 1: Search + count */}
                  <div className='flex items-center gap-3'>
                    <SearchBar
                      value={searchInput}
                      onChange={setSearchInput}
                      onClear={clearSearch}
                      placeholder={t('搜索模型名称、供应商、端点或标签...')}
                      className='flex-1'
                    />
                    <p className='text-muted-foreground shrink-0 text-xs sm:text-sm whitespace-nowrap'>
                      {t('{{count}} 个模型', { count: filteredModels.length })}
                    </p>
                  </div>
                  {/* Row 2: Quick filter pills */}
                  <div className='mt-2.5'>
                    <QuickFilterPills
                      value={quickFilter}
                      onChange={setQuickFilter}
                    />
                  </div>
                </div>
              </div>

              {/* Card grid or empty state */}
              {filteredModels.length === 0 ? (
                <EmptyState
                  searchQuery={searchInput}
                  hasActiveFilters={
                    categoryFilter !== CATEGORIES.ALL || hasActiveFilters
                  }
                  onClearFilters={() => {
                    setCategoryFilter(CATEGORIES.ALL)
                    clearFilters()
                  }}
                />
              ) : (
                <ModelCardGrid
                  models={filteredModels}
                  onModelClick={handleModelClick}
                  priceRate={priceRate}
                  usdExchangeRate={usdExchangeRate}
                  tokenUnit={tokenUnit}
                  showRechargePrice={showRechargePrice}
                />
              )}

              <CtaBanner className='mt-6 sm:mt-8' />
            </div>
          </div>

          {/* Model details drawer */}
          {selectedModel && (
            <ModelDetailsDrawer
              open={Boolean(selectedModel)}
              onOpenChange={(open) => {
                if (!open) setSelectedModelName(null)
              }}
              model={selectedModel}
              groupRatio={groupRatio || {}}
              usableGroup={usableGroup || {}}
              endpointMap={
                (endpointMap as Record<
                  string,
                  { path?: string; method?: string }
                >) || {}
              }
              autoGroups={autoGroups || []}
              priceRate={priceRate ?? 1}
              usdExchangeRate={usdExchangeRate ?? 1}
              tokenUnit={tokenUnit}
              showRechargePrice={showRechargePrice}
            />
          )}
        </PageTransition>
      </div>
    </PublicLayout>
  )
}
