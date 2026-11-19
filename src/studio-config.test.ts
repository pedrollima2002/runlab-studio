import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { calculateAveragePace, formatPace } from './pace.ts'
import {
  DRAFT_VERSION,
  HISTORY_LIMIT,
  createDefaultEditorState,
  createEditorHistory,
  defaultAppearance,
  editorHistoryReducer,
  formatActivityDate,
  parseDraft,
  resetTemplateColors,
  restoreDefaultAppearance,
  selectTemplate,
  serializeDraft,
  setMetricVisibility,
  templateDefaults,
  templates,
} from './studio-config.ts'

describe('templates e personalização', () => {
  test('disponibiliza os três templates com padrões visuais próprios', () => {
    assert.deepEqual(templates, ['Minimal', 'Performance', 'Clean'])
    assert.notDeepEqual(templateDefaults.Minimal, templateDefaults.Performance)
    assert.notDeepEqual(templateDefaults.Performance, templateDefaults.Clean)
  })

  test('trocar template preserva as demais escolhas visuais compatíveis', () => {
    const customized = { ...defaultAppearance, accentColor: 'sky' as const, mode: 'transparent' as const }
    const selected = selectTemplate(customized, 'Minimal')

    assert.equal(selected.template, 'Minimal')
    assert.equal(selected.accentColor, 'sky')
    assert.equal(selected.mode, 'transparent')
    assert.deepEqual(selected.visibility, customized.visibility)
  })

  test('trocar para Clean corrige automaticamente uma cor de texto incompatível', () => {
    const selected = selectTemplate(defaultAppearance, 'Clean')
    assert.equal(selected.textColor, 'dark')
  })

  test('restaurar cores aplica os valores originais do template atual', () => {
    const customized = { ...selectTemplate(defaultAppearance, 'Clean'), accentColor: 'pink' as const, textColor: 'espresso' as const }
    const restored = resetTemplateColors(customized)

    assert.equal(restored.accentColor, templateDefaults.Clean.accentColor)
    assert.equal(restored.textColor, templateDefaults.Clean.textColor)
  })
})

describe('histórico do editor', () => {
  test('desfaz e refaz uma alteração de cor', () => {
    const initial = createEditorHistory()
    const changedState = {
      ...initial.present,
      appearance: { ...initial.present.appearance, accentColor: 'pink' as const },
    }
    const changed = editorHistoryReducer(initial, { type: 'update', next: changedState })
    const undone = editorHistoryReducer(changed, { type: 'undo' })
    const redone = editorHistoryReducer(undone, { type: 'redo' })

    assert.equal(undone.present.appearance.accentColor, 'orange')
    assert.equal(redone.present.appearance.accentColor, 'pink')
  })

  test('uma alteração divergente invalida o histórico futuro', () => {
    const initial = createEditorHistory()
    const changed = editorHistoryReducer(initial, {
      type: 'update',
      next: { ...initial.present, appearance: { ...initial.present.appearance, accentColor: 'sky' } },
    })
    const undone = editorHistoryReducer(changed, { type: 'undo' })
    const divergent = editorHistoryReducer(undone, {
      type: 'update',
      next: { ...undone.present, activity: { ...undone.present.activity, title: 'Nova corrida' } },
    })

    assert.equal(divergent.future.length, 0)
    assert.equal(editorHistoryReducer(divergent, { type: 'redo' }).present.activity.title, 'Nova corrida')
  })

  test('agrupa uma sequência de digitação até o fim da sessão de foco', () => {
    const initial = createEditorHistory()
    const first = editorHistoryReducer(initial, {
      type: 'update',
      group: 'activity.title',
      next: { ...initial.present, activity: { ...initial.present.activity, title: 'T' } },
    })
    const second = editorHistoryReducer(first, {
      type: 'update',
      group: 'activity.title',
      next: { ...first.present, activity: { ...first.present.activity, title: 'Treino' } },
    })

    assert.equal(second.past.length, 1)
    assert.equal(editorHistoryReducer(second, { type: 'undo' }).present.activity.title, 'Corrida de domingo')
  })

  test('trocar template e desfazer preserva os dados da corrida', () => {
    const initial = createEditorHistory()
    const changed = editorHistoryReducer(initial, {
      type: 'update',
      next: { ...initial.present, appearance: selectTemplate(initial.present.appearance, 'Clean') },
    })
    const undone = editorHistoryReducer(changed, { type: 'undo' })

    assert.equal(undone.present.appearance.template, 'Performance')
    assert.deepEqual(undone.present.activity, initial.present.activity)
  })

  test('desfazer distância restaura também o pace derivado', () => {
    const initial = createEditorHistory()
    const changed = editorHistoryReducer(initial, {
      type: 'update',
      next: { ...initial.present, activity: { ...initial.present.activity, distance: '5' } },
    })
    const undone = editorHistoryReducer(changed, { type: 'undo' })
    const calculation = calculateAveragePace(undone.present.activity.distance, undone.present.activity.duration)

    assert.equal(calculation.ok, true)
    if (calculation.ok) assert.equal(formatPace(calculation.paceSeconds), '5:28')
  })

  test('limita o histórico para evitar crescimento indefinido', () => {
    let history = createEditorHistory()
    for (let index = 0; index < HISTORY_LIMIT + 10; index += 1) {
      history = editorHistoryReducer(history, {
        type: 'update',
        next: { ...history.present, activity: { ...history.present.activity, title: `Corrida ${index}` } },
      })
    }
    assert.equal(history.past.length, HISTORY_LIMIT)
  })
})

