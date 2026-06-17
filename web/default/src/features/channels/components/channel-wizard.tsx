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
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Loader2,
  Search,
  Server,
  KeyRound,
  Settings,
  ListChecks,
  ClipboardCheck,
} from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { getLobeIcon } from '@/lib/lobe-icon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  sideDrawerContentClassName,
  sideDrawerFooterClassName,
  sideDrawerHeaderClassName,
} from '@/components/drawer-layout'
import {
  createChannel,
  getAllModels,
  getGroups,
} from '../api'
import { useChannelMutateForm } from '../hooks/use-channel-mutate-form'
import { channelsQueryKeys, getChannelTypeIcon } from '../lib'
import {
  CHANNEL_STATUS,
  CHANNEL_TYPE_OPTIONS,
  ERROR_MESSAGES,
} from '../constants'
import { useChannels } from './channels-provider'

type ChannelWizardProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type WizardData = {
  type: number
  name: string
  key: string
  base_url: string
  group: string[]
  models: string[]
}

const INITIAL_DATA: WizardData = {
  type: 1,
  name: '',
  key: '',
  base_url: '',
  group: ['default'],
  models: [],
}

const STEPS = [
  { key: 'type', label: 'Select Type', icon: Server },
  { key: 'config', label: 'Configuration', icon: Settings },
  { key: 'models', label: 'Models', icon: ListChecks },
  { key: 'review', label: 'Review', icon: ClipboardCheck },
]

