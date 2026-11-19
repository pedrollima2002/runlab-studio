import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { adaptActivityToStudio, canTransferActivityToStudio, enableManualMetricEditing, restoreImportedMetrics } from './activity-to-studio.ts'
import type { ActivityMetric, NormalizedActivity } from './activity-types.ts'
import { createDefaultEditorState, parseDraft, serializeDraft } from './studio-config.ts'

function metric(value: number | null, source: ActivityMetric['source'] = 'fit-session'): ActivityMetric {
  return { value, status: value === null ? 'missing' : 'available', source: value === null ? null : source }
}

function activity(overrides: Partial<NormalizedActivity> = {}): NormalizedActivity {
  return {
    id: 'synthetic-fit',
    source: { format: 'fit', fileName: 'anonimo.fit', availableFields: [] },
    sport: 'running',
    startedAt: '2026-11-15T07:39:08.000Z',
    metrics: {
      distanceMeters: metric(21_100),
      elapsedSeconds: metric(6_634),
      timerSeconds: metric(6_634),
      movingSeconds: metric(null),
      paceSecondsPerKilometer: metric(6_634 / 21.1, 'calculated'),
      averageHeartRateBpm: metric(168),
      maximumHeartRateBpm: metric(183),
      ascentMeters: metric(36),
      descentMeters: metric(34),
    },
    paceTimeBasis: 'timer',
    samples: [],
    laps: [],
    warnings: [],
    ...overrides,
  }
}

describe('integração da atividade com o Estúdio', () => {
  it('T1 adapta FIT válido sem transportar amostras ou coordenadas', () => {
    const adapted = adaptActivityToStudio(activity(), createDefaultEditorState())
    assert.equal(adapted.provenance.kind, 'imported')
    assert.equal('samples' in adapted, false)
    if (adapted.provenance.kind === 'imported') assert.equal(adapted.provenance.reference.format, 'fit')
  })

  it('T2 adapta TCX válido', () => {
    const tcx = activity({ source: { format: 'tcx', fileName: 'anonimo.tcx', availableFields: [] } })
    const adapted = adaptActivityToStudio(tcx, createDefaultEditorState())
    if (adapted.provenance.kind === 'imported') assert.equal(adapted.provenance.reference.format, 'tcx')
  })

  it('T3 a T7 preserva distância, tempo, pace, FC, subida e descida na referência', () => {
    const adapted = adaptActivityToStudio(activity(), createDefaultEditorState())
    assert.equal(adapted.activity.distance, '21,1')
    assert.equal(adapted.activity.duration, '1:50:34')
    assert.equal(adapted.activity.heartRate, '168')
    assert.equal(adapted.activity.elevation, '36')
    assert.equal(adapted.activity.date, '2026-11-15')
    assert.equal(adapted.activity.title, 'Corrida importada')
    if (adapted.provenance.kind !== 'imported') assert.fail('origem importada esperada')
    assert.equal(adapted.provenance.reference.durationBasis, 'timer')
    assert.equal(adapted.provenance.reference.paceSecondsPerKilometer, 6_634 / 21.1)
    assert.equal(adapted.provenance.reference.maximumHeartRateBpm, 183)
    assert.equal(adapted.provenance.reference.descentMeters, 34)
  })

  it('T8 TCX sem resumo de elevação não recebe valor fictício', () => {
    const source = activity({
      source: { format: 'tcx', fileName: 'sem-elevacao.tcx', availableFields: ['altitude'] },
      metrics: { ...activity().metrics, ascentMeters: metric(null), descentMeters: metric(null) },
    })
    const adapted = adaptActivityToStudio(source, createDefaultEditorState())
    assert.equal(adapted.activity.elevation, '')
    assert.equal(adapted.appearance.visibility.elevation, false)
  })

  it('T9 atividade sem FC limpa o valor anterior', () => {
    const source = activity({ metrics: { ...activity().metrics, averageHeartRateBpm: metric(null), maximumHeartRateBpm: metric(null) } })
    const adapted = adaptActivityToStudio(source, createDefaultEditorState())
    assert.equal(adapted.activity.heartRate, '')
    assert.equal(adapted.appearance.visibility.heartRate, false)
  })

  it('T10 e T11 preserva template, cores e organização ao substituir somente a corrida', () => {
    const base = createDefaultEditorState()
    base.appearance = { ...base.appearance, template: 'Clean', accentColor: 'pink', layout: 'left' }
    const adapted = adaptActivityToStudio(activity(), base)
    assert.equal(adapted.appearance.template, 'Clean')
    assert.equal(adapted.appearance.accentColor, 'pink')
    assert.equal(adapted.appearance.layout, 'left')
  })

  it('T17 substitui todos os dados opcionais da atividade anterior', () => {
    const first = adaptActivityToStudio(activity(), createDefaultEditorState())
    const secondSource = activity({
      source: { format: 'tcx', fileName: 'segunda.tcx', availableFields: [] },
      metrics: { ...activity().metrics, distanceMeters: metric(5_000, 'tcx-laps'), timerSeconds: metric(1_500, 'tcx-laps'), paceSecondsPerKilometer: metric(300, 'calculated'), averageHeartRateBpm: metric(null), maximumHeartRateBpm: metric(null), ascentMeters: metric(null), descentMeters: metric(null) },
    })
    const second = adaptActivityToStudio(secondSource, first)
    assert.equal(second.activity.distance, '5')
    assert.equal(second.activity.duration, '25:00')
    assert.equal(second.activity.heartRate, '')
    assert.equal(second.activity.elevation, '')
  })

  it('T18 exige ação explícita para editar e permite restaurar os originais', () => {
    const imported = adaptActivityToStudio(activity(), createDefaultEditorState())
    const editable = enableManualMetricEditing(imported)
    assert.equal(editable.provenance.kind === 'imported' && editable.provenance.edited, true)
    editable.activity.distance = '10'
    editable.activity.title = 'Longão personalizado'
    const restored = restoreImportedMetrics(editable)
    assert.equal(restored.activity.distance, '21,1')
    assert.equal(restored.activity.title, 'Longão personalizado')
    assert.equal(restored.provenance.kind === 'imported' && restored.provenance.edited, false)
  })

  it('T21 rascunho opt-in preserva proveniência e referência sem arquivo ou GPS', () => {
    const imported = adaptActivityToStudio(activity(), createDefaultEditorState())
    const serialized = serializeDraft(imported)
    const restored = parseDraft(serialized)
    assert.equal(restored.ok, true)
    assert.doesNotMatch(serialized, /anonimo\.fit|latitude|longitude|samples/)
    if (restored.ok) assert.deepEqual(restored.state, imported)
  })

  it('recusa integração sem distância, duração ou pace válidos', () => {
    const invalid = activity({ metrics: { ...activity().metrics, distanceMeters: metric(null) }, paceTimeBasis: null })
    assert.equal(canTransferActivityToStudio(invalid), false)
    assert.throws(() => adaptActivityToStudio(invalid, createDefaultEditorState()), /distância, duração e pace/)
  })
})
