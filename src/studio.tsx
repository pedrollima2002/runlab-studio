import { useState, type ReactNode } from 'react'
import { Calculator, ChevronDown, Download, RotateCcw, ScanLine } from 'lucide-react'
import { demo, templates } from './demo'
import { Sticker, type StickerData, type StickerMetric } from './preview'
import { calculateAveragePace, formatDistance, formatPace, parseDistanceKm, parseDurationSeconds } from './pace'
import {
  accentColors,
  compatibleTextColors,
  defaultAppearance,
  formatActivityDate,
  resetTemplateColors,
  selectTemplate,
  setMetricVisibility,
  textColors,
  type ActivityData,
  type MetricKey,
  type PreviewMode,
  type StickerLayout,
  type TextColor,
} from './studio-config'

const metricLabels: Record<MetricKey, string> = {
  distance: 'Distância',
  duration: 'Tempo',
  pace: 'Pace médio',
  heartRate: 'Frequência cardíaca',
  elevation: 'Elevação',
}

const layoutOptions: { value: StickerLayout; label: string; description: string }[] = [
  { value: 'centered', label: 'Centralizada', description: 'Métricas agrupadas no centro.' },
  { value: 'left', label: 'À esquerda', description: 'Leitura editorial e alinhada.' },
  { value: 'featured', label: 'Métrica em destaque', description: 'Distância com maior hierarquia.' },
]

function Group({ title, children, open = false }: { title: string; children: ReactNode; open?: boolean }) {
  return <details className="panel" open={open}>
    <summary>{title}<ChevronDown size={18} aria-hidden="true" /></summary>
    <div className="group-body">{children}</div>
  </details>
}

