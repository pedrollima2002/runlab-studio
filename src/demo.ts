export const demo = {
  title: 'Corrida de domingo',
  distance: '10,00',
  duration: '54:40',
  pace: '5:28',
  heartRate: '158',
  elevation: '84',
}

export const metrics = [
  { label: 'Distância', value: demo.distance, unit: 'km' },
  { label: 'Tempo', value: demo.duration, unit: '' },
  { label: 'Ritmo médio', value: demo.pace, unit: 'min/km' },
]

export const templates = ['Minimal', 'Performance', 'Clean'] as const
