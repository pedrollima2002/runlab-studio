import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { ParsedFit } from 'fit-file-parser'
import { normalizeFit } from './activity-fit.ts'
import { calculateImportedPace, normalizeActivity } from './activity-normalization.ts'
import { MAX_ACTIVITY_FILE_BYTES, validateActivityFileMetadata } from './activity-import-policy.ts'
import { parseActivityBuffer } from './activity-parse.ts'
import { parseTcxActivity } from './activity-tcx.ts'

const fitReferenceBase64 = 'DiDEUqYAAAAuRklUt11AAAAAAAMAAQABAoQEBIYABAEAwFJcRUEAABQABv0EhgAEhQEEhQIChAMBAgUEhgHAUlxFdNpA739E196gD4wAAAAAAShZXEV9rELvhxbZ3tIPmyChBwABkF9cRYV+RO+Q6NreuQ+qQEIPAEIAABIACf0EhgIEhgUBAAcEhggEhgkEhhABAhEBAhYChAKQX1xFwFJcRQGADDIAgAwyAEBCDwCbqlQApfQ='
const fitAuditBase64 = 'DiDEUo0AAAAuRklU9PZAAAAAAAMAAQABAoQEBIYABAEAnBVcRUEAABQABP0EhgIChAMBAgUEhgGcFVxFuhOWAAAAAAGRIlxFFBSoGBkQAAGGL1xFxBO3MDIgAEIAABIACv0EhgIEhgUBAAcEhggEhgkEhhABAhEBAhYChBcChAKGL1xFnBVcRQEQOmUAEDplADAyIACotyQAIgBkrw=='

const tcxReference = `<?xml version="1.0" encoding="UTF-8"?>
<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2">
  <Activities><Activity Sport="Running">
    <Id>2026-11-15T12:00:00Z</Id>
    <Lap StartTime="2026-11-15T12:00:00Z">
      <TotalTimeSeconds>1640</TotalTimeSeconds><DistanceMeters>5000</DistanceMeters>
      <AverageHeartRateBpm><Value>150</Value></AverageHeartRateBpm><MaximumHeartRateBpm><Value>160</Value></MaximumHeartRateBpm>
      <Track><Trackpoint><Time>2026-11-15T12:00:00Z</Time><Position><LatitudeDegrees>-23.55</LatitudeDegrees><LongitudeDegrees>-46.63</LongitudeDegrees></Position><AltitudeMeters>300</AltitudeMeters><DistanceMeters>0</DistanceMeters><HeartRateBpm><Value>140</Value></HeartRateBpm></Trackpoint>
      <Trackpoint><Time>2026-11-15T12:27:20Z</Time><Position><LatitudeDegrees>-23.54</LatitudeDegrees><LongitudeDegrees>-46.62</LongitudeDegrees></Position><AltitudeMeters>310</AltitudeMeters><DistanceMeters>5000</DistanceMeters><HeartRateBpm><Value>155</Value></HeartRateBpm></Trackpoint></Track>
    </Lap>
    <Lap StartTime="2026-11-15T12:27:20Z">
      <TotalTimeSeconds>1640</TotalTimeSeconds><DistanceMeters>5000</DistanceMeters>
      <AverageHeartRateBpm><Value>160</Value></AverageHeartRateBpm><MaximumHeartRateBpm><Value>170</Value></MaximumHeartRateBpm>
      <Track><Trackpoint><Time>2026-11-15T12:54:40Z</Time><Position><LatitudeDegrees>-23.53</LatitudeDegrees><LongitudeDegrees>-46.61</LongitudeDegrees></Position><AltitudeMeters>305</AltitudeMeters><DistanceMeters>10000</DistanceMeters><HeartRateBpm><Value>170</Value></HeartRateBpm></Trackpoint></Track>
    </Lap>
  </Activity></Activities>
</TrainingCenterDatabase>`

