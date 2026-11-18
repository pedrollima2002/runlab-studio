import { useEffect, useReducer, useState, type ReactNode } from 'react'
import { Calculator, CheckCircle2, ChevronDown, Download, LoaderCircle, Redo2, RotateCcw, ScanLine, Trash2, Undo2 } from 'lucide-react'
import { templates } from './demo'
import { downloadExport, exportFormatDetails, exportFormats, renderExport, type ExportFormat } from './export-engine'
import { Sticker, type StickerData, type StickerMetric } from './preview'
import { calculateAveragePace, formatDistance, formatPace, parseDistanceKm, parseDurationSeconds } from './pace'
import {
  accentColors,
  compatibleTextColors,
  createDefaultEditorState,
  createEditorHistory,
  DRAFT_STORAGE_KEY,
  editorHistoryReducer,
  formatActivityDate,
  parseDraft,
  resetTemplateColors,
  restoreDefaultAppearance,
  selectTemplate,
  serializeDraft,
  setMetricVisibility,
  textColors,
  type ActivityData,
  type EditorState,
  type MetricKey,
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

type DraftStartup = { pending: EditorState | null; hasStored: boolean; message: string }
type ExportStatus = { state: 'idle' | 'processing' | 'success' | 'error'; message: string }

function loadDraftStartup(): DraftStartup {
  try {
    const stored = window.localStorage.getItem(DRAFT_STORAGE_KEY)
    if (!stored) return { pending: null, hasStored: false, message: '' }

    const parsed = parseDraft(stored)
    return parsed.ok
      ? { pending: parsed.state, hasStored: true, message: '' }
      : { pending: null, hasStored: true, message: `${parsed.reason} O Estúdio foi aberto com os valores padrão.` }
  } catch {
    return { pending: null, hasStored: false, message: 'O armazenamento local não está disponível neste navegador.' }
  }
}

function Group({ title, children, open = false }: { title: string; children: ReactNode; open?: boolean }) {
  return <details className="panel" open={open}>
    <summary>{title}<ChevronDown size={18} aria-hidden="true" /></summary>
    <div className="group-body">{children}</div>
  </details>
}

export function Studio() {
  const [draftStartup] = useState(loadDraftStartup)
  const [history, dispatchHistory] = useReducer(editorHistoryReducer, undefined, createEditorHistory)
  const [saveEnabled, setSaveEnabled] = useState(false)
  const [pendingDraft, setPendingDraft] = useState<EditorState | null>(draftStartup.pending)
  const [hasStoredDraft, setHasStoredDraft] = useState(draftStartup.hasStored)
  const [statusMessage, setStatusMessage] = useState(draftStartup.message)
  const [visibilityMessage, setVisibilityMessage] = useState('')
  const [exportFormat, setExportFormat] = useState<ExportFormat>('story')
  const [exportStatus, setExportStatus] = useState<ExportStatus>({ state: 'idle', message: '' })
  const { activity, appearance } = history.present

  useEffect(() => {
    if (!saveEnabled) return

    const timeout = window.setTimeout(() => {
      try {
        window.localStorage.setItem(DRAFT_STORAGE_KEY, serializeDraft(history.present))
        setHasStoredDraft(true)
        setStatusMessage('Rascunho salvo somente neste navegador e dispositivo.')
      } catch {
        setSaveEnabled(false)
        setStatusMessage('Não foi possível salvar o rascunho neste navegador.')
      }
    }, 300)

    return () => window.clearTimeout(timeout)
  }, [history.present, saveEnabled])

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      const target = event.target
      if (target instanceof HTMLElement && (target.matches('input, textarea, select') || target.isContentEditable)) return
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'z') return

      event.preventDefault()
      if (event.shiftKey) dispatchHistory({ type: 'redo' })
      else dispatchHistory({ type: 'undo' })
    }

    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

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
    dispatchHistory({
      type: 'update',
      group: `activity.${field}`,
      next: { ...history.present, activity: { ...activity, [field]: value } },
    })
  }

  function endTyping() {
    dispatchHistory({ type: 'end-group' })
  }

  function updateAppearance(nextAppearance: typeof appearance) {
    dispatchHistory({ type: 'update', next: { ...history.present, appearance: nextAppearance } })
  }

  function updateVisibility(metric: MetricKey, visible: boolean) {
    const result = setMetricVisibility(appearance, metric, visible, availableMetrics)
    setVisibilityMessage(result.blocked ? 'Mantenha pelo menos uma métrica visível na figurinha.' : '')
    if (!result.blocked) updateAppearance(result.appearance)
  }

  function undo() {
    if (history.past.length === 0) return
    dispatchHistory({ type: 'undo' })
    setStatusMessage('Alteração desfeita.')
  }

  function redo() {
    if (history.future.length === 0) return
    dispatchHistory({ type: 'redo' })
    setStatusMessage('Alteração refeita.')
  }

  function recoverDraft() {
    if (!pendingDraft) return
    dispatchHistory({ type: 'update', next: pendingDraft })
    setPendingDraft(null)
    setStatusMessage('Rascunho recuperado. O pace foi recalculado a partir da distância e do tempo.')
  }

  function startNewEdition() {
    if (!window.confirm('Iniciar uma nova figurinha e descartar os dados atuais do editor?')) return
    dispatchHistory({ type: 'update', next: createDefaultEditorState() })
    setPendingDraft(null)
    setStatusMessage('Nova figurinha iniciada. O rascunho salvo não foi excluído.')
  }

  function restoreAppearance() {
    dispatchHistory({ type: 'update', next: restoreDefaultAppearance(history.present) })
    setStatusMessage('A aparência padrão foi restaurada; os dados da corrida foram preservados.')
  }

  function deleteDraft() {
    if (!window.confirm('Excluir o rascunho salvo neste navegador?')) return
    try {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY)
      setHasStoredDraft(false)
      setPendingDraft(null)
      setStatusMessage('Rascunho local excluído.')
    } catch {
      setStatusMessage('Não foi possível excluir o rascunho local.')
    }
  }

  async function exportSticker() {
    if (exportStatus.state === 'processing') return
    if (!calculation.ok || !heartRateValid || !elevationValid) {
      setExportStatus({ state: 'error', message: 'Corrija os dados inválidos antes de exportar.' })
      return
    }

    setExportStatus({ state: 'processing', message: 'Gerando PNG em alta qualidade…' })
    try {
      const result = await renderExport(stickerData, appearance, exportFormat, activity.distance)
      downloadExport(result)
      setExportStatus({
        state: 'success',
        message: `${result.filename} pronto (${result.width} × ${result.height} px).`,
      })
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Falha inesperada ao gerar o arquivo.'
      setExportStatus({ state: 'error', message: `Não foi possível exportar. ${reason}` })
    }
  }

  return <>
    <div className="page-heading">
      <span className="eyebrow">RUNLAB Studio</span>
      <h1>Estúdio de figurinhas</h1>
      <p>Edite os dados, escolha um modelo e baixe a composição pronta em PNG.</p>
    </div>
    <div className="studio-layout">
      <aside className="preview-panel panel" aria-label="Prévia da figurinha">
        <div className="preview-heading"><h2><ScanLine size={18} aria-hidden="true" /> Prévia</h2><span>{exportFormatDetails[exportFormat].label}</span></div>
        <div className={`preview-stage preview-stage-${exportFormat === 'transparent' ? 'transparent' : 'full'} preview-output-${exportFormat}`}>
          <Sticker appearance={{ ...appearance, mode: exportFormat === 'transparent' ? 'transparent' : 'full' }} data={stickerData} template={appearance.template} />
        </div>
        <p aria-live="polite">{appearance.template} · {exportFormatDetails[exportFormat].description}</p>
      </aside>

      <div className="controls" aria-label="Controles do estúdio">
        {pendingDraft && <section className="recovery-panel panel" aria-labelledby="recovery-title">
          <div><span className="eyebrow">Rascunho local</span><h2 id="recovery-title">Continuar de onde você parou?</h2><p>Existe uma edição salva somente neste navegador. Escolha recuperá-la ou começar com os valores padrão.</p></div>
          <div className="recovery-actions">
            <button className="button primary" onClick={recoverDraft} type="button">Recuperar rascunho</button>
            <button className="button" onClick={startNewEdition} type="button">Começar nova edição</button>
          </div>
        </section>}

        <section className="history-toolbar panel" aria-label="Histórico de edição">
          <div className="history-actions">
            <button className="button" disabled={history.past.length === 0} onClick={undo} type="button"><Undo2 size={17} aria-hidden="true" />Desfazer</button>
            <button className="button" disabled={history.future.length === 0} onClick={redo} type="button"><Redo2 size={17} aria-hidden="true" />Refazer</button>
          </div>
          <p><kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>Z</kbd> fora dos campos · use <kbd>Shift</kbd> para refazer</p>
        </section>

        <p className="editor-feedback" role="status" aria-live="polite">{statusMessage}</p>

        <Group title="Rascunho e restauração" open>
          <div className="draft-controls">
            <label className="save-toggle">
              <input
                checked={saveEnabled}
                disabled={Boolean(pendingDraft)}
                onChange={(event) => {
                  setSaveEnabled(event.target.checked)
                  setStatusMessage(event.target.checked
                    ? 'Salvamento local ativado.'
                    : 'Salvamento local desativado. Um rascunho existente foi mantido.')
                }}
                type="checkbox"
              />
              <span><strong>Salvar rascunho neste dispositivo</strong><small>Os dados ficam somente neste navegador, sem conta ou sincronização.</small></span>
            </label>
            {pendingDraft && <p className="field-help">Escolha primeiro se deseja recuperar o rascunho encontrado.</p>}
            <div className="draft-actions">
              <button className="button" onClick={restoreAppearance} type="button"><RotateCcw size={16} aria-hidden="true" />Restaurar padrão</button>
              <button className="button" onClick={startNewEdition} type="button">Nova figurinha</button>
              <button className="button danger-button" disabled={!hasStoredDraft} onClick={deleteDraft} type="button"><Trash2 size={16} aria-hidden="true" />Excluir rascunho</button>
            </div>
            <p className="field-help">“Restaurar padrão” preserva os dados da corrida. “Nova figurinha” pede confirmação e reinicia dados e aparência.</p>
          </div>
        </Group>

        <Group title="Dados da corrida" open>
          <div className="field-grid">
            <label className="field">
              Distância (km)
              <input
                aria-describedby={calculation.ok || !calculation.distanceError ? undefined : 'distance-error'}
                aria-invalid={!calculation.ok && Boolean(calculation.distanceError)}
                inputMode="decimal"
                onBlur={endTyping}
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
                onBlur={endTyping}
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
                onBlur={endTyping}
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
                onBlur={endTyping}
                onChange={(event) => updateActivity('elevation', event.target.value)}
                placeholder="Ex.: 84"
                value={activity.elevation}
              />
              {!elevationValid && <span className="field-error" id="elevation-error">Informe zero ou um número positivo, ou deixe em branco.</span>}
            </label>
            <label className="field">
              Data opcional
              <input onBlur={endTyping} onChange={(event) => updateActivity('date', event.target.value)} type="date" value={activity.date} />
            </label>
            <label className="field field-wide">
              Título da atividade
              <input
                aria-describedby="title-help"
                maxLength={48}
                onBlur={endTyping}
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
              onClick={() => updateAppearance(selectTemplate(appearance, template))}
              type="button"
            >
              <span className={`sample sample-${template.toLowerCase()}`} aria-hidden="true"><span>10,00</span></span>{template}
            </button>)}</div>
        </Group>

        <Group title="Personalização" open>
          <div className="customization-stack">
            <div className="field-grid">
              <label className="field">Cor de destaque
                <select onChange={(event) => updateAppearance({ ...appearance, accentColor: event.target.value as keyof typeof accentColors })} value={appearance.accentColor}>
                  {Object.entries(accentColors).map(([key, color]) => <option key={key} value={key}>{color.label}</option>)}
                </select>
              </label>
              <label className="field">Cor do texto
                <select onChange={(event) => updateAppearance({ ...appearance, textColor: event.target.value as TextColor })} value={appearance.textColor}>
                  {compatibleTextColors[appearance.template].map((key) => <option key={key} value={key}>{textColors[key].label}</option>)}
                </select>
              </label>
              <button className="button reset-colors" onClick={() => updateAppearance(resetTemplateColors(appearance))} type="button"><RotateCcw size={16} aria-hidden="true" />Restaurar cores</button>
            </div>

            <fieldset><legend>Organização visual</legend>
              <div className="layout-grid">{layoutOptions.map((option) => <label className={appearance.layout === option.value ? 'selected-option' : ''} key={option.value}>
                <input checked={appearance.layout === option.value} name="layout" onChange={() => updateAppearance({ ...appearance, layout: option.value })} type="radio" value={option.value} />
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
          <fieldset disabled={exportStatus.state === 'processing'}>
            <legend className="export-legend">Escolha o formato</legend>
            <div className="export-list">{exportFormats.map((format) => {
              const details = exportFormatDetails[format]
              return <label className={`export-option${exportFormat === format ? ' selected-option' : ''}`} key={format}>
                <input checked={exportFormat === format} name="export-format" onChange={() => {
                  setExportFormat(format)
                  setExportStatus({ state: 'idle', message: '' })
                }} type="radio" />
                <span><strong>{details.label}</strong><small>{details.description}</small></span>
              </label>
            })}</div>
          </fieldset>
          <button
            className="button primary export-button"
            disabled={exportStatus.state === 'processing' || !calculation.ok || !heartRateValid || !elevationValid}
            onClick={exportSticker}
            type="button"
          >
            {exportStatus.state === 'processing'
              ? <><LoaderCircle className="spin" size={18} aria-hidden="true" />Gerando PNG…</>
              : <><Download size={18} aria-hidden="true" />Baixar {exportFormatDetails[exportFormat].label}</>}
          </button>
          {exportFormat === 'transparent' && <p className="transparent-guidance">A legibilidade depende da foto ou do fundo onde a figurinha será aplicada. Se necessário, escolha uma cor de texto com mais contraste antes de baixar.</p>}
          <p className={`export-feedback export-feedback-${exportStatus.state}`} role="status" aria-live="polite">
            {exportStatus.state === 'success' && <CheckCircle2 size={16} aria-hidden="true" />}
            {exportStatus.message || 'A imagem é criada localmente no navegador; nenhum dado é enviado.'}
          </p>
        </Group>
      </div>
    </div>
  </>
}
