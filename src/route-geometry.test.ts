import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { normalizeFit } from './activity-fit.ts'
import { normalizeActivity } from './activity-normalization.ts'
import { parseTcxActivity } from './activity-tcx.ts'
import type { ActivityCandidate, NormalizedActivity } from './activity-types.ts'
import { createRouteDrawing, extractActivityRoute, haversineMeters, type ActivityRoute, type RoutePoint } from './route-geometry.ts'

function activity(samples: ActivityCandidate['samples'], format: 'fit' | 'tcx' = 'fit'): NormalizedActivity {
  return normalizeActivity({ format, fileName: `sintetico.${format}`, samples, availableFields: ['GPS'] })
}

function sample(latitude: number, longitude: number, seconds: number, segmentId?: string) {
  return { timestamp: new Date(Date.UTC(2026, 0, 1, 0, 0, seconds)), position: { latitude, longitude }, segmentId }
}

function route(segments: Array<Array<[number, number]>>): ActivityRoute {
  const points = segments.map((segment) => segment.map(([latitude, longitude], index): RoutePoint => ({
    latitude, longitude, timestamp: new Date(Date.UTC(2026, 0, 1, 0, 0, index)).toISOString(),
  })))
  return { format: 'fit', segments: points, originalPointCount: points.flat().length, warnings: [] }
}

const tcx = (tracks: string) => `<?xml version="1.0"?><TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2"><Activities><Activity Sport="Running"><Id>2026-01-01T00:00:00Z</Id><Lap StartTime="2026-01-01T00:00:00Z"><TotalTimeSeconds>60</TotalTimeSeconds><DistanceMeters>100</DistanceMeters>${tracks}</Lap></Activity></Activities></TrainingCenterDatabase>`
const point = (time: string, latitude?: number, longitude?: number) => `<Trackpoint><Time>${time}</Time>${latitude === undefined ? '' : `<Position><LatitudeDegrees>${latitude}</LatitudeDegrees><LongitudeDegrees>${longitude}</LongitudeDegrees></Position>`}</Trackpoint>`

describe('Etapa 4D · importação FIT', () => {
  it('T01 extrai posições GPS válidas', () => {
    const extracted = extractActivityRoute(activity([sample(-23.55, -46.63, 0), sample(-23.551, -46.631, 10)]))
    assert.equal(extracted?.originalPointCount, 2)
  })

  it('T02 converte semicircles somente quando necessário', () => {
    const semicircle = 45 / 180 * 2 ** 31
    const normalized = normalizeFit({ records: [
      { timestamp: new Date('2026-01-01T00:00:00Z'), position_lat: semicircle, position_long: semicircle },
      { timestamp: new Date('2026-01-01T00:00:10Z'), position_lat: semicircle + 10_000, position_long: semicircle + 10_000 },
    ] } as never, 'semicircle.fit')
    assert.ok(Math.abs(normalized.samples[0].position!.latitude - 45) < .000001)
  })

  it('T03 não converte novamente coordenadas em graus', () => {
    const normalized = normalizeFit({ records: [
      { timestamp: new Date('2026-01-01T00:00:00Z'), position_lat: -23.55, position_long: -46.63 },
      { timestamp: new Date('2026-01-01T00:00:10Z'), position_lat: -23.551, position_long: -46.631 },
    ] } as never, 'graus.fit')
    assert.deepEqual(normalized.samples[0].position, { latitude: -23.55, longitude: -46.63 })
  })

  it('T04 aceita FIT sem GPS', () => assert.equal(extractActivityRoute(activity([{ timestamp: new Date('2026-01-01T00:00:00Z') }])), null))

  it('T05 ignora registros sem posição', () => {
    const extracted = extractActivityRoute(activity([sample(1, 1, 0), { timestamp: new Date('2026-01-01T00:00:05Z') }, sample(1.001, 1.001, 10)]))
    assert.equal(extracted?.originalPointCount, 2)
  })

  it('T06 preserva segmentos válidos', () => {
    const extracted = extractActivityRoute(activity([sample(1, 1, 0, 'a'), sample(1.001, 1.001, 10, 'a'), sample(2, 2, 20, 'b'), sample(2.001, 2.001, 30, 'b')]))
    assert.equal(extracted?.segments.length, 2)
  })
})

describe('Etapa 4D · importação TCX', () => {
  it('T07 extrai coordenadas dos Trackpoints', () => {
    const parsed = parseTcxActivity(tcx(`<Track>${point('2026-01-01T00:00:00Z', -23, -46)}${point('2026-01-01T00:00:10Z', -23.001, -46.001)}</Track>`), 'rota.tcx')
    assert.equal(extractActivityRoute(parsed)?.originalPointCount, 2)
  })

  it('T08 trata namespaces XML', () => {
    const parsed = parseTcxActivity(tcx(`<Track>${point('2026-01-01T00:00:00Z', 1, 1)}${point('2026-01-01T00:00:10Z', 1.001, 1.001)}</Track>`), 'namespace.tcx')
    assert.equal(parsed.source.format, 'tcx')
  })

  it('T09 aceita TCX sem GPS', () => {
    const parsed = parseTcxActivity(tcx(`<Track>${point('2026-01-01T00:00:00Z')}${point('2026-01-01T00:00:10Z')}</Track>`), 'esteira.tcx')
    assert.equal(extractActivityRoute(parsed), null)
  })

  it('T10 preserva múltiplos laps', () => {
    const xml = tcx(`<Track>${point('2026-01-01T00:00:00Z', 1, 1)}${point('2026-01-01T00:00:10Z', 1.001, 1.001)}</Track>`).replace('</Activity>', `<Lap StartTime="2026-01-01T00:01:00Z"><TotalTimeSeconds>60</TotalTimeSeconds><DistanceMeters>100</DistanceMeters><Track>${point('2026-01-01T00:01:00Z', 2, 2)}${point('2026-01-01T00:01:10Z', 2.001, 2.001)}</Track></Lap></Activity>`)
    assert.equal(extractActivityRoute(parseTcxActivity(xml, 'laps.tcx'))?.segments.length, 2)
  })

  it('T11 não conecta Tracks desconectados', () => {
    const parsed = parseTcxActivity(tcx(`<Track>${point('2026-01-01T00:00:00Z', 1, 1)}${point('2026-01-01T00:00:10Z', 1.001, 1.001)}</Track><Track>${point('2026-01-01T00:00:20Z', 10, 10)}${point('2026-01-01T00:00:30Z', 10.001, 10.001)}</Track>`), 'tracks.tcx')
    assert.equal(extractActivityRoute(parsed)?.segments.length, 2)
  })
})

