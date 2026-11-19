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

export type ImportedActivityReference = {
  format: 'fit' | 'tcx'
  durationBasis: 'timer' | 'elapsed'
  distanceMeters: number
  durationSeconds: number
  paceSecondsPerKilometer: number
  averageHeartRateBpm: number | null
  maximumHeartRateBpm: number | null
  ascentMeters: number | null
  descentMeters: number | null
  startedAt: string | null
  original: ActivityData
}

export type ActivityProvenance =
  | { kind: 'manual' }
  | { kind: 'imported'; edited: boolean; reference: ImportedActivityReference }

export type MetricVisibility = Record<MetricKey, boolean>

export type Appearance = {
  template: Template
  accentColor: AccentColor
  textColor: TextColor
  layout: StickerLayout
  mode: PreviewMode
  visibility: MetricVisibility
}

export type RouteAppearance = {
  color: string
  thickness: number
  scale: number
  offsetX: number
  offsetY: number
  visible: boolean
  showMarkers: boolean
  privacyTrimMeters: 0 | 100 | 200 | 500
}

export type EditorState = {
  activity: ActivityData
  appearance: Appearance
  routeAppearance: RouteAppearance
  provenance: ActivityProvenance
}

export type EditorHistory = {
  past: EditorState[]
  present: EditorState
  future: EditorState[]
  activeGroup: string | null
}

export type HistoryAction =
  | { type: 'update'; next: EditorState; group?: string }
  | { type: 'end-group' }
  | { type: 'undo' }
  | { type: 'redo' }

export type DraftParseResult =
  | { ok: true; state: EditorState }
  | { ok: false; reason: string }

export const DRAFT_STORAGE_KEY = 'runlab-studio:draft'
export const DRAFT_VERSION = 3
export const HISTORY_LIMIT = 50

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

export const defaultRouteAppearance: RouteAppearance = {
  color: '#F97316',
  thickness: 4,
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  visible: true,
  showMarkers: true,
  privacyTrimMeters: 0,
}

export const defaultActivity: ActivityData = {
  distance: '10,00',
  duration: '54:40',
  title: 'Corrida de domingo',
  date: '2026-11-15',
  heartRate: '158',
  elevation: '84',
}

export function createDefaultEditorState(): EditorState {
  return {
    activity: { ...defaultActivity },
    appearance: {
      ...defaultAppearance,
      visibility: { ...defaultVisibility },
    },
    routeAppearance: { ...defaultRouteAppearance },
    provenance: { kind: 'manual' },
  }
}

export function createEmptyEditorState(): EditorState {
  const state = createDefaultEditorState()
  return {
    ...state,
    activity: { distance: '', duration: '', title: '', date: '', heartRate: '', elevation: '' },
  }
}

export function createEditorHistory(initial = createDefaultEditorState()): EditorHistory {
  return { past: [], present: initial, future: [], activeGroup: null }
}

function editorStatesEqual(first: EditorState, second: EditorState): boolean {
  return JSON.stringify(first) === JSON.stringify(second)
}

export function editorHistoryReducer(history: EditorHistory, action: HistoryAction): EditorHistory {
  if (action.type === 'end-group') {
    return history.activeGroup === null ? history : { ...history, activeGroup: null }
  }

  if (action.type === 'undo') {
    const previous = history.past.at(-1)
    if (!previous) return { ...history, activeGroup: null }

    return {
      past: history.past.slice(0, -1),
      present: previous,
      future: [history.present, ...history.future].slice(0, HISTORY_LIMIT),
      activeGroup: null,
    }
  }

  if (action.type === 'redo') {
    const [next, ...remaining] = history.future
    if (!next) return { ...history, activeGroup: null }

    return {
      past: [...history.past, history.present].slice(-HISTORY_LIMIT),
      present: next,
      future: remaining,
      activeGroup: null,
    }
  }

  if (editorStatesEqual(history.present, action.next)) return history

  const continuesGroup = Boolean(action.group && action.group === history.activeGroup)
  return {
    past: continuesGroup ? history.past : [...history.past, history.present].slice(-HISTORY_LIMIT),
    present: action.next,
    future: [],
    activeGroup: action.group ?? null,
  }
}

