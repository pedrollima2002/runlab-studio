import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildExportFilename, createExportSvg, exportFormatDetails, wrapExportText } from './export-engine.ts'
import { createDefaultEditorState } from './studio-config.ts'
import type { StickerData } from './preview.tsx'

const data: StickerData = {
  title: 'Corrida de São João',
  date: '18/11/2026',
  metrics: [
    { key: 'distance', label: 'Distância', value: '10,00', unit: 'km' },
    { key: 'duration', label: 'Tempo', value: '54:40', unit: '' },
    { key: 'pace', label: 'Ritmo médio', value: '5:28', unit: 'min/km' },
  ],
}

describe('planejamento da exportação', () => {
  it('define dimensões exatas de Story e Feed', () => {
    assert.deepEqual([exportFormatDetails.story.width, exportFormatDetails.story.height], [1080, 1920])
    assert.deepEqual([exportFormatDetails.feed.width, exportFormatDetails.feed.height], [1080, 1350])
  })

  it('gera SVG local com os dados, acentos e personalização atuais', () => {
    const state = createDefaultEditorState()
    const plan = createExportSvg(data, state.appearance, 'story')
    assert.equal(plan.width, 1080)
    assert.equal(plan.height, 1920)
    assert.match(plan.svg, /Corrida de São João/)
    assert.match(plan.svg, /Ritmo médio/)
    assert.match(plan.svg, /#F97316/)
    assert.doesNotMatch(plan.svg, /(?:href|src)="https?:\/\//)
  })

  it('não desenha fundo no plano transparente', () => {
    const state = createDefaultEditorState()
    const plan = createExportSvg(data, state.appearance, 'transparent')
    assert.doesNotMatch(plan.svg, /<rect width="1080" height="1350"/)
  })

  it('omite o fundo opaco quando uma foto ocupa Story ou Feed', () => {
    const state = createDefaultEditorState()
    const plan = createExportSvg(data, state.appearance, 'story', { hasPhoto: true })
    assert.doesNotMatch(plan.svg, /<rect width="1080" height="1920"/)
    assert.match(plan.svg, /Corrida de São João/)
  })

  it('mantém os três templates exportáveis', () => {
    for (const template of ['Minimal', 'Performance', 'Clean'] as const) {
      const state = createDefaultEditorState()
      state.appearance.template = template
      assert.match(createExportSvg(data, state.appearance, 'feed').svg, /RUNLAB/)
    }
  })

  it('respeita cor, organização e somente as métricas recebidas', () => {
    const state = createDefaultEditorState()
    state.appearance.template = 'Minimal'
    state.appearance.accentColor = 'pink'
    state.appearance.layout = 'centered'
    const visibleData: StickerData = { ...data, metrics: [data.metrics[0]] }
    const svg = createExportSvg(visibleData, state.appearance, 'feed').svg
    assert.match(svg, /#F43F5E/)
    assert.match(svg, /text-anchor="middle"/)
    assert.match(svg, /Distância/)
    assert.doesNotMatch(svg, /FC média|Elevação|Ritmo médio/)
  })

  it('preserva acentuação e neutraliza marcação inserida pelo usuário', () => {
    const state = createDefaultEditorState()
    const accented = { ...data, title: 'São João & ação <rápida> — 10 km' }
    const svg = createExportSvg(accented, state.appearance, 'story').svg
    assert.match(svg, /São João &amp; ação &lt;rápida&gt; —/)
    assert.match(svg, />10 km</)
    assert.doesNotMatch(svg, /<rápida>/)
  })

  it('trocar formato não altera dados nem aparência do editor', () => {
    const state = createDefaultEditorState()
    const originalState = structuredClone(state)
    const originalData = structuredClone(data)
    for (const format of ['transparent', 'story', 'feed'] as const) createExportSvg(data, state.appearance, format)
    assert.deepEqual(state, originalState)
    assert.deepEqual(data, originalData)
  })

  it('quebra e limita títulos longos sem cortar a exportação', () => {
    const lines = wrapExportText('Treino progressivo muito longo na orla da cidade ao amanhecer', 20, 2)
    assert.equal(lines.length, 2)
    assert.ok(lines.every((line) => line.length <= 20))
    assert.match(lines[1], /…$/)
  })

  it('cria nome previsível e seguro para download', () => {
    assert.equal(buildExportFilename('10,00', 'story'), 'runlab-10-00km-story.png')
    assert.equal(buildExportFilename('', 'transparent'), 'runlab-corridakm-transparent.png')
  })
})
