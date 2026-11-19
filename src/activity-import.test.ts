import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { calculateImportedPace, normalizeActivity } from './activity-normalization.ts'
import { MAX_ACTIVITY_FILE_BYTES, validateActivityFileMetadata } from './activity-import-policy.ts'
import { parseActivityBuffer } from './activity-parse.ts'
import { parseTcxActivity } from './activity-tcx.ts'

const fitReferenceBase64 = 'DiDEUqYAAAAuRklUt11AAAAAAAMAAQABAoQEBIYABAEAwFJcRUEAABQABv0EhgAEhQEEhQIChAMBAgUEhgHAUlxFdNpA739E196gD4wAAAAAAShZXEV9rELvhxbZ3tIPmyChBwABkF9cRYV+RO+Q6NreuQ+qQEIPAEIAABIACf0EhgIEhgUBAAcEhggEhgkEhhABAhEBAhYChAKQX1xFwFJcRQGADDIAgAwyAEBCDwCbqlQApfQ='

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
    assert.equal(activity.metrics.elevationGainMeters.value, 84)
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
    assert.equal(activity.metrics.elevationGainMeters.value, null)
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