const tcxWithoutOptionalData = `<?xml version="1.0"?>
<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2"><Activities><Activity Sport="Running">
<Id>2026-11-15T12:00:00Z</Id><Lap StartTime="2026-11-15T12:00:00Z"><TotalTimeSeconds>1500</TotalTimeSeconds><DistanceMeters>5000</DistanceMeters>
<Track><Trackpoint><Time>2026-11-15T12:00:00Z</Time><DistanceMeters>0</DistanceMeters></Trackpoint><Trackpoint><Time>2026-11-15T12:25:00Z</Time><DistanceMeters>5000</DistanceMeters></Trackpoint></Track>
</Lap></Activity></Activities></TrainingCenterDatabase>`

function fitBuffer(): ArrayBuffer {
  return Uint8Array.from(Buffer.from(fitReferenceBase64, 'base64')).buffer
}

function auditFitBuffer(): ArrayBuffer {
  return Uint8Array.from(Buffer.from(fitAuditBase64, 'base64')).buffer
}

function parsedFit(parts: Partial<ParsedFit>): ParsedFit {
  return { protocolVersion: 2, profileVersion: 100, user_profile: {}, activity: { timestamp: '2026-11-15T00:00:00Z' }, ...parts } as ParsedFit
}

function tcxBuffer(value = tcxReference): ArrayBuffer {
  return new TextEncoder().encode(value).buffer
}

describe('importação FIT e TCX', () => {
  it('T1 importa FIT válido com CRC e métricas de referência', async () => {
    const activity = await parseActivityBuffer('fit', fitBuffer(), 'referencia.fit')
    assert.equal(activity.source.format, 'fit')
    assert.equal(activity.metrics.distanceMeters.value, 10_000)
    assert.equal(activity.metrics.timerSeconds.value, 3_280)
    assert.equal(activity.metrics.paceSecondsPerKilometer.value, 328)
    assert.equal(activity.metrics.averageHeartRateBpm.value, 155)
    assert.equal(activity.metrics.maximumHeartRateBpm.value, 170)
    assert.equal(activity.metrics.ascentMeters.value, 84)
    assert.equal(activity.metrics.descentMeters.value, null)
    assert.equal(activity.samples.filter((sample) => sample.position).length, 3)
  })

  it('T2 importa TCX válido com voltas e trackpoints', async () => {
    const activity = await parseActivityBuffer('tcx', tcxBuffer(), 'referencia.tcx')
    assert.equal(activity.source.format, 'tcx')
    assert.equal(activity.laps.length, 2)
    assert.equal(activity.samples.length, 3)
    assert.equal(activity.metrics.distanceMeters.value, 10_000)
    assert.equal(activity.metrics.timerSeconds.value, 3_280)
  })

  it('T3 rejeita conteúdo incompatível mesmo com formato declarado', async () => {
    await assert.rejects(parseActivityBuffer('fit', tcxBuffer(), 'falso.fit'), /assinatura FIT válida/)
  })

  it('T4 rejeita FIT corrompido sem aceitar CRC inválido', async () => {
    const bytes = new Uint8Array(fitBuffer())
    bytes[bytes.length - 1] ^= 0xff
    await assert.rejects(parseActivityBuffer('fit', bytes.buffer, 'corrompido.fit'), /corrompido|compatível/i)
  })

  it('T5 e T6 rejeita arquivo vazio e arquivo acima de 20 MB', () => {
    assert.throws(() => validateActivityFileMetadata({ name: 'vazio.fit', size: 0 }), /vazio/)
    assert.throws(() => validateActivityFileMetadata({ name: 'grande.tcx', size: MAX_ACTIVITY_FILE_BYTES + 1 }), /20 MB/)
  })

  it('T7 e T8 importa atividade sem GPS e sem frequência cardíaca', () => {
    const activity = parseTcxActivity(tcxWithoutOptionalData, 'sem-opcionais.tcx')
    assert.ok(activity.samples.every((sample) => sample.position === undefined))
    assert.equal(activity.metrics.averageHeartRateBpm.value, null)
    assert.equal(activity.metrics.maximumHeartRateBpm.value, null)
    assert.equal(activity.metrics.ascentMeters.value, null)
    assert.equal(activity.metrics.descentMeters.value, null)
    assert.doesNotMatch(activity.source.availableFields.join(','), /GPS|frequência/)
  })

  it('rejeita DTD e entidades externas em TCX', () => {
    const unsafe = `<?xml version="1.0"?><!DOCTYPE x [<!ENTITY route SYSTEM "file:///etc/passwd">]><TrainingCenterDatabase><Activities><Activity Sport="Running"><Id>&route;</Id></Activity></Activities></TrainingCenterDatabase>`
    assert.throws(() => parseTcxActivity(unsafe, 'inseguro.tcx'), /DOCTYPE|entidades/)
  })
})