describe('Etapa 4D · validação e geometria', () => {
  it('T12 rejeita latitude e longitude fora dos limites', () => {
    const extracted = extractActivityRoute(activity([sample(91, 0, 0), sample(0, 181, 10), sample(1, 1, 20), sample(1.001, 1.001, 30)]))
    assert.equal(extracted?.originalPointCount, 2)
  })

  it('T13 preserva coordenadas zero válidas', () => assert.equal(extractActivityRoute(activity([sample(0, 0, 0), sample(.001, 0, 10)]))?.originalPointCount, 2))

  it('T14 remove pontos duplicados', () => {
    const extracted = extractActivityRoute(activity([sample(1, 1, 0), sample(1, 1, 5), sample(1.001, 1.001, 10)]))
    assert.equal(extracted?.originalPointCount, 2)
    assert.match(extracted?.warnings[0] ?? '', /duplicado/)
  })

  it('T15 separa saltos GPS anômalos', () => {
    const extracted = extractActivityRoute(activity([sample(1, 1, 0), sample(1.001, 1.001, 10), sample(40, 40, 20), sample(40.001, 40.001, 30)]))
    assert.equal(extracted?.segments.length, 2)
  })

  it('T16 preserva proporções com escala única', () => {
    const drawing = createRouteDrawing(route([[[0, 0], [.01, .02]]]))!
    const numbers = drawing.paths[0].match(/-?\d+(?:\.\d+)?/g)!.map(Number)
    assert.ok(Math.abs(numbers[2] - numbers[0]) > Math.abs(numbers[3] - numbers[1]))
  })

  it('T17 centraliza o trajeto', () => {
    const drawing = createRouteDrawing(route([[[10, 10], [10.01, 10.02]]]))!
    const values = drawing.paths[0].match(/-?\d+(?:\.\d+)?/g)!.map(Number)
    assert.ok(Math.abs((values[0] + values[2]) / 2 - 125) < .1)
    assert.ok(Math.abs((values[1] + values[3]) / 2 - 90) < .1)
  })

  it('T18 mantém margens e evita cortes', () => {
    const values = createRouteDrawing(route([[[0, 0], [.01, .02], [.02, .01]]]))!.paths.join(' ').match(/-?\d+(?:\.\d+)?/g)!.map(Number)
    assert.ok(values.every((value, index) => index % 2 ? value >= 12 && value <= 168 : value >= 12 && value <= 238))
  })

  it('T19 trata trajetos horizontais e verticais', () => {
    assert.ok(createRouteDrawing(route([[[0, 0], [0, .01]]]))?.paths.length)
    assert.ok(createRouteDrawing(route([[[0, 0], [.01, 0]]]))?.paths.length)
  })

  it('T20 exige ao menos dois pontos válidos', () => assert.equal(extractActivityRoute(activity([sample(1, 1, 0)])), null))

  it('T21 limita a geometria simplificada de milhares de pontos', () => {
    const points: Array<[number, number]> = Array.from({ length: 10_000 }, (_, index) => [index / 1_000_000, index / 1_000_000 + Math.sin(index / 100) / 100_000])
    const drawing = createRouteDrawing(route([points]))!
    assert.ok(drawing.simplifiedPointCount <= 1_001)
  })

  it('T22 trata o antimeridiano pelo caminho curto', () => {
    const drawing = createRouteDrawing(route([[[0, 179.9], [.01, -179.9]]]))!
    assert.ok(drawing.paths.length === 1)
    assert.ok(haversineMeters({ latitude: 0, longitude: 179.9 }, { latitude: .01, longitude: -179.9 }) < 30_000)
  })

  it('T33 recorta início e fim por distância', () => {
    const source = route([[[0, 0], [.001, .002], [-.001, .008], [0, .01]]])
    const original = createRouteDrawing(source, 0)!
    const trimmed = createRouteDrawing(source, 100)!
    assert.notDeepEqual(trimmed.paths, original.paths)
    assert.equal(trimmed.trimmed, true)
  })

  it('avisa quando o recorte removeria um trajeto curto', () => {
    const drawing = createRouteDrawing(route([[[0, 0], [0, .001]]]), 100)!
    assert.equal(drawing.paths.length, 0)
    assert.match(drawing.warning ?? '', /curto demais/)
  })
})
