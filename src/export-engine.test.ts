import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildExportFilename, createExportSvg, exportFormatDetails, wrapExportText } from './export-engine.ts'
import { createDefaultEditorState } from './studio-config.ts'
import type { StickerData } from './sticker-data.ts'
import { createRouteDrawing, type ActivityRoute } from './route-geometry.ts'

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

  it('usa a composição canônica do Minimal na prévia e no PNG', () => {
    const state = createDefaultEditorState()
    state.appearance.template = 'Minimal'
    state.appearance.layout = 'featured'
    const svg = createExportSvg(data, state.appearance, 'story').svg

    assert.match(svg, /data-brand-icon="activity"/)
    assert.match(svg, /d="M22 12h-4l-3 9L9 3l-3 9H2"/)
    assert.match(svg, /data-metric="distance"/)
    assert.match(svg, /data-divider="vertical"/)
    assert.match(svg, /data-role="title"[^>]*font-size="76"/)
    assert.match(svg, /data-role="metric-value"[^>]*font-size="57"/)
    assert.match(svg, /data-role="metric-unit"[^>]*font-size="22"/)
  })

  it('preserva as regras visuais próprias de cada template', () => {
    const state = createDefaultEditorState()

    state.appearance.template = 'Performance'
    const performance = createExportSvg(data, state.appearance, 'feed').svg
    assert.match(performance, /data-metric="distance"/)
    assert.match(performance, /data-divider="horizontal"/)

    state.appearance.template = 'Clean'
    const clean = createExportSvg(data, state.appearance, 'feed').svg
    assert.match(clean, /data-divider="horizontal"/)
    assert.match(clean, /data-role="metric-value"/)
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

describe('Etapa 4D · trajeto na composição canônica', () => {
  const sourceRoute: ActivityRoute = {
    format: 'fit', warnings: [], originalPointCount: 3,
    segments: [[
      { latitude: 0, longitude: 0, timestamp: '2026-01-01T00:00:00Z' },
      { latitude: .001, longitude: .002, timestamp: '2026-01-01T00:00:10Z' },
      { latitude: .002, longitude: .001, timestamp: '2026-01-01T00:00:20Z' },
    ]],
  }
  const state = createDefaultEditorState()
  const routeData: StickerData = { ...data, route: { drawing: createRouteDrawing(sourceRoute)!, appearance: state.routeAppearance } }

  it('T24 apresenta rota real sem manter o desenho ilustrativo', () => {
    const svg = createExportSvg(routeData, state.appearance, 'story').svg
    assert.match(svg, /data-route="real"/)
    assert.doesNotMatch(svg, /M-35 141/)
  })

  it('T25 preserva a cor escolhida', () => {
    const customized = { ...routeData, route: { ...routeData.route!, appearance: { ...state.routeAppearance, color: '#123ABC' } } }
    assert.match(createExportSvg(customized, state.appearance, 'story').svg, /stroke="#123ABC"/)
  })

  it('T26 preserva a espessura', () => {
    const customized = { ...routeData, route: { ...routeData.route!, appearance: { ...state.routeAppearance, thickness: 9 } } }
    assert.match(createExportSvg(customized, state.appearance, 'story').svg, /stroke-width="9"/)
  })

  it('T27 e T28 preserva tamanho e posição', () => {
    const customized = { ...routeData, route: { ...routeData.route!, appearance: { ...state.routeAppearance, scale: 1.4, offsetX: 12, offsetY: -8 } } }
    const svg = createExportSvg(customized, state.appearance, 'feed').svg
    assert.match(svg, /translate\(12 -8\).*scale\(1.4\)/)
  })

  it('T29 oculta e reexibe sem perder a geometria', () => {
    const hidden = { ...routeData, route: { ...routeData.route!, appearance: { ...state.routeAppearance, visible: false } } }
    assert.doesNotMatch(createExportSvg(hidden, state.appearance, 'story').svg, /data-route="real"/)
    assert.match(createExportSvg(routeData, state.appearance, 'story').svg, /data-route="real"/)
  })

  it('T30 mantém a rota nos três templates', () => {
    for (const template of ['Minimal', 'Performance', 'Clean'] as const) {
      assert.match(createExportSvg(routeData, { ...state.appearance, template }, 'story').svg, /data-route="real"/)
    }
  })

  it('T37 exporta a geometria já recortada', () => {
    const trimmed = createRouteDrawing(sourceRoute, 50)!
    const svg = createExportSvg({ ...data, route: { drawing: trimmed, appearance: state.routeAppearance } }, state.appearance, 'story').svg
    assert.ok(trimmed.paths.every((path) => svg.includes(path)))
  })

  it('T38 a T40 inclui a rota em transparente, Story e Feed nas dimensões corretas', () => {
    for (const format of ['transparent', 'story', 'feed'] as const) {
      const plan = createExportSvg(routeData, state.appearance, format)
      assert.deepEqual([plan.width, plan.height], [exportFormatDetails[format].width, exportFormatDetails[format].height])
      assert.match(plan.svg, /data-route="real"/)
    }
  })

  it('T41 usa um plano SVG determinístico compartilhado por prévia e PNG', () => {
    assert.equal(createExportSvg(routeData, state.appearance, 'story').svg, createExportSvg(routeData, state.appearance, 'story').svg)
  })

  it('T42 usa escala uniforme e T43 preserva métricas e fundo', () => {
    const svg = createExportSvg(routeData, state.appearance, 'story').svg
    const routeTransform = svg.match(/data-route="real" transform="([^"]+)/)?.[1] ?? ''
    assert.doesNotMatch(routeTransform, /scale\([^ )]+ [^ )]+\)/)
    assert.match(svg, /Ritmo médio/)
    assert.match(svg, /<rect width="1080" height="1920"/)
  })
})
