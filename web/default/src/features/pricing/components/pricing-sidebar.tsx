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
import type { ReactNode } from 'react'
import { ChevronDown, RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  ENDPOINT_TYPES,
  FILTER_ALL,
  QUOTA_TYPES,
  getEndpointTypeLabels,
  getQuotaTypeLabels,
} from '../constants'
import { ModelSeriesFilter } from './pricing-series-filter'
import { APIProtocolFilter } from './pricing-protocol-filter'
import { ContextSliderFilter } from './pricing-context-slider'
import type { PricingModel, PricingVendor } from '../types'

type FilterOption = {
  value: string
  label: string
  count?: number
  suffix?: string
  icon?: ReactNode
}

type FilterSectionProps = {
  title: string
  value: string
  options: FilterOption[]
  onChange: (value: string) => void
  defaultOpen?: boolean
}

export interface PricingSidebarProps {
  quotaTypeFilter: string
  endpointTypeFilter: string
  vendorFilter: string
  groupFilter: string
  tagFilter: string
  seriesFilter: string
  protocolFilter: string
  contextFilter: number
  onQuotaTypeChange: (value: string) => void
  onEndpointTypeChange: (value: string) => void
  onVendorChange: (value: string) => void
  onGroupChange: (value: string) => void
  onTagChange: (value: string) => void
  onSeriesChange: (value: string) => void
  onProtocolChange: (value: string) => void
  onContextChange: (value: number) => void
  vendors: PricingVendor[]
  groups: string[]
  groupRatios?: Record<string, number>
  tags: string[]
  models: PricingModel[]
  hasActiveFilters: boolean
  activeCount: number
  onClearFilters: () => void
  className?: string
}

function countBy(
  models: PricingModel[],
  predicate: (model: PricingModel) => boolean
): number {
  return models.reduce((count, model) => count + (predicate(model) ? 1 : 0), 0)
}

function formatGroupRatio(ratio: number | undefined): string | undefined {
  if (ratio == null) return undefined
  const formatted = Number.isInteger(ratio)
    ? ratio.toString()
    : ratio.toFixed(3).replace(/0+$/, '').replace(/\.$/, '')
  return `x${formatted}`
}

function FilterChip(props: {
  option: FilterOption
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type='button'
      onClick={props.onClick}
      className={cn(
        'group inline-flex max-w-full items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-all',
        props.active
          ? 'border-foreground/30 bg-foreground/5 text-foreground shadow-sm'
          : 'border-border/70 bg-background text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground'
      )}
      title={props.option.label}
    >
      {props.option.icon && (
        <span className='shrink-0'>{props.option.icon}</span>
      )}
      <span className='truncate'>{props.option.label}</span>
      {(props.option.suffix || props.option.count != null) && (
        <span
          className={cn(
            'rounded-md px-1.5 py-0.5 text-[10px]',
            props.active
              ? 'bg-background text-foreground'
              : 'bg-muted text-muted-foreground'
          )}
        >
          {props.option.suffix ?? props.option.count}
        </span>
      )}
    </button>
  )
}