export function ChannelWizard({ open, onOpenChange }: ChannelWizardProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { setOpen: setDialogOpen } = useChannels()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<WizardData>(INITIAL_DATA)
  const [modelSearch, setModelSearch] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset when opened
  useEffect(() => {
    if (open) {
      setStep(0)
      setData(INITIAL_DATA)
      setModelSearch('')
    }
  }, [open])

  // Fetch available models
  const { data: modelsData, isLoading: isLoadingModels } = useQuery({
    queryKey: [...channelsQueryKeys.all, 'wizard-models'],
    queryFn: getAllModels,
    enabled: open,
    staleTime: 60000,
  })

  const availableModels = useMemo(() => {
    if (!modelsData?.success || !modelsData.data) return []
    return modelsData.data.map((m) => String(m.id || m))
  }, [modelsData])

  const filteredModels = useMemo(() => {
    if (!modelSearch) return availableModels
    const q = modelSearch.toLowerCase()
    return availableModels.filter((m) => m.toLowerCase().includes(q))
  }, [availableModels, modelSearch])

  // Fetch groups
  const { data: groupsData } = useQuery({
    queryKey: [...channelsQueryKeys.all, 'wizard-groups'],
    queryFn: getGroups,
    enabled: open,
    staleTime: 60000,
  })

  const groupOptions = useMemo(() => {
    if (!groupsData?.success || !groupsData.data) return []
    return groupsData.data
  }, [groupsData])

  // Build payload and submit
  const handleSubmit = useCallback(async () => {
    if (!data.key.trim()) {
      toast.error(t('Please enter an API key'))
      setStep(1)
      return
    }
    if (!data.name.trim()) {
      toast.error(t('Please enter a channel name'))
      setStep(1)
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        mode: 'single' as const,
        multi_key_mode: 'random' as const,
        batch_add_set_key_prefix_2_name: false,
        channel: {
          type: data.type,
          name: data.name,
          key: data.key,
          base_url: data.base_url || undefined,
          models: data.models.join(','),
          group: data.group.join(','),
          status: CHANNEL_STATUS.ENABLED,
          auto_ban: 1,
          priority: 0,
          weight: 0,
        },
      }

      const response = await createChannel(payload)
      if (response.success) {
        toast.success(t('Channel created successfully'))
        queryClient.invalidateQueries({ queryKey: channelsQueryKeys.lists() })
        onOpenChange(false)
        setDialogOpen(null)
      } else {
        toast.error(response.message || t(ERROR_MESSAGES.CREATE_FAILED))
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || t(ERROR_MESSAGES.CREATE_FAILED)
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }, [data, t, queryClient, onOpenChange, setDialogOpen])

  const updateData = useCallback(
    (partial: Partial<WizardData>) => {
      setData((prev) => ({ ...prev, ...partial }))
    },
    []
  )

  const toggleModel = useCallback(
    (model: string) => {
      setData((prev) => {
        const models = prev.models.includes(model)
          ? prev.models.filter((m) => m !== model)
          : [...prev.models, model]
        return { ...prev, models }
      })
    },
    []
  )

  const handleNext = useCallback(() => {
    if (step === 0 && !data.type) {
      toast.error(t('Please select a channel type'))
      return
    }
    if (step < 3) {
      setStep((s) => s + 1)
    }
  }, [step, data.type, t])

  const handlePrev = useCallback(() => {
    if (step > 0) setStep((s) => s - 1)
  }, [step])

  const selectedTypeLabel = useMemo(() => {
    return (
      CHANNEL_TYPE_OPTIONS.find((o) => o.value === data.type)?.label ||
      'Unknown'
    )
  }, [data.type])

  const selectedTypeIcon = useMemo(
    () => getChannelTypeIcon(data.type),
    [data.type]
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={sideDrawerContentClassName()}>
        <SheetHeader className={sideDrawerHeaderClassName()}>
          <SheetTitle>{t('Add Channel Wizard')}</SheetTitle>
          <SheetDescription>
            {t('Step-by-step guide to add a new channel')}
          </SheetDescription>
        </SheetHeader>

        {/* ── Step Progress Bar ── */}
        <div className='flex items-center gap-1 px-1 py-2'>
          {STEPS.map((s, idx) => {
            const isActive = idx === step
            const isDone = idx < step
            const Icon = s.icon
            return (
              <div
                key={s.key}
                className='flex flex-1 items-center gap-0.5'
                onClick={() => {
                  if (isDone) setStep(idx)
                }}
              >
                {idx > 0 && (
                  <div
                    className={
                      'h-px flex-1 transition-colors ' +
                      (isDone || isActive
                        ? 'bg-primary'
                        : 'bg-muted-foreground/20')
                    }
                  />
                )}
                <div
                  className={
                    'flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium transition-all cursor-pointer ' +
                    (isActive
                      ? 'bg-primary text-primary-foreground'
                      : isDone
                        ? 'bg-primary/10 text-primary hover:bg-primary/20'
                        : 'bg-muted text-muted-foreground')
                  }
                  title={t(s.label)}
                >
                  {isDone ? (
                    <Check className='size-3' />
                  ) : (
                    <Icon className='size-3' />
                  )}
                  <span className='hidden sm:inline'>{t(s.label)}</span>
                </div>
              </div>
            )
          })}
        </div>

        <div className='flex-1 overflow-y-auto py-4'>
          {/* ── Step 0: Select Channel Type ── */}
          {step === 0 && (
            <div className='space-y-4'>
              <h3 className='text-sm font-semibold'>
                {t('Choose a provider type')}
              </h3>
              <p className='text-muted-foreground text-xs'>
                {t(
                  'Select the AI service provider for this channel. This determines the API protocol and default settings.'
                )}
              </p>
              <div className='grid grid-cols-3 gap-2 sm:grid-cols-4'>
                {CHANNEL_TYPE_OPTIONS.map((option) => {
                  const iconName = getChannelTypeIcon(option.value)
                  const isSelected = data.type === option.value
                  return (
                    <button
                      key={option.value}
                      type='button'
                      onClick={() => updateData({ type: option.value })}
                      className={
                        'flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-all text-center ' +
                        (isSelected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border hover:border-primary/30 hover:bg-muted/50')
                      }
                    >
                      <div className='flex size-8 items-center justify-center'>
                        {getLobeIcon(`${iconName}.Color`, 24)}
                      </div>
                      <span className='text-[11px] leading-tight font-medium'>
                        {t(option.label)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Step 1: Basic Configuration ── */}
          {step === 1 && (
            <div className='space-y-5'>
              <h3 className='text-sm font-semibold'>
                {t('Basic Configuration')}
              </h3>

              {/* Selected type indicator */}
              <div className='bg-muted/50 flex items-center gap-2 rounded-lg border px-3 py-2'>
                <span className='text-muted-foreground text-xs'>
                  {t('Provider')}:
                </span>
                <div className='flex items-center gap-1.5'>
                  {getLobeIcon(`${selectedTypeIcon}.Color`, 18)}
                  <span className='text-sm font-medium'>
                    {t(selectedTypeLabel)}
                  </span>
                </div>
              </div>

              {/* Name */}
              <div className='space-y-1.5'>
                <Label htmlFor='wiz-name'>{t('Channel Name *')}</Label>
                <Input
                  id='wiz-name'
                  placeholder={t('e.g. My DeepSeek Channel')}
                  value={data.name}
                  onChange={(e) => updateData({ name: e.target.value })}
                />
                <p className='text-muted-foreground text-xs'>
                  {t('给渠道起个好记的名字，方便自己区分')}
                </p>
              </div>

              {/* API Key */}
              <div className='space-y-1.5'>
                <Label htmlFor='wiz-key'>{t('API Key *')}</Label>
                <Textarea
                  id='wiz-key'
                  placeholder={t('sk-...')}
                  rows={3}
                  value={data.key}
                  onChange={(e) => updateData({ key: e.target.value })}
                />
                <p className='text-muted-foreground text-xs'>
                  {t('从服务商后台获取的密钥（sk-... 开头），用于身份验证')}
                </p>
              </div>

              {/* Base URL */}
              <div className='space-y-1.5'>
                <Label htmlFor='wiz-url'>{t('Base URL')}</Label>
                <Input
                  id='wiz-url'
                  placeholder={t(
                    'Leave empty to use default (recommended)'
                  )}
                  value={data.base_url}
                  onChange={(e) => updateData({ base_url: e.target.value })}
                />
                <p className='text-muted-foreground text-xs'>
                  {t(
                    'API 服务器的地址，一般不用改。只有对接第三方代理或私有部署时才需填写'
                  )}
                </p>
              </div>

              {/* Group */}
              <div className='space-y-1.5'>
                <Label htmlFor='wiz-group'>{t('Groups')}</Label>
                <Select
                  value={data.group[0] || 'default'}
                  onValueChange={(val) => updateData({ group: [val] })}
                >
                  <SelectTrigger id='wiz-group'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {groupOptions.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className='text-muted-foreground text-xs'>
                  {t('指定哪些用户组可以使用此渠道，不填默认所有用户可用')}
                </p>
              </div>
            </div>
          )}

          {/* ── Step 2: Select Models ── */}
          {step === 2 && (
            <div className='space-y-4'>
              <h3 className='text-sm font-semibold'>
                {t('Select Models')}
              </h3>
              <p className='text-muted-foreground text-xs'>
                {t(
                  '勾选该渠道可用的模型，不勾就不会被调用。已勾选的模型才会分配给用户使用'
                )}
              </p>

              {/* Search */}
              <div className='relative'>
                <Search className='text-muted-foreground absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2' />
                <Input
                  placeholder={t('Search models...')}
                  className='pl-8'
                  value={modelSearch}
                  onChange={(e) => setModelSearch(e.target.value)}
                />
              </div>

              {/* Selected count */}
              <div className='text-muted-foreground text-xs'>
                {t('Selected {{count}} models', { count: data.models.length })}
              </div>

              {/* Model list */}
              {isLoadingModels ? (
                <div className='flex items-center gap-2 py-8 justify-center'>
                  <Loader2 className='size-4 animate-spin' />
                  <span className='text-muted-foreground text-sm'>
                    {t('Loading models...')}
                  </span>
                </div>
              ) : (
                <div className='max-h-80 space-y-0.5 overflow-y-auto rounded-lg border'>
                  {filteredModels.length === 0 ? (
                    <div className='text-muted-foreground py-8 text-center text-sm'>
                      {t('No models found')}
                    </div>
                  ) : (
                    filteredModels.map((model) => (
                      <label
                        key={model}
                        className='flex cursor-pointer items-center gap-2.5 px-3 py-2 hover:bg-muted/50 transition-colors'
                      >
                        <Checkbox
                          checked={data.models.includes(model)}
                          onCheckedChange={() => toggleModel(model)}
                        />
                        <span className='text-sm'>{model}</span>
                      </label>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Step 3: Review & Confirm ── */}
          {step === 3 && (
            <div className='space-y-4'>
              <h3 className='text-sm font-semibold'>
                {t('Review & Confirm')}
              </h3>
              <p className='text-muted-foreground text-xs'>
                {t('Please review the channel configuration before submitting')}
              </p>

              <div className='space-y-3 rounded-lg border p-4'>
                {/* Type */}
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground text-xs'>
                    {t('Provider Type')}
                  </span>
                  <div className='flex items-center gap-1.5'>
                    {getLobeIcon(`${selectedTypeIcon}.Color`, 16)}
                    <span className='text-sm font-medium'>
                      {t(selectedTypeLabel)}
                    </span>
                  </div>
                </div>

                <hr className='border-border/40' />

                {/* Name */}
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground text-xs'>
                    {t('Channel Name')}
                  </span>
                  <span className='text-sm font-medium'>
                    {data.name || '-'}
                  </span>
                </div>

                <hr className='border-border/40' />

                {/* Key */}
                <div className='flex items-start justify-between gap-3'>
                  <span className='text-muted-foreground text-xs shrink-0'>
                    {t('API Key')}
                  </span>
                  <span className='text-sm font-medium text-right break-all max-w-[70%]'>
                    {data.key
                      ? data.key.length > 30
                        ? `${data.key.slice(0, 15)}...${data.key.slice(-8)}`
                        : data.key
                      : '-'}
                  </span>
                </div>

                <hr className='border-border/40' />

                {/* Base URL */}
                <div className='flex items-start justify-between gap-3'>
                  <span className='text-muted-foreground text-xs shrink-0'>
                    {t('Base URL')}
                  </span>
                  <span className='text-sm text-right break-all max-w-[70%]'>
                    {data.base_url || t('(using default)')}
                  </span>
                </div>

                <hr className='border-border/40' />

                {/* Group */}
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground text-xs'>
                    {t('Groups')}
                  </span>
                  <span className='text-sm font-medium'>
                    {data.group.join(', ') || 'default'}
                  </span>
                </div>

                <hr className='border-border/40' />

                {/* Models */}
                <div>
                  <div className='flex items-center justify-between mb-1.5'>
                    <span className='text-muted-foreground text-xs'>
                      {t('Models')}
                    </span>
                    <span className='text-xs text-muted-foreground'>
                      {data.models.length} {t('selected')}
                    </span>
                  </div>
                  {data.models.length > 0 ? (
                    <div className='flex flex-wrap gap-1'>
                      {data.models.map((m) => (
                        <span
                          key={m}
                          className='bg-muted rounded px-1.5 py-0.5 text-[11px]'
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className='text-muted-foreground text-xs'>
                      {t('No models selected (channel will have no models)')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer Navigation ── */}
        <SheetFooter className={sideDrawerFooterClassName()}>
          {step > 0 && (
            <Button variant='outline' onClick={handlePrev} disabled={isSubmitting}>
              <ArrowLeft className='mr-1.5 size-3.5' />
              {t('Previous')}
            </Button>
          )}
          <div className='flex-1' />
          {step < 3 ? (
            <Button onClick={handleNext}>
              {t('Next')}
              <ArrowRight className='ml-1.5 size-3.5' />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className='mr-1.5 size-3.5 animate-spin' />
                  {t('Creating...')}
                </>
              ) : (
                <>
                  <Check className='mr-1.5 size-3.5' />
                  {t('Create Channel')}
                </>
              )}
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
