import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import {
  defaultAppearance,
  formatActivityDate,
  resetTemplateColors,
  selectTemplate,
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
