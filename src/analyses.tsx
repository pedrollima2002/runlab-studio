import { useRef, useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, AlertTriangle, CheckCircle2, FileCheck2, FileUp, HeartPulse, LoaderCircle, LockKeyhole, RotateCcw, Route, Sparkles, Timer, Trash2 } from 'lucide-react'
import { ActivityImportError, importActivityFile, MAX_ACTIVITY_FILE_BYTES } from './activity-import.ts'
import { adaptActivityToStudio, canTransferActivityToStudio } from './activity-to-studio.ts'
import type { ActivityMetric, NormalizedActivity } from './activity-types.ts'
import { createDefaultEditorState, DRAFT_STORAGE_KEY, isMeaningfullyEdited } from './studio-config.ts'
import { markImportedSession, useStudioSession } from './studio-session.tsx'

type ImportState =
  | { status: 'idle'; message: string }
  | { status: 'processing'; message: string }
  | { status: 'success'; message: string; activity: NormalizedActivity }
  | { status: 'error'; message: string }

export function formatActivityDuration(value: number | null): string {
  if (value === null || !Number.isFinite(value) || value <= 0) return 'Não disponível'
  const rounded = Math.round(value)
  const hours = Math.floor(rounded / 3600)
  const minutes = Math.floor((rounded % 3600) / 60)
  const seconds = rounded % 60
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function formatImportedPace(value: number | null): string {
  if (value === null || !Number.isFinite(value) || value <= 0) return 'Não disponível'
  const rounded = Math.round(value)
  return `${Math.floor(rounded / 60)}:${String(rounded % 60).padStart(2, '0')} min/km`
}

function formatDistance(value: number | null): string {
  return value === null ? 'Não disponível' : `${(value / 1_000).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} km`
}

function formatElevation(value: number | null): string {
  return value === null ? 'Não disponível' : `${Math.round(value)} m`
}

function elevationDetail(metric: ActivityMetric, activity: NormalizedActivity): string {
  if (metric.source === 'fit-session') return 'Resumo da sessão FIT, já normalizado em metros pelo parser.'
  if (metric.source === 'fit-laps') return 'Soma das voltas FIT com cobertura integral validada.'
  if (activity.source.format === 'tcx' && activity.source.availableFields.includes('altitude')) return 'O TCX contém altitude, mas não um resumo explícito confiável.'
  return 'O arquivo não fornece um resumo confiável para esta métrica.'
}

function formatDate(value: string | null): string {
  if (!value) return 'Não disponível'
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function formatSport(value: string | null): string {
  if (!value) return 'Não informada'
  const sports: Record<string, string> = { running: 'Corrida', biking: 'Ciclismo', walking: 'Caminhada' }
  return sports[value.toLowerCase()] ?? value
}

function metricValue(metric: ActivityMetric, formatter: (value: number | null) => string): string {
  return formatter(metric.value)
}

function MetricCard({ label, value, detail, warning = false }: { label: string; value: string; detail?: string; warning?: boolean }) {
  return <div className={`analysis-metric${warning ? ' analysis-metric-warning' : ''}`}>
    <span>{label}</span>
    <strong>{value}</strong>
    {detail && <small>{detail}</small>}
  </div>
}

function EmptyImporter({ inputRef, state, onFile }: {
  inputRef: React.RefObject<HTMLInputElement | null>
  state: Extract<ImportState, { status: 'idle' | 'processing' | 'error' }>
  onFile: (event: ChangeEvent<HTMLInputElement>) => void
}) {
  const processing = state.status === 'processing'
  return <section className="panel activity-import-panel" aria-labelledby="activity-import-title">
    <div className="activity-import-copy">
      <span className="eyebrow"><FileUp size={17} aria-hidden="true" /> Importação local</span>
      <h2 id="activity-import-title">Selecione sua atividade</h2>
      <p>Use um arquivo FIT ou TCX exportado pelo seu relógio ou aplicativo. O RUNLAB mostra somente dados encontrados ou cálculos identificados.</p>
    </div>
    <label className={`activity-dropzone${processing ? ' activity-dropzone-processing' : ''}`}>
      {processing ? <LoaderCircle className="spin" size={34} aria-hidden="true" /> : <FileUp size={34} aria-hidden="true" />}
      <strong>{processing ? 'Lendo e validando a atividade…' : 'Escolher arquivo FIT ou TCX'}</strong>
      <span>{processing ? 'O processamento acontece neste dispositivo. Não feche esta página.' : `Um arquivo por vez · até ${MAX_ACTIVITY_FILE_BYTES / 1024 / 1024} MB`}</span>
      <input ref={inputRef} accept=".fit,.tcx,application/vnd.ant.fit,application/xml,text/xml" disabled={processing} onChange={onFile} type="file" />
    </label>
    <p className={`activity-import-feedback activity-import-feedback-${state.status}`} role="status" aria-live="polite">
      {state.status === 'error' && <AlertTriangle size={17} aria-hidden="true" />}{state.message}
    </p>
  </section>
}

function ActivitySummary({ activity, onClear, onReplace, onCreate }: { activity: NormalizedActivity; onClear: () => void; onReplace: () => void; onCreate: () => void }) {
  const metrics = activity.metrics
  const transferable = canTransferActivityToStudio(activity)
  const durationMetric = metrics.timerSeconds.value !== null ? metrics.timerSeconds : metrics.elapsedSeconds
  const durationLabel = metrics.timerSeconds.value !== null ? 'Tempo de cronômetro' : 'Tempo decorrido'
  return <div className="activity-results">
    <section className="panel activity-result-heading">
      <div><span className="eyebrow"><CheckCircle2 size={17} aria-hidden="true" /> Importação concluída</span><h2>{activity.source.fileName}</h2><p>Dados processados localmente. Nenhuma coordenada ou informação da atividade foi enviada.</p></div>
      <div className="activity-result-actions">
        <button className="button primary activity-create-sticker" disabled={!transferable} onClick={onCreate} type="button"><Sparkles size={16} aria-hidden="true" />Criar figurinha desta corrida</button>
        <button className="button primary" onClick={onReplace} type="button"><RotateCcw size={16} aria-hidden="true" />Importar outra</button>
        <button className="button danger-button" onClick={onClear} type="button"><Trash2 size={16} aria-hidden="true" />Limpar atividade</button>
      </div>
      {!transferable && <p className="activity-transfer-help">A figurinha exige distância, duração e pace válidos nesta atividade.</p>}
    </section>

    <section className="panel content-panel" aria-labelledby="activity-summary-title">
      <div className="section-heading"><div><span className="eyebrow">Resumo da atividade</span><h2 id="activity-summary-title">Métricas principais</h2></div><Activity aria-hidden="true" /></div>
      <div className="activity-metric-grid">
        <MetricCard label="Data e horário" value={formatDate(activity.startedAt)} />
        <MetricCard label="Modalidade" value={formatSport(activity.sport)} />
        <MetricCard label="Distância" value={metricValue(metrics.distanceMeters, formatDistance)} warning={metrics.distanceMeters.status === 'inconsistent'} />
        <MetricCard label={durationLabel} value={metricValue(durationMetric, formatActivityDuration)} detail={durationMetric.note} />
        <MetricCard label={`Pace médio${activity.paceTimeBasis === 'timer' ? ' · cronômetro' : activity.paceTimeBasis === 'elapsed' ? ' · decorrido' : ''}`} value={metricValue(metrics.paceSecondsPerKilometer, formatImportedPace)} detail={metrics.paceSecondsPerKilometer.note} warning={metrics.paceSecondsPerKilometer.status === 'inconsistent'} />
      </div>
    </section>

    <section className="panel content-panel" aria-labelledby="additional-metrics-title">
      <div className="section-heading"><div><span className="eyebrow">Métricas adicionais</span><h2 id="additional-metrics-title">Dados disponíveis</h2></div><HeartPulse aria-hidden="true" /></div>
      <div className="activity-metric-grid activity-metric-grid-small">
        <MetricCard label="FC média" value={metrics.averageHeartRateBpm.value === null ? 'Dados de frequência cardíaca não disponíveis' : `${Math.round(metrics.averageHeartRateBpm.value)} bpm`} />
        <MetricCard label="FC máxima" value={metrics.maximumHeartRateBpm.value === null ? 'Dados de frequência cardíaca não disponíveis' : `${Math.round(metrics.maximumHeartRateBpm.value)} bpm`} />
        <MetricCard label="Tempo decorrido" value={metricValue(metrics.elapsedSeconds, formatActivityDuration)} />
        <MetricCard label="Tempo de cronômetro" value={metricValue(metrics.timerSeconds, formatActivityDuration)} />
        <MetricCard label="Tempo em movimento" value={metricValue(metrics.movingSeconds, formatActivityDuration)} detail={metrics.movingSeconds.value === null ? 'Não é estimado nem copiado do cronômetro sem uma métrica independente.' : 'Métrica explicitamente informada pelo arquivo.'} />
        <MetricCard label="Subida acumulada" value={metricValue(metrics.ascentMeters, formatElevation)} detail={elevationDetail(metrics.ascentMeters, activity)} />
        <MetricCard label="Descida acumulada" value={metricValue(metrics.descentMeters, formatElevation)} detail={elevationDetail(metrics.descentMeters, activity)} />
      </div>
    </section>

    <section className="panel content-panel" aria-labelledby="activity-origin-title">
      <div className="section-heading"><div><span className="eyebrow">Origem e qualidade</span><h2 id="activity-origin-title">Informações do arquivo</h2></div><FileCheck2 aria-hidden="true" /></div>
      <dl className="activity-origin-list">
        <div><dt>Formato</dt><dd>{activity.source.format.toUpperCase()}</dd></div>
        <div><dt>Amostras temporais</dt><dd>{activity.samples.length.toLocaleString('pt-BR')}</dd></div>
        <div><dt>Voltas originais</dt><dd>{activity.laps.length.toLocaleString('pt-BR')}</dd></div>
      </dl>
      <h3>Campos encontrados</h3>
      {activity.source.availableFields.length
        ? <ul className="activity-field-list">{activity.source.availableFields.map((field) => <li key={field}>{field}</li>)}</ul>
        : <p className="muted">Nenhum campo opcional reconhecido.</p>}
      <h3>Limitações e avisos</h3>
      {activity.warnings.length
        ? <ul className="activity-warning-list">{activity.warnings.map((warning) => <li key={warning}><AlertTriangle size={16} aria-hidden="true" />{warning}</li>)}</ul>
        : <p className="activity-no-warning"><CheckCircle2 size={16} aria-hidden="true" />Nenhuma inconsistência detectada pelos validadores desta etapa.</p>}
    </section>
  </div>
}

export function Analyses() {
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const studioSession = useStudioSession()
  const [state, setState] = useState<ImportState>({ status: 'idle', message: 'O arquivo permanece somente na memória desta aba.' })

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setState({ status: 'processing', message: `Processando ${file.name} localmente…` })
    try {
      const activity = await importActivityFile(file)
      setState({ status: 'success', message: 'Atividade importada.', activity })
    } catch (error) {
      const message = error instanceof ActivityImportError || error instanceof Error ? error.message : 'Não foi possível importar este arquivo.'
      setState({ status: 'error', message })
    }
  }

  function clearActivity() {
    setState({ status: 'idle', message: 'Atividade removida da memória. Você pode importar outro arquivo.' })
  }

  function createSticker(activity: NormalizedActivity) {
    if (!canTransferActivityToStudio(activity)) return
    let hasStoredDraft = false
    try {
      hasStoredDraft = window.localStorage.getItem(DRAFT_STORAGE_KEY) !== null
    } catch {
      // A ausência de acesso ao armazenamento não impede o fluxo temporário.
    }
    const hasCurrentEdition = studioSession.editorState !== null && isMeaningfullyEdited(studioSession.editorState)
    if ((hasStoredDraft || hasCurrentEdition) && !window.confirm('Já existe uma edição ou rascunho no Estúdio. Utilizar a corrida importada e substituir os dados atuais? O rascunho salvo não será excluído.')) return

    const base = studioSession.editorState ?? createDefaultEditorState()
    studioSession.setEditorState(adaptActivityToStudio(activity, base))
    markImportedSession()
    navigate('/estudio')
  }

  return <>
    <div className="page-heading analysis-page-heading">
      <span className="eyebrow"><Route size={17} aria-hidden="true" /> Análises RUNLAB</span>
      <h1>Análise de Corridas</h1>
      <p>Importe FIT ou TCX para conferir métricas básicas com origem e limitações identificadas.</p>
    </div>
    <section className="analysis-privacy panel"><LockKeyhole aria-hidden="true" /><div><h2>Privado por padrão, sem cadastro</h2><p>O arquivo é processado neste navegador, não é enviado para APIs e não é salvo em servidor. Rotas GPS podem revelar locais sensíveis; mapas não são exibidos nesta etapa.</p></div><Timer aria-hidden="true" /></section>
    {state.status === 'success'
      ? <ActivitySummary activity={state.activity} onClear={clearActivity} onCreate={() => createSticker(state.activity)} onReplace={() => inputRef.current?.click()} />
      : <EmptyImporter inputRef={inputRef} state={state} onFile={handleFile} />}
    {state.status === 'success' && <input ref={inputRef} accept=".fit,.tcx,application/vnd.ant.fit,application/xml,text/xml" aria-label="Escolher outra atividade" className="sr-only" onChange={handleFile} type="file" />}
  </>
}