function FilterSection(props: FilterSectionProps) {
  return (
    <Collapsible
      defaultOpen={props.defaultOpen ?? true}
      className='border-border/70 border-b pb-3 last:border-b-0'
    >
      <CollapsibleTrigger className='group flex w-full items-center justify-between py-2.5 text-left'>
        <span className='text-foreground text-sm font-semibold'>
          {props.title}
        </span>
        <ChevronDown className='text-muted-foreground size-4 transition-transform group-data-[panel-open]:rotate-180' />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className='flex flex-wrap gap-1.5'>
          {props.options
            .filter((opt) => opt.value === FILTER_ALL || (opt.count ?? 1) > 0)
            .map((option) => (
              <FilterChip
                key={option.value}
                option={option}
                active={props.value === option.value}
                onClick={() => props.onChange(option.value)}
              />
            ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function PricingSidebar(props: PricingSidebarProps) {
  const { t } = useTranslation()
  const quotaTypeLabels = getQuotaTypeLabels(t)
  const endpointTypeLabels = getEndpointTypeLabels(t)

  const groupOptions: FilterOption[] = [
    {
      value: FILTER_ALL,
      label: t('All Groups'),
    },
    ...props.groups.map((group) => ({
      value: group,
      label: group,
      suffix: formatGroupRatio(props.groupRatios?.[group]),
    })),
  ]

  const quotaOptions: FilterOption[] = [
    {
      value: QUOTA_TYPES.ALL,
      label: quotaTypeLabels[QUOTA_TYPES.ALL],
      count: props.models.length,
    },
    {
      value: QUOTA_TYPES.TOKEN,
      label: quotaTypeLabels[QUOTA_TYPES.TOKEN],
      count: countBy(props.models, (model) => model.quota_type === 0),
    },
    {
      value: QUOTA_TYPES.REQUEST,
      label: quotaTypeLabels[QUOTA_TYPES.REQUEST],
      count: countBy(props.models, (model) => model.quota_type === 1),
    },
  ]

  const endpointOptions: FilterOption[] = [
    {
      value: ENDPOINT_TYPES.ALL,
      label: endpointTypeLabels[ENDPOINT_TYPES.ALL],
      count: props.models.length,
    },
    ...Object.entries(endpointTypeLabels)
      .filter(([value]) => value !== ENDPOINT_TYPES.ALL)
      .map(([value, label]) => ({
        value,
        label,
        count: countBy(
          props.models,
          (model) => model.supported_endpoint_types?.includes(value) ?? false
        ),
      })),
  ]

  return (
    <aside className={cn(props.className)}>
      <div className='mb-2.5 flex items-center justify-between gap-2'>
        <div>
          <h2 className='text-foreground text-sm font-bold'>
            {t('Filter')}
            {props.activeCount > 0 && (
              <span className='ml-1.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary'>
                {props.activeCount}
              </span>
            )}
          </h2>
          <p className='text-muted-foreground mt-1 text-xs'>
            {t('Refine models by provider, group, type, and tags.')}
          </p>
        </div>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={props.onClearFilters}
          disabled={props.activeCount === 0}
          className='h-7 gap-1.5 px-2 text-xs'
        >
          <RotateCcw className='size-3.5' />
          {t('Reset')}
        </Button>
      </div>

      {props.activeCount > 0 && (
        <Badge variant='secondary' className='mb-3'>
          {t('Filters active')}
        </Badge>
      )}

      <div className='space-y-1'>
        {/* Model Series */}
        <Collapsible
          defaultOpen
          className='border-border/70 border-b pb-3 last:border-b-0'
        >
          <CollapsibleTrigger className='group flex w-full items-center justify-between py-2.5 text-left'>
            <span className='text-foreground text-sm font-semibold'>
              {t('Model Series')}
            </span>
            <ChevronDown className='text-muted-foreground size-4 transition-transform group-data-[panel-open]:rotate-180' />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ModelSeriesFilter
              value={props.seriesFilter}
              onChange={props.onSeriesChange}
              models={props.models}
            />
          </CollapsibleContent>
        </Collapsible>

        {/* API Protocol */}
        <Collapsible
          defaultOpen
          className='border-border/70 border-b pb-3 last:border-b-0'
        >
          <CollapsibleTrigger className='group flex w-full items-center justify-between py-2.5 text-left'>
            <span className='text-foreground text-sm font-semibold'>
              {t('API Protocol')}
            </span>
            <ChevronDown className='text-muted-foreground size-4 transition-transform group-data-[panel-open]:rotate-180' />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <APIProtocolFilter
              value={props.protocolFilter}
              onChange={props.onProtocolChange}
              models={props.models}
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Upstream Channel (供应商类型) */}
        <Collapsible
          defaultOpen
          className='border-border/70 border-b pb-3 last:border-b-0'
        >
          <CollapsibleTrigger className='group flex w-full items-center justify-between py-2.5 text-left'>
            <span className='text-foreground text-sm font-semibold'>
              {t('Upstream Channel')}
            </span>
            <ChevronDown className='text-muted-foreground size-4 transition-transform group-data-[panel-open]:rotate-180' />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className='flex flex-wrap gap-1.5'>
              <FilterChip
                option={{
                  value: FILTER_ALL,
                  label: t('All Channels'),
                  count: props.models.length,
                }}
                active={props.vendorFilter === FILTER_ALL}
                onClick={() => props.onVendorChange(FILTER_ALL)}
              />
              {props.vendors.map((vendor) => {
                const count = countBy(
                  props.models,
                  (model) => model.vendor_name === vendor.name
                )
                return (
                  <FilterChip
                    key={vendor.id ?? vendor.name}
                    option={{
                      value: vendor.name,
                      label: vendor.name,
                      count,
                    }}
                    active={props.vendorFilter === vendor.name}
                    onClick={() => props.onVendorChange(vendor.name)}
                  />
                )
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Context Window Slider */}
        <Collapsible
          defaultOpen
          className='border-border/70 border-b pb-3 last:border-b-0'
        >
          <CollapsibleTrigger className='group flex w-full items-center justify-between py-2.5 text-left'>
            <span className='text-foreground text-sm font-semibold'>
              {t('Context Window')}
            </span>
            <ChevronDown className='text-muted-foreground size-4 transition-transform group-data-[panel-open]:rotate-180' />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ContextSliderFilter
              value={props.contextFilter}
              onChange={props.onContextChange}
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Existing sections */}
        <FilterSection
          title={t('Groups')}
          value={props.groupFilter}
          options={groupOptions}
          onChange={props.onGroupChange}
        />
        <FilterSection
          title={t('Pricing Type')}
          value={props.quotaTypeFilter}
          options={quotaOptions}
          onChange={props.onQuotaTypeChange}
          defaultOpen={false}
        />
        <FilterSection
          title={t('Endpoint Type')}
          value={props.endpointTypeFilter}
          options={endpointOptions}
          onChange={props.onEndpointTypeChange}
          defaultOpen={false}
        />
      </div>
    </aside>
  )
}