describe('cálculos e normalização da atividade', () => {
  it('T9 calcula 10 km em 54:40 como 5:28 por km', () => {
    assert.equal(calculateImportedPace(54 * 60 + 40, 10_000), 328)
  })

  it('T10 calcula 5 km em 25:00 como 5:00 por km', () => {
    assert.equal(calculateImportedPace(25 * 60, 5_000), 300)
  })

  it('T11 não divide por distância zero', () => {
    assert.equal(calculateImportedPace(1_500, 0), null)
    assert.equal(calculateImportedPace(0, 5_000), null)
  })

  it('T12 ordena timestamps e nunca produz duração negativa', () => {
    const activity = normalizeActivity({
      format: 'tcx', fileName: 'fora-de-ordem.tcx',
      samples: [{ timestamp: '2026-11-15T12:10:00Z' }, { timestamp: '2026-11-15T12:00:00Z' }],
    })
    assert.equal(activity.metrics.elapsedSeconds.value, 600)
    assert.match(activity.warnings.join(' '), /fora de ordem/)
  })

  it('consolida timestamps duplicados sem somar duração', () => {
    const activity = normalizeActivity({
      format: 'tcx', fileName: 'duplicado.tcx',
      samples: [
        { timestamp: '2026-11-15T12:00:00Z', distanceMeters: 0 },
        { timestamp: '2026-11-15T12:00:00Z', heartRateBpm: 140 },
        { timestamp: '2026-11-15T12:10:00Z', distanceMeters: 2_000 },
      ],
    })
    assert.equal(activity.samples.length, 2)
    assert.equal(activity.samples[0].heartRateBpm, 140)
    assert.equal(activity.metrics.elapsedSeconds.value, 600)
    assert.match(activity.warnings.join(' '), /duplicados/)
  })

  it('T13 não inventa tempo em movimento sem fonte explícita', () => {
    const activity = normalizeActivity({
      format: 'tcx', fileName: 'sem-pausa.tcx', distance: { value: 5_000, source: 'tcx-laps' }, timer: { value: 1_500, source: 'tcx-laps' },
    })
    assert.equal(activity.metrics.movingSeconds.value, null)
    assert.equal(activity.metrics.timerSeconds.value, 1_500)
  })

  it('T14 descarta valores inválidos em vez de exibir medições', () => {
    const activity = normalizeActivity({
      format: 'fit', fileName: 'invalidos.fit',
      distance: { value: -10, source: 'fit-session' }, timer: { value: Number.POSITIVE_INFINITY, source: 'fit-session' },
      averageHeartRate: { value: 0, source: 'fit-session' }, maximumHeartRate: { value: 999, source: 'fit-session' },
    })
    assert.equal(activity.metrics.distanceMeters.value, null)
    assert.equal(activity.metrics.timerSeconds.value, null)
    assert.equal(activity.metrics.paceSecondsPerKilometer.value, null)
    assert.equal(activity.metrics.averageHeartRateBpm.value, null)
  })

  it('T15 duração independe do fuso representado nos timestamps', () => {
    const utc = normalizeActivity({ format: 'tcx', fileName: 'utc.tcx', samples: [{ timestamp: '2026-11-15T12:00:00Z' }, { timestamp: '2026-11-15T13:00:00Z' }] })
    const offset = normalizeActivity({ format: 'tcx', fileName: 'offset.tcx', samples: [{ timestamp: '2026-11-15T09:00:00-03:00' }, { timestamp: '2026-11-15T10:00:00-03:00' }] })
    assert.equal(utc.metrics.elapsedSeconds.value, 3_600)
    assert.equal(offset.metrics.elapsedSeconds.value, 3_600)
  })

  it('T16 FIT e TCX equivalentes geram as mesmas métricas básicas', async () => {
    const [fit, tcx] = await Promise.all([
      parseActivityBuffer('fit', fitBuffer(), 'referencia.fit'),
      parseActivityBuffer('tcx', tcxBuffer(), 'referencia.tcx'),
    ])
    assert.equal(fit.metrics.distanceMeters.value, tcx.metrics.distanceMeters.value)
    assert.equal(fit.metrics.timerSeconds.value, tcx.metrics.timerSeconds.value)
    assert.equal(fit.metrics.paceSecondsPerKilometer.value, tcx.metrics.paceSecondsPerKilometer.value)
    assert.equal(fit.metrics.averageHeartRateBpm.value, tcx.metrics.averageHeartRateBpm.value)
    assert.equal(fit.metrics.maximumHeartRateBpm.value, tcx.metrics.maximumHeartRateBpm.value)
  })

  it('marca divergência relevante entre resumo e amostras sem substituir o resumo', () => {
    const activity = normalizeActivity({
      format: 'fit', fileName: 'divergente.fit', distance: { value: 10_000, source: 'fit-session' },
      samples: [{ timestamp: '2026-11-15T12:00:00Z', distanceMeters: 0 }, { timestamp: '2026-11-15T13:00:00Z', distanceMeters: 9_500 }],
    })
    assert.equal(activity.metrics.distanceMeters.value, 10_000)
    assert.equal(activity.metrics.distanceMeters.status, 'inconsistent')
    assert.match(activity.warnings.join(' '), /diverge/)
  })
})