export function restoreDefaultAppearance(state: EditorState): EditorState {
  return { ...state, appearance: createDefaultEditorState().appearance }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isShortString(value: unknown, maximum: number): value is string {
  return typeof value === 'string' && value.length <= maximum
}

function isActivityData(value: unknown): value is ActivityData {
  if (!isRecord(value)) return false
  return isShortString(value.distance, 32)
    && isShortString(value.duration, 32)
    && isShortString(value.title, 48)
    && isShortString(value.date, 10)
    && isShortString(value.heartRate, 32)
    && isShortString(value.elevation, 32)
}

function isAppearance(value: unknown): value is Appearance {
  if (!isRecord(value) || !isRecord(value.visibility)) return false

  const visibility = value.visibility
  const metricKeys: MetricKey[] = ['distance', 'duration', 'pace', 'heartRate', 'elevation']
  return templates.includes(value.template as Template)
    && Object.hasOwn(accentColors, value.accentColor as PropertyKey)
    && Object.hasOwn(textColors, value.textColor as PropertyKey)
    && ['centered', 'left', 'featured'].includes(value.layout as string)
    && ['transparent', 'full'].includes(value.mode as string)
    && metricKeys.every((key) => typeof visibility[key] === 'boolean')
}

function isRouteAppearance(value: unknown): value is RouteAppearance {
  if (!isRecord(value)) return false
  return typeof value.color === 'string' && /^#[0-9a-f]{6}$/i.test(value.color)
    && typeof value.thickness === 'number' && Number.isFinite(value.thickness) && value.thickness >= 1 && value.thickness <= 12
    && typeof value.scale === 'number' && Number.isFinite(value.scale) && value.scale >= .5 && value.scale <= 1.6
    && typeof value.offsetX === 'number' && Number.isFinite(value.offsetX) && value.offsetX >= -80 && value.offsetX <= 80
    && typeof value.offsetY === 'number' && Number.isFinite(value.offsetY) && value.offsetY >= -80 && value.offsetY <= 80
    && typeof value.visible === 'boolean' && typeof value.showMarkers === 'boolean'
    && [0, 100, 200, 500].includes(value.privacyTrimMeters as number)
}

function isNullableFiniteNumber(value: unknown): value is number | null {
  return value === null || (typeof value === 'number' && Number.isFinite(value))
}

function isProvenance(value: unknown): value is ActivityProvenance {
  if (!isRecord(value) || (value.kind !== 'manual' && value.kind !== 'imported')) return false
  if (value.kind === 'manual') return true
  const reference = value.reference
  return typeof value.edited === 'boolean'
    && isRecord(reference)
    && (reference.format === 'fit' || reference.format === 'tcx')
    && (reference.durationBasis === 'timer' || reference.durationBasis === 'elapsed')
    && typeof reference.distanceMeters === 'number' && Number.isFinite(reference.distanceMeters) && reference.distanceMeters > 0
    && typeof reference.durationSeconds === 'number' && Number.isFinite(reference.durationSeconds) && reference.durationSeconds > 0
    && typeof reference.paceSecondsPerKilometer === 'number' && Number.isFinite(reference.paceSecondsPerKilometer) && reference.paceSecondsPerKilometer > 0
    && isNullableFiniteNumber(reference.averageHeartRateBpm)
    && isNullableFiniteNumber(reference.maximumHeartRateBpm)
    && isNullableFiniteNumber(reference.ascentMeters)
    && isNullableFiniteNumber(reference.descentMeters)
    && (reference.startedAt === null || isShortString(reference.startedAt, 40))
    && isActivityData(reference.original)
}

function isEditorState(value: unknown): value is EditorState {
  if (!isRecord(value) || !isActivityData(value.activity) || !isAppearance(value.appearance) || !isRouteAppearance(value.routeAppearance) || !isProvenance(value.provenance)) return false

  const { activity, appearance } = value
  return appearance.visibility.distance
    || appearance.visibility.duration
    || appearance.visibility.pace
    || (appearance.visibility.heartRate && activity.heartRate.trim() !== '')
    || (appearance.visibility.elevation && activity.elevation.trim() !== '')
}

export function serializeDraft(state: EditorState): string {
  return JSON.stringify({ version: DRAFT_VERSION, editor: state })
}

export function parseDraft(raw: string): DraftParseResult {
  if (raw.length > 20_000) return { ok: false, reason: 'O rascunho salvo excede o tamanho permitido.' }

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed) || ![1, 2, DRAFT_VERSION].includes(parsed.version as number)) {
      return { ok: false, reason: 'A versão do rascunho salvo não é compatível.' }
    }
    const editor = isRecord(parsed.editor)
      ? {
          ...parsed.editor,
          ...(parsed.version === 1 ? { provenance: { kind: 'manual' as const } } : {}),
          ...(parsed.version === DRAFT_VERSION ? {} : { routeAppearance: { ...defaultRouteAppearance } }),
        }
      : parsed.editor
    if (!isEditorState(editor)) {
      return { ok: false, reason: 'O rascunho salvo contém dados inválidos.' }
    }
    return { ok: true, state: editor }
  } catch {
    return { ok: false, reason: 'O rascunho salvo não pôde ser lido.' }
  }
}

export function isMeaningfullyEdited(state: EditorState): boolean {
  if (state.provenance.kind === 'imported') return true
  return JSON.stringify(state) !== JSON.stringify(createDefaultEditorState())
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
