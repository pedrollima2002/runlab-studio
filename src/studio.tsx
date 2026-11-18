import type { ReactNode } from 'react'
import { ChevronDown, Download, ScanLine } from 'lucide-react'
import { demo, templates } from './demo'
import { Sticker } from './preview'

function Group({ title, children, open = false }: { title: string; children: ReactNode; open?: boolean }) {
  return <details className="panel" open={open}>
    <summary>{title}<ChevronDown size={18} aria-hidden="true" /></summary>
    <div className="group-body">{children}</div>
  </details>
}

function Field({ label, value }: { label: string; value: string }) {
  return <label className="field">{label}<input value={value} readOnly /></label>
}

export function Studio() {
  return <>
    <div className="page-heading">
      <span className="eyebrow">RUNLAB Studio</span>
      <h1>Estúdio de figurinhas</h1>
      <p>Explore o layout com uma corrida fictícia. A edição e a exportação estão em desenvolvimento.</p>
    </div>
    <div className="studio-layout">
      <aside className="preview-panel panel" aria-label="Prévia da figurinha">
        <div className="preview-heading"><h2><ScanLine size={18} aria-hidden="true" /> Prévia</h2><span>Story · 9:16</span></div>
        <Sticker />
        <p>Dados demonstrativos · Performance</p>
      </aside>
      <div className="controls" aria-label="Controles do estúdio">
        <Group title="Dados da corrida" open>
          <div className="field-grid">
            <Field label="Distância (km)" value={demo.distance} />
            <Field label="Tempo" value={demo.duration} />
            <Field label="Ritmo médio (min/km)" value={demo.pace} />
            <Field label="Frequência cardíaca opcional (bpm)" value={demo.heartRate} />
            <Field label="Elevação opcional (m)" value={demo.elevation} />
            <Field label="Data opcional" value="15/11/2026" />
            <Field label="Título opcional" value={demo.title} />
          </div>
        </Group>
        <Group title="Modelos" open>
          <div className="template-grid">{templates.map((template) =>
            <button type="button" key={template} disabled className={template === 'Performance' ? 'current-template' : ''}>
              <span className={`sample sample-${template.toLowerCase()}`} aria-hidden="true">10,00</span>{template}
            </button>)}</div>
        </Group>
        <Group title="Personalização" open>
          <fieldset disabled><legend>Formato da arte</legend>
            <div className="option-row"><label><input name="formato" type="radio" /> Figurinha transparente</label><label><input name="formato" type="radio" defaultChecked /> Arte completa</label></div>
            <div className="field-grid muted-controls">
              <label className="field">Fonte<select><option>Padrão</option></select></label>
              <label className="field">Cor<select><option>Laranja</option></select></label>
              <label className="field">Posicionamento<select><option>Inferior</option></select></label>
              <button className="button" type="button">Adicionar fotografia</button>
            </div>
          </fieldset>
        </Group>
        <Group title="Exportação" open>
          <p className="muted">Em desenvolvimento</p>
          <div className="export-list">{['PNG transparente', 'Story · 1080 × 1920', 'Feed · 1080 × 1350'].map((format) =>
            <button className="button" key={format} type="button" disabled><Download size={16} aria-hidden="true" />{format}</button>)}</div>
        </Group>
      </div>
    </div>
  </>
}
