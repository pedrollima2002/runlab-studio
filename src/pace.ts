export type PaceCalculation =
  | { ok: true; distanceKm: number; durationSeconds: number; paceSeconds: number }
  | { ok: false; distanceError?: string; durationError?: string }

export function parseDistanceKm(value: string): number | null {
  const normalized = value.trim().replace(',', '.')

  if (!/^\d+(?:\.\d+)?$/.test(normalized)) return null

  const distance = Number(normalized)
  return Number.isFinite(distance) && distance > 0 ? distance : null
}

export function parseDurationSeconds(value: string): number | null {
  const parts = value.trim().split(':')

  if (parts.length !== 2 && parts.length !== 3) return null
  if (parts.some((part) => !/^\d+$/.test(part))) return null

  const numbers = parts.map(Number)
  const [hours, minutes, seconds] = parts.length === 3
    ? numbers
    : [0, numbers[0], numbers[1]]

  if (parts.length === 3 && minutes >= 60) return null
  if (seconds >= 60) return null

  const total = hours * 3600 + minutes * 60 + seconds
  return total > 0 ? total : null
}

export function calculateAveragePace(distanceValue: string, durationValue: string): PaceCalculation {
  const distanceKm = parseDistanceKm(distanceValue)
  const durationSeconds = parseDurationSeconds(durationValue)

  if (distanceKm === null || durationSeconds === null) {
    return {
      ok: false,
      ...(distanceKm === null && { distanceError: 'Informe uma distância maior que zero, usando apenas números.' }),
      ...(durationSeconds === null && { durationError: 'Use MM:SS ou H:MM:SS, com minutos e segundos válidos.' }),
    }
  }

  return {
    ok: true,
    distanceKm,
    durationSeconds,
    paceSeconds: Math.round(durationSeconds / distanceKm),
  }
}

export function formatPace(paceSeconds: number): string {
  const minutes = Math.floor(paceSeconds / 60)
  const seconds = paceSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function formatDistance(distanceKm: number): string {
  return distanceKm.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