describe('auditoria 4A · elevação FIT', () => {
  it('T1 e T2 extrai 36 m de subida e 34 m de descida da sessão', async () => {
    const activity = await parseActivityBuffer('fit', auditFitBuffer(), 'auditoria.fit')
    assert.equal(activity.metrics.ascentMeters.value, 36)
    assert.equal(activity.metrics.ascentMeters.source, 'fit-session')
    assert.equal(activity.metrics.descentMeters.value, 34)
    assert.equal(activity.metrics.descentMeters.source, 'fit-session')
  })

  it('T3 preserva subida e descida iguais a zero como valores disponíveis', () => {
    const activity = normalizeFit(parsedFit({
      sessions: [{ start_time: new Date('2026-11-15T12:00:00Z'), timestamp: new Date('2026-11-15T12:10:00Z'), total_distance: 2_000, total_timer_time: 600, total_ascent: 0, total_descent: 0 }],
    }), 'plano.fit')
    assert.deepEqual(activity.metrics.ascentMeters, { value: 0, status: 'available', source: 'fit-session' })
    assert.deepEqual(activity.metrics.descentMeters, { value: 0, status: 'available', source: 'fit-session' })
  })

  it('T4 mantém subida e descida ausentes quando não há resumo confiável', () => {
    const activity = normalizeFit(parsedFit({ sessions: [{ total_distance: 2_000, total_timer_time: 600 }] }), 'sem-elevacao.fit')
    assert.equal(activity.metrics.ascentMeters.value, null)
    assert.equal(activity.metrics.descentMeters.value, null)
  })

  it('T5 prioriza a sessão e não duplica os resumos das voltas', () => {
    const start = new Date('2026-11-15T12:00:00Z')
    const middle = new Date('2026-11-15T12:05:00Z')
    const end = new Date('2026-11-15T12:10:00Z')
    const activity = normalizeFit(parsedFit({
      sessions: [{ start_time: start, timestamp: end, total_distance: 2_000, total_timer_time: 600, total_ascent: 36, total_descent: 34, num_laps: 2 }],
      laps: [
        { start_time: start, timestamp: middle, total_distance: 1_000, total_timer_time: 300, total_ascent: 10, total_descent: 12 },
        { start_time: middle, timestamp: end, total_distance: 1_000, total_timer_time: 300, total_ascent: 26, total_descent: 22 },
      ],
    }), 'sessao-e-voltas.fit')
    assert.equal(activity.metrics.ascentMeters.value, 36)
    assert.equal(activity.metrics.descentMeters.value, 34)
    assert.equal(activity.metrics.ascentMeters.source, 'fit-session')
  })

  it('agrega voltas somente quando elas cobrem integralmente a sessão', () => {
    const start = new Date('2026-11-15T12:00:00Z')
    const middle = new Date('2026-11-15T12:05:00Z')
    const end = new Date('2026-11-15T12:10:00Z')
    const activity = normalizeFit(parsedFit({
      sessions: [{ start_time: start, timestamp: end, total_distance: 2_000, total_timer_time: 600, num_laps: 2 }],
      laps: [
        { start_time: start, timestamp: middle, total_distance: 1_000, total_timer_time: 300, total_ascent: 10, total_descent: 12 },
        { start_time: middle, timestamp: end, total_distance: 1_000, total_timer_time: 300, total_ascent: 26, total_descent: 22 },
      ],
    }), 'somente-voltas.fit')
    assert.equal(activity.metrics.ascentMeters.value, 36)
    assert.equal(activity.metrics.descentMeters.value, 34)
    assert.equal(activity.metrics.ascentMeters.source, 'fit-laps')
  })

  it('recusa agregar voltas com cobertura incompleta', () => {
    const activity = normalizeFit(parsedFit({
      sessions: [{ start_time: new Date('2026-11-15T12:00:00Z'), timestamp: new Date('2026-11-15T12:10:00Z'), total_distance: 2_000, total_timer_time: 600, num_laps: 2 }],
      laps: [{ start_time: new Date('2026-11-15T12:00:00Z'), timestamp: new Date('2026-11-15T12:05:00Z'), total_distance: 1_000, total_timer_time: 300, total_ascent: 10, total_descent: 12 }],
    }), 'voltas-incompletas.fit')
    assert.equal(activity.metrics.ascentMeters.value, null)
    assert.match(activity.warnings.join(' '), /não foi agregada/)
  })

  it('T6 seleciona uma sessão em FIT multissessão sem misturar elevação', () => {
    const activity = normalizeFit(parsedFit({ sessions: [
      { start_time: new Date('2026-11-15T10:00:00Z'), timestamp: new Date('2026-11-15T10:10:00Z'), sport: 'walking', total_distance: 1_000, total_timer_time: 600, total_ascent: 5, total_descent: 4 },
      { start_time: new Date('2026-11-15T12:00:00Z'), timestamp: new Date('2026-11-15T13:50:34Z'), sport: 'running', total_distance: 21_100, total_timer_time: 6_634, total_ascent: 36, total_descent: 34 },
    ] }), 'multissessao.fit')
    assert.equal(activity.sport, 'running')
    assert.equal(activity.metrics.distanceMeters.value, 21_100)
    assert.equal(activity.metrics.ascentMeters.value, 36)
    assert.equal(activity.metrics.descentMeters.value, 34)
  })

  it('T7 respeita escalas já normalizadas pelo parser FIT', async () => {
    const activity = await parseActivityBuffer('fit', auditFitBuffer(), 'escala.fit')
    assert.equal(activity.samples[0].altitudeMeters, 510)
    assert.equal(activity.metrics.ascentMeters.value, 36)
    assert.equal(activity.metrics.descentMeters.value, 34)
  })

  it('T8 ignora registros incompletos sem perder o resumo da sessão', () => {
    const activity = normalizeFit(parsedFit({
      sessions: [{ start_time: new Date('2026-11-15T12:00:00Z'), timestamp: new Date('2026-11-15T13:00:00Z'), total_distance: 10_000, total_timer_time: 3_600, total_ascent: 36, total_descent: 34 }],
      records: [{ distance: 1_000 }, { timestamp: new Date('invalid'), altitude: Number.NaN }],
    }), 'registros-incompletos.fit')
    assert.equal(activity.samples.length, 0)
    assert.equal(activity.metrics.ascentMeters.value, 36)
    assert.equal(activity.metrics.descentMeters.value, 34)
  })
})

