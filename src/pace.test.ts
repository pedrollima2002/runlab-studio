import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import {
  calculateAveragePace,
  formatDistance,
  formatPace,
  parseDistanceKm,
  parseDurationSeconds,
} from './pace.ts'

describe('cálculo do ritmo médio', () => {
  const cases = [
    ['10', '54:40', '5:28'],
    ['5', '25:00', '5:00'],
    ['2,5', '12:30', '5:00'],
    ['10', '1:00:00', '6:00'],
  ] as const

  for (const [distance, duration, expectedPace] of cases) {
    test(`${distance} km em ${duration} resulta em ${expectedPace}/km`, () => {
      const result = calculateAveragePace(distance, duration)

      assert.equal(result.ok, true)
      if (result.ok) assert.equal(formatPace(result.paceSeconds), expectedPace)
    })
  }
})

describe('validação e formatos', () => {
  test('aceita vírgula ou ponto como separador decimal', () => {
    assert.equal(parseDistanceKm('2,5'), 2.5)
    assert.equal(parseDistanceKm('2.5'), 2.5)
    assert.equal(formatDistance(2.5), '2,50')
  })

  test('aceita MM:SS e H:MM:SS', () => {
    assert.equal(parseDurationSeconds('90:05'), 5405)
    assert.equal(parseDurationSeconds('1:30:05'), 5405)
  })

  test('rejeita distância zero, negativa, textual ou vazia', () => {
    for (const distance of ['0', '-1', 'dez', '']) {
      assert.equal(parseDistanceKm(distance), null)
    }
  })

  test('rejeita tempos inválidos, textuais ou zerados', () => {
    for (const duration of ['25:60', '1:60:00', '1:00:60', '25', 'abc', '0:00', '']) {
      assert.equal(parseDurationSeconds(duration), null)
    }
  })

  test('informa os dois campos inválidos sem calcular o ritmo', () => {
    assert.deepEqual(calculateAveragePace('0', 'tempo'), {
      ok: false,
      distanceError: 'Informe uma distância maior que zero, usando apenas números.',
      durationError: 'Use MM:SS ou H:MM:SS, com minutos e segundos válidos.',
    })
  })
})