describe('rascunhos e restauração', () => {
  test('serializa e recupera dados e personalização com versão explícita', () => {
    const state = createDefaultEditorState()
    state.activity.distance = '2,5'
    state.appearance = selectTemplate({ ...state.appearance, accentColor: 'green' }, 'Minimal')
    const serialized = serializeDraft(state)
    const recovered = parseDraft(serialized)

    assert.equal(JSON.parse(serialized).version, DRAFT_VERSION)
    assert.equal(recovered.ok, true)
    if (recovered.ok) assert.deepEqual(recovered.state, state)
    assert.equal(Object.hasOwn(JSON.parse(serialized).editor, 'pace'), false)
  })

  test('migra rascunho da versão 1 como edição manual', () => {
    const state = createDefaultEditorState()
    const legacy = JSON.stringify({ version: 1, editor: { activity: state.activity, appearance: state.appearance } })
    const recovered = parseDraft(legacy)
    assert.equal(recovered.ok, true)
    if (recovered.ok) assert.deepEqual(recovered.state.provenance, { kind: 'manual' })
  })

  test('recusa JSON corrompido, versão incompatível e estrutura inválida', () => {
    assert.equal(parseDraft('{').ok, false)
    assert.equal(parseDraft(JSON.stringify({ version: DRAFT_VERSION + 1, editor: {} })).ok, false)
    assert.equal(parseDraft(JSON.stringify({ version: DRAFT_VERSION, editor: { activity: {}, appearance: {} } })).ok, false)

    const emptySticker = createDefaultEditorState()
    emptySticker.activity.heartRate = ''
    emptySticker.activity.elevation = ''
    emptySticker.appearance.visibility = {
      distance: false,
      duration: false,
      pace: false,
      heartRate: true,
      elevation: true,
    }
    assert.equal(parseDraft(serializeDraft(emptySticker)).ok, false)
  })

  test('restaurar aparência preserva os dados manuais', () => {
    const state = createDefaultEditorState()
    state.activity.title = 'Longão'
    state.appearance = { ...state.appearance, accentColor: 'pink', template: 'Minimal' }
    const restored = restoreDefaultAppearance(state)

    assert.equal(restored.activity.title, 'Longão')
    assert.deepEqual(restored.appearance, createDefaultEditorState().appearance)
  })
})

describe('visibilidade e textos opcionais', () => {
  test('ocultar e reexibir uma métrica preserva as demais configurações', () => {
    const hidden = setMetricVisibility(defaultAppearance, 'pace', false, ['distance', 'duration', 'pace'])
    assert.equal(hidden.blocked, false)
    assert.equal(hidden.appearance.visibility.pace, false)

    const visible = setMetricVisibility(hidden.appearance, 'pace', true, ['distance', 'duration', 'pace'])
    assert.equal(visible.appearance.visibility.pace, true)
  })

  test('impede ocultar a última métrica disponível', () => {
    const onlyDistance = {
      ...defaultAppearance,
      visibility: { ...defaultAppearance.visibility, duration: false, pace: false },
    }
    const result = setMetricVisibility(onlyDistance, 'distance', false, ['distance'])

    assert.equal(result.blocked, true)
    assert.equal(result.appearance.visibility.distance, true)
  })

  test('formata a data apenas quando ela foi informada no formato esperado', () => {
    assert.equal(formatActivityDate('2026-11-15'), '15/11/2026')
    assert.equal(formatActivityDate(''), undefined)
  })
})
