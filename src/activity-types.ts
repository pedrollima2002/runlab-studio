export type ActivitySourceFormat = 'fit' | 'tcx'

export type ActivityMetricStatus = 'available' | 'missing' | 'inconsistent'

export type ActivityMetricSource =
  | 'fit-session'
  | 'fit-laps'
  | 'fit-records'
  | 'tcx-laps'
  | 'tcx-trackpoints'
  | 'timestamps'
  | 'calculated'
  | null

export type ActivityMetric = {
  value: number | null
  status: ActivityMetricStatus
  source: ActivityMetricSource
  note?: string
}

export type ActivityPosition = {
  latitude: number
  longitude: number
}

export type ActivitySample = {
  timestamp: string
  distanceMeters?: number
  heartRateBpm?: number
  altitudeMeters?: number
  speedMetersPerSecond?: number
  position?: ActivityPosition
}

export type ActivityLap = {
  startedAt: string | null
  endedAt: string | null
  distanceMeters: number | null
  timerSeconds: number | null
  ascentMeters: number | null
  descentMeters: number | null
}

export type NormalizedActivity = {
  id: string
  source: {
    format: ActivitySourceFormat
    fileName: string
    availableFields: string[]
  }
  sport: string | null
  startedAt: string | null
  metrics: {
    distanceMeters: ActivityMetric
    elapsedSeconds: ActivityMetric
    timerSeconds: ActivityMetric
    movingSeconds: ActivityMetric
    paceSecondsPerKilometer: ActivityMetric
    averageHeartRateBpm: ActivityMetric
    maximumHeartRateBpm: ActivityMetric
    ascentMeters: ActivityMetric
    descentMeters: ActivityMetric
  }
  paceTimeBasis: 'timer' | 'elapsed' | null
  samples: ActivitySample[]
  laps: ActivityLap[]
  warnings: string[]
}

export type CandidateMetric = {
  value?: number | null
  source: Exclude<ActivityMetricSource, 'calculated' | null>
}

export type ActivityCandidate = {
  format: ActivitySourceFormat
  fileName: string
  sport?: string | null
  startedAt?: Date | string | null
  distance?: CandidateMetric
  elapsed?: CandidateMetric
  timer?: CandidateMetric
  moving?: CandidateMetric
  averageHeartRate?: CandidateMetric
  maximumHeartRate?: CandidateMetric
  ascent?: CandidateMetric
  descent?: CandidateMetric
  samples?: Array<{
    timestamp: Date | string
    distanceMeters?: number | null
    heartRateBpm?: number | null
    altitudeMeters?: number | null
    speedMetersPerSecond?: number | null
    position?: ActivityPosition | null
  }>
  laps?: ActivityLap[]
  availableFields?: string[]
  warnings?: string[]
}
