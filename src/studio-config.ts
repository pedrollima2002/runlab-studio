export const templates = ['Minimal', 'Performance', 'Clean'] as const
export type Template = typeof templates[number]
export type PreviewMode = 'transparent' | 'full'
export type StickerLayout = 'centered' | 'left' | 'featured'
export type MetricKey = 'distance' | 'duration' | 'pace' | 'heartRate' | 'elevation'
export type AccentColor = 'orange' | 'sky' | 'green' | 'pink'
export type TextColor = 'light' | 'warm' | 'dark' | 'espresso'

export type ActivityData = {
  distance: string
  duration: string
  title: string
  date: string
  heartRate: string
  elevation: string
}

export type MetricVisibility = Record<MetricKey, boolean>

export type Appearance = {
  template: Template
  accentColor: AccentColor
  textColor: TextColor
  layout: StickerLayout
  mode: PreviewMode
  visibility: MetricVisibility
}

export const accentColors: Record<AccentColor, { label: string; value: string }> = {
  orange: { label: 'Laranja RUNLAB', value: '#F97316' },
  sky: { label: 'Azul céu', value: '#38BDF8' },
  green: { label: 'Verde pista', value: '#22C55E' },
  pink: { label: 'Rosa energia', value: '#F43F5E' },
}

export const textColors: Record<TextColor, { label: string; value: string }> = {
  light: { label: 'Branco', value: '#FFFFFF' },
  warm: { label: 'Areia clara', value: '#F5E7D0' },
  dark: { label: 'Grafite', value: '#17100A' },
  espresso: { label: 'Marrom escuro', value: '#3B2A20' },
}

export const compatibleTextColors: Record<Template, TextColor[]> = {
  Minimal: ['light', 'warm'],
  Performance: ['light', 'warm'],
  Clean: ['dark', 'espresso'],
}

export const templateDefaults: Record<Template, Pick<Appearance, 'accentColor' | 'textColor' | 'layout'>> = {
  Minimal: { accentColor: 'orange', textColor: 'light', layout: 'centered' },
  Performance: { accentColor: 'orange', textColor: 'light', layout: 'featured' },
  Clean: { accentColor: 'orange', textColor: 'dark', layout: 'left' },
}

export const defaultVisibility: MetricVisibility = {
  distance: true,
  duration: true,
  pace: true,
  heartRate: true,
  elevation: true,
}

export const defaultAppearance: Appearance = {
  template: 'Performance',
  ...templateDefaults.Performance,
  mode: 'full',
  visibility: defaultVisibility,
}

export function selectTemplate(appearance: Appearance, template: Template): Appearance {
  const compatibleText = compatibleTextColors[template].includes(appearance.textColor)

  return {
    ...appearance,
    template,
    textColor: compatibleText ? appearance.textColor : templateDefaults[template].textColor,
  }
}

export function resetTemplateColors(appearance: Appearance): Appearance {
  const defaults = templateDefaults[appearance.template]
  return { ...appearance, accentColor: defaults.accentColor, textColor: defaults.textColor }
}

export function setMetricVisibility(
  appearance: Appearance,
  metric: MetricKey,
  visible: boolean,
  availableMetrics: MetricKey[],
): { appearance: Appearance; blocked: boolean } {
  if (!visible) {
    const visibleAvailable = availableMetrics.filter((key) => appearance.visibility[key])
    if (visibleAvailable.length === 1 && visibleAvailable[0] === metric) {
      return { appearance, blocked: true }
    }
  }

  return {
    appearance: {
      ...appearance,
      visibility: { ...appearance.visibility, [metric]: visible },
    },
    blocked: false,
  }
}

export function formatActivityDate(value: string): string | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return undefined

  const [, year, month, day] = match
  return `${day}/${month}/${year}`
}
