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
import { PublicLayout } from '@/components/layout'
import { PageTransition } from '@/components/page-transition'
import { cn } from '@/lib/utils'
import {
  LoadingSkeleton,
  EmptyState,
  SearchBar,
  CtaBanner,
  ModelCardGrid,
  ModelDetailsDrawer,
} from './components'
import { CATEGORIES, getCategoryLabels } from './constants'
import type { Category } from './constants'
import { useFilters } from './hooks/use-filters'
import { usePricingData } from './hooks/use-pricing-data'

export function Pricing() {
  const { t, i18n } = useTranslation()
  const [selectedModelName, setSelectedModelName] = useState<string | null>(
    null
  )

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
    setSearchInput,
    setCategoryFilter,
    filteredModels,
    clearSearch,
  } = useFilters(models || [])

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
          {/* Header */}
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

            {/* Search bar */}
            <SearchBar
              value={searchInput}
              onChange={setSearchInput}
              onClear={clearSearch}
              placeholder={t(
                'Search model name, provider, endpoint, or tag...'
              )}
              className='mx-auto mt-5 max-w-xl sm:mt-6'
            />
          </header>

          {/* Category pills */}
          <div className='mb-6 flex flex-wrap items-center justify-center gap-2 sm:mb-8'>
            {categories.map((cat) => (
              <button
                key={cat.key}
                type='button'
                onClick={() => setCategoryFilter(cat.key)}
                className={cn(
                  'inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200',
                  'hover:border-primary/50 hover:bg-primary/5',
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

          {/* CTA Banner — guides users based on their state */}
          <CtaBanner className='mb-6 sm:mb-8' />

          {/* Model count indicator */}
          {filteredModels.length > 0 && (
            <p className='text-muted-foreground mb-4 text-center text-xs sm:text-sm'>
              {t('Showing {{count}} models', {
                count: filteredModels.length,
              })}
            </p>
          )}

          {/* Card grid or empty state */}
          {filteredModels.length === 0 ? (
            <EmptyState
              searchQuery={searchInput}
              hasActiveFilters={categoryFilter !== CATEGORIES.ALL}
              onClearFilters={() => setCategoryFilter(CATEGORIES.ALL)}
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