describe('auditoria 4A · TCX e tempos', () => {
  it('T9 não transforma amostras de altitude TCX em elevação acumulada', () => {
    const activity = parseTcxActivity(tcxReference, 'altitude.tcx')
    assert.ok(activity.samples.some((sample) => sample.altitudeMeters !== undefined))
    assert.equal(activity.metrics.ascentMeters.value, null)
    assert.equal(activity.metrics.descentMeters.value, null)
    assert.match(activity.warnings.join(' '), /altitude absoluta/)
  })

  it('T10 e T11 importa TCX sem altitude e sem opcionais sem inventar valores', () => {
    const activity = parseTcxActivity(tcxWithoutOptionalData, 'basico.tcx')
    assert.ok(activity.samples.every((sample) => sample.altitudeMeters === undefined))
    assert.equal(activity.metrics.ascentMeters.value, null)
    assert.equal(activity.metrics.descentMeters.value, null)
    assert.equal(activity.metrics.averageHeartRateBpm.value, null)
    assert.equal(activity.metrics.movingSeconds.value, null)
  })

  it('T12 lê velocidade de extensão TCX reconhecida sem confundi-la com elevação', () => {
    const withSpeed = tcxWithoutOptionalData.replace(
      '<DistanceMeters>0</DistanceMeters></Trackpoint>',
      '<DistanceMeters>0</DistanceMeters><Extensions><TPX><Speed>3.5</Speed></TPX></Extensions></Trackpoint>',
    )
    const activity = parseTcxActivity(withSpeed, 'extensao.tcx')
    assert.equal(activity.samples[0].speedMetersPerSecond, 3.5)
    assert.equal(activity.metrics.ascentMeters.value, null)
  })

  it('T13 preserva tempos decorrido e de cronômetro iguais', async () => {
    const activity = await parseActivityBuffer('fit', auditFitBuffer(), 'tempos-iguais.fit')
    assert.equal(activity.metrics.elapsedSeconds.value, 6_634)
    assert.equal(activity.metrics.timerSeconds.value, 6_634)
  })

  it('T14 preserva tempo decorrido maior que o cronômetro', () => {
    const activity = normalizeActivity({
      format: 'fit', fileName: 'pausado.fit', distance: { value: 10_000, source: 'fit-session' },
      elapsed: { value: 3_900, source: 'fit-session' }, timer: { value: 3_600, source: 'fit-session' },
    })
    assert.equal(activity.metrics.elapsedSeconds.value, 3_900)
    assert.equal(activity.metrics.timerSeconds.value, 3_600)
    assert.equal(activity.metrics.paceSecondsPerKilometer.value, 360)
  })

  it('T15 preserva pausa e retomada sem inventar tempo em movimento', () => {
    const activity = normalizeFit(parsedFit({
      sessions: [{ start_time: new Date('2026-11-15T12:00:00Z'), timestamp: new Date('2026-11-15T13:05:00Z'), total_distance: 10_000, total_elapsed_time: 3_900, total_timer_time: 3_600 }],
      events: [
        { timestamp: new Date('2026-11-15T12:00:00Z'), event: 'timer', event_type: 'start' },
        { timestamp: new Date('2026-11-15T12:30:00Z'), event: 'timer', event_type: 'stop_all' },
        { timestamp: new Date('2026-11-15T12:35:00Z'), event: 'timer', event_type: 'start' },
      ],
    }), 'eventos.fit')
    assert.equal(activity.metrics.elapsedSeconds.value, 3_900)
    assert.equal(activity.metrics.timerSeconds.value, 3_600)
    assert.equal(activity.metrics.movingSeconds.value, null)
    assert.match(activity.warnings.join(' '), /não são usados para inventar/)
  })

  it('T16 e T17 sem eventos ou métrica independente mantém movimento ausente', async () => {
    const activity = await parseActivityBuffer('fit', auditFitBuffer(), 'sem-movimento.fit')
    assert.equal(activity.metrics.movingSeconds.value, null)
    assert.equal(activity.metrics.timerSeconds.value, 6_634)
  })

  it('T18 aceita tempo em movimento somente quando explicitamente disponível', () => {
    const activity = normalizeFit(parsedFit({ sessions: [{ total_distance: 10_000, total_elapsed_time: 3_900, total_timer_time: 3_600, total_moving_time: 3_500 }] }), 'movimento-explicito.fit')
    assert.equal(activity.metrics.movingSeconds.value, 3_500)
    assert.equal(activity.metrics.movingSeconds.source, 'fit-session')
  })

  it('T19 e T20 trata timestamps inválidos, duplicados e fora de ordem sem duração negativa', () => {
    const activity = normalizeActivity({ format: 'tcx', fileName: 'timestamps.tcx', samples: [
      { timestamp: '2026-11-15T12:10:00Z', distanceMeters: 2_000 },
      { timestamp: 'sem-data' },
      { timestamp: '2026-11-15T12:00:00Z', distanceMeters: 0 },
      { timestamp: '2026-11-15T12:00:00Z', heartRateBpm: 140 },
    ] })
    assert.equal(activity.metrics.elapsedSeconds.value, 600)
    assert.ok(activity.metrics.elapsedSeconds.value! >= 0)
    assert.equal(activity.samples.length, 2)
  })
})