export function Studio() {
  const [activity, setActivity] = useState<ActivityData>({
    distance: demo.distance,
    duration: demo.duration,
    title: demo.title,
    date: '2026-11-15',
    heartRate: demo.heartRate,
    elevation: demo.elevation,
  })
  const [appearance, setAppearance] = useState(defaultAppearance)
  const [visibilityMessage, setVisibilityMessage] = useState('')

  const parsedDistance = parseDistanceKm(activity.distance)
  const parsedDuration = parseDurationSeconds(activity.duration)
  const calculation = calculateAveragePace(activity.distance, activity.duration)
  const pace = calculation.ok ? formatPace(calculation.paceSeconds) : '—'
  const heartRate = activity.heartRate.trim()
  const elevation = activity.elevation.trim()
  const heartRateValid = heartRate === '' || (/^\d+$/.test(heartRate) && Number(heartRate) > 0 && Number(heartRate) <= 250)
  const elevationValid = elevation === '' || (/^\d+(?:[.,]\d+)?$/.test(elevation) && Number(elevation.replace(',', '.')) >= 0)

  const availableMetrics: MetricKey[] = ['distance', 'duration', 'pace']
  if (heartRate && heartRateValid) availableMetrics.push('heartRate')
  if (elevation && elevationValid) availableMetrics.push('elevation')

  const allMetrics: StickerMetric[] = [
    { key: 'distance', label: 'Distância', value: parsedDistance === null ? '—' : formatDistance(parsedDistance), unit: 'km' },
    { key: 'duration', label: 'Tempo', value: parsedDuration === null ? '—' : activity.duration.trim(), unit: '' },
    { key: 'pace', label: 'Ritmo médio', value: pace, unit: 'min/km' },
    ...(heartRate && heartRateValid ? [{ key: 'heartRate' as const, label: 'FC média', value: heartRate, unit: 'bpm' }] : []),
    ...(elevation && elevationValid ? [{ key: 'elevation' as const, label: 'Elevação', value: elevation.replace('.', ','), unit: 'm' }] : []),
  ]

  const stickerData: StickerData = {
    title: activity.title.trim() || 'Sua corrida',
    date: formatActivityDate(activity.date),
    metrics: allMetrics.filter((metric) => appearance.visibility[metric.key]),
  }

  function updateActivity(field: keyof ActivityData, value: string) {
    setActivity((current) => ({ ...current, [field]: value }))
  }

  function updateVisibility(metric: MetricKey, visible: boolean) {
    setAppearance((current) => {
      const result = setMetricVisibility(current, metric, visible, availableMetrics)
      setVisibilityMessage(result.blocked ? 'Mantenha pelo menos uma métrica visível na figurinha.' : '')
      return result.appearance
    })
  }

  return <>
    <div className="page-heading">
      <span className="eyebrow">RUNLAB Studio</span>
      <h1>Estúdio de figurinhas</h1>
      <p>Edite os dados, escolha um modelo e personalize a composição. A exportação continua em desenvolvimento.</p>
    </div>
    <div className="studio-layout">
      <aside className="preview-panel panel" aria-label="Prévia da figurinha">
        <div className="preview-heading"><h2><ScanLine size={18} aria-hidden="true" /> Prévia</h2><span>Story · 9:16</span></div>
        <div className={`preview-stage preview-stage-${appearance.mode}`}>
          <Sticker appearance={appearance} data={stickerData} template={appearance.template} />
        </div>
        <p aria-live="polite">{appearance.template} · {appearance.mode === 'transparent' ? 'Figurinha transparente' : 'Arte completa'}</p>
      </aside>

      <div className="controls" aria-label="Controles do estúdio">
        <Group title="Dados da corrida" open>
          <div className="field-grid">
            <label className="field">
              Distância (km)
              <input
                aria-describedby={calculation.ok || !calculation.distanceError ? undefined : 'distance-error'}
                aria-invalid={!calculation.ok && Boolean(calculation.distanceError)}
                inputMode="decimal"
                onChange={(event) => updateActivity('distance', event.target.value)}
                placeholder="Ex.: 10 ou 2,5"
                value={activity.distance}
              />
              {!calculation.ok && calculation.distanceError && <span className="field-error" id="distance-error">{calculation.distanceError}</span>}
            </label>
            <label className="field">
              Tempo
              <input
                aria-describedby={!calculation.ok && calculation.durationError ? 'duration-error duration-help' : 'duration-help'}
                aria-invalid={!calculation.ok && Boolean(calculation.durationError)}
                inputMode="numeric"
                onChange={(event) => updateActivity('duration', event.target.value)}
                placeholder="Ex.: 54:40 ou 1:00:00"
                value={activity.duration}
              />
              <span className="field-help" id="duration-help">Formatos aceitos: MM:SS ou H:MM:SS.</span>
              {!calculation.ok && calculation.durationError && <span className="field-error" id="duration-error">{calculation.durationError}</span>}
            </label>
            <div className="field pace-field">
              <span>Ritmo médio (min/km)</span>
              <span className="calculated-value"><Calculator size={16} aria-hidden="true" />{pace}</span>
              <span className="field-help">Calculado automaticamente.</span>
            </div>
            <label className="field">
              Frequência cardíaca opcional (bpm)
              <input
                aria-describedby={!heartRateValid ? 'heart-rate-error' : undefined}
                aria-invalid={!heartRateValid}
                inputMode="numeric"
                onChange={(event) => updateActivity('heartRate', event.target.value)}
                placeholder="Ex.: 158"
                value={activity.heartRate}
              />
              {!heartRateValid && <span className="field-error" id="heart-rate-error">Informe um valor entre 1 e 250 bpm ou deixe em branco.</span>}
            </label>
            <label className="field">
              Elevação opcional (m)
              <input
                aria-describedby={!elevationValid ? 'elevation-error' : undefined}
                aria-invalid={!elevationValid}
                inputMode="decimal"
                onChange={(event) => updateActivity('elevation', event.target.value)}
                placeholder="Ex.: 84"
                value={activity.elevation}
              />
              {!elevationValid && <span className="field-error" id="elevation-error">Informe zero ou um número positivo, ou deixe em branco.</span>}
            </label>
            <label className="field">
              Data opcional
              <input onChange={(event) => updateActivity('date', event.target.value)} type="date" value={activity.date} />
            </label>
            <label className="field field-wide">
              Título da atividade
              <input
                aria-describedby="title-help"
                maxLength={48}
                onChange={(event) => updateActivity('title', event.target.value)}
                placeholder="Ex.: Corrida de domingo"
                value={activity.title}
              />
              <span className="field-help" id="title-help">{activity.title.length}/48 caracteres. Em branco, usa “Sua corrida”.</span>
            </label>
          </div>
          <p className="calculation-note">O ritmo médio é calculado com base no tempo informado. Caso sua atividade tenha pausas, o resultado poderá ser diferente do registrado no seu relógio ou aplicativo.</p>
        </Group>

        <Group title="Modelos" open>
          <div className="template-grid">{templates.map((template) =>
            <button
              aria-pressed={appearance.template === template}
              className={appearance.template === template ? 'current-template' : ''}
              key={template}
              onClick={() => setAppearance((current) => selectTemplate(current, template))}
              type="button"
            >
              <span className={`sample sample-${template.toLowerCase()}`} aria-hidden="true"><span>10,00</span></span>{template}
            </button>)}</div>
        </Group>

        <Group title="Personalização" open>
          <div className="customization-stack">
            <fieldset><legend>Modo de prévia</legend>
              <div className="option-row">{([
                ['transparent', 'Figurinha transparente'],
                ['full', 'Arte completa'],
              ] as [PreviewMode, string][]).map(([mode, label]) => <label key={mode}>
                <input checked={appearance.mode === mode} name="preview-mode" onChange={() => setAppearance((current) => ({ ...current, mode }))} type="radio" /> {label}
              </label>)}</div>
              <p className="field-help">A transparência é apenas simulada na prévia; nenhum arquivo é gerado nesta etapa.</p>
            </fieldset>

            <div className="field-grid">
              <label className="field">Cor de destaque
                <select onChange={(event) => setAppearance((current) => ({ ...current, accentColor: event.target.value as keyof typeof accentColors }))} value={appearance.accentColor}>
                  {Object.entries(accentColors).map(([key, color]) => <option key={key} value={key}>{color.label}</option>)}
                </select>
              </label>
              <label className="field">Cor do texto
                <select onChange={(event) => setAppearance((current) => ({ ...current, textColor: event.target.value as TextColor }))} value={appearance.textColor}>
                  {compatibleTextColors[appearance.template].map((key) => <option key={key} value={key}>{textColors[key].label}</option>)}
                </select>
              </label>
              <button className="button reset-colors" onClick={() => setAppearance(resetTemplateColors)} type="button"><RotateCcw size={16} aria-hidden="true" />Restaurar cores</button>
            </div>

            <fieldset><legend>Organização visual</legend>
              <div className="layout-grid">{layoutOptions.map((option) => <label className={appearance.layout === option.value ? 'selected-option' : ''} key={option.value}>
                <input checked={appearance.layout === option.value} name="layout" onChange={() => setAppearance((current) => ({ ...current, layout: option.value }))} type="radio" value={option.value} />
                <strong>{option.label}</strong><span>{option.description}</span>
              </label>)}</div>
            </fieldset>

            <fieldset><legend>Métricas visíveis</legend>
              <div className="metric-toggles">{(Object.keys(metricLabels) as MetricKey[]).map((metric) => {
                const available = availableMetrics.includes(metric)
                return <label className={!available ? 'unavailable-option' : ''} key={metric}>
                  <input
                    checked={available && appearance.visibility[metric]}
                    disabled={!available}
                    onChange={(event) => updateVisibility(metric, event.target.checked)}
                    type="checkbox"
                  />
                  <span>{metricLabels[metric]}{!available && ' · preencha nos dados'}</span>
                </label>
              })}</div>
              <p aria-live="polite" className="field-error visibility-message">{visibilityMessage}</p>
            </fieldset>
          </div>
        </Group>

        <Group title="Exportação" open>
          <p className="muted">Em desenvolvimento</p>
          <div className="export-list">{['PNG transparente', 'Story · 1080 × 1920', 'Feed · 1080 × 1350'].map((format) =>
            <button className="button" key={format} type="button" disabled><Download size={16} aria-hidden="true" />{format}</button>)}</div>
        </Group>
      </div>
    </div>
  </>
}