describe('auditoria 4A · métricas críticas', () => {
  it('T21 mantém 10 km em 54:40 como 5:28/km', () => {
    assert.equal(calculateImportedPace(3_280, 10_000), 328)
  })

  it('T22 calcula 21,10 km em 1:50:34 como aproximadamente 5:14/km', () => {
    const pace = calculateImportedPace(6_634, 21_100)
    assert.ok(pace !== null && Math.abs(pace - 314.4075829) < .0001)
    assert.equal(Math.round(pace!), 314)
  })

  it('T23 distância inválida não produz NaN ou Infinity', () => {
    assert.equal(calculateImportedPace(6_634, 0), null)
    assert.equal(calculateImportedPace(6_634, Number.NaN), null)
    assert.equal(calculateImportedPace(6_634, Number.POSITIVE_INFINITY), null)
  })

  it('T24 não inventa frequência cardíaca ausente', () => {
    const activity = normalizeActivity({ format: 'fit', fileName: 'sem-fc.fit' })
    assert.equal(activity.metrics.averageHeartRateBpm.value, null)
    assert.equal(activity.metrics.maximumHeartRateBpm.value, null)
  })

  it('T25 não inverte subida e descida', async () => {
    const activity = await parseActivityBuffer('fit', auditFitBuffer(), 'direcao.fit')
    assert.equal(activity.metrics.ascentMeters.value, 36)
    assert.equal(activity.metrics.descentMeters.value, 34)
  })
})
