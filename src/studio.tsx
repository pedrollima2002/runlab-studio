import { useState, type ReactNode } from 'react'
import { Calculator, ChevronDown, Download, ScanLine } from 'lucide-react'
import { demo, templates } from './demo'
import { Sticker } from './preview'
import { calculateAveragePace, formatDistance, formatPace, parseDistanceKm, parseDurationSeconds } from './pace'

function Group({ title, children, open = false }: { title: string; children: ReactNode; open?: boolean }) {
  return <details className="panel" open={open}>
    <summary>{title}<ChevronDown size={18} aria-hidden="true" /></summary>
    <div className="group-body">{children}</div>
  </details>
}

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return <label className="field">{label}<input value={value} readOnly /></label>
}

export function Studio() {
  const [distance, setDistance] = useState(demo.distance)
  const [duration, setDuration] = useState(demo.duration)
  const parsedDistance = parseDistanceKm(distance)
  const parsedDuration = parseDurationSeconds(duration)
  const calculation = calculateAveragePace(distance, duration)
  const pace = calculation.ok ? formatPace(calculation.paceSeconds) : '—'
  const stickerData = {
    title: demo.title,
    distance: parsedDistance === null ? '—' : formatDistance(parsedDistance),
    duration: parsedDuration === null ? '—' : duration.trim(),
    pace,
  }

  return <>
    <div className="page-heading">
      <span className="eyebrow">RUNLAB Studio</span>
      <h1>Estúdio de figurinhas</h1>
      <p>Informe sua distância e seu tempo para montar a prévia. Modelos e exportação continuam em desenvolvimento.</p>
    </div>
    <div className="studio-layout">
      <aside className="preview-panel panel" aria-label="Prévia da figurinha">
        <div className="preview-heading"><h2><ScanLine size={18} aria-hidden="true" /> Prévia</h2><span>Story · 9:16</span></div>
        <Sticker data={stickerData} />
        <p aria-live="polite">Atualização em tempo real · Performance</p>
      </aside>
      <div className="controls" aria-label="Controles do estúdio">
        <Group title="Dados da corrida" open>
          <div className="field-grid">
            <label className="field">
              Distância (km)
              <input
                aria-describedby={calculation.ok || !calculation.distanceError ? undefined : 'distance-error'}
                aria-invalid={!calculation.ok && Boolean(calculation.distanceError)}
                inputMode="decimal"
                onChange={(event) => setDistance(event.target.value)}
                placeholder="Ex.: 10 ou 2,5"
                value={distance}
              />
              {!calculation.ok && calculation.distanceError && <span className="field-error" id="distance-error">{calculation.distanceError}</span>}
            </label>
            <label className="field">
              Tempo
              <input
                aria-describedby={!calculation.ok && calculation.durationError ? 'duration-error duration-help' : 'duration-help'}
                aria-invalid={!calculation.ok && Boolean(calculation.durationError)}
                inputMode="numeric"
                onChange={(event) => setDuration(event.target.value)}
                placeholder="Ex.: 54:40 ou 1:00:00"
                value={duration}
              />
              <span className="field-help" id="duration-help">Formatos aceitos: MM:SS ou H:MM:SS.</span>
              {!calculation.ok && calculation.durationError && <span className="field-error" id="duration-error">{calculation.durationError}</span>}
            </label>
            <div className="field pace-field">
              <span>Ritmo médio (min/km)</span>
              <span className="calculated-value"><Calculator size={16} aria-hidden="true" />{pace}</span>
              <span className="field-help">Calculado automaticamente.</span>
            </div>
            <ReadonlyField label="Frequência cardíaca opcional (bpm)" value={demo.heartRate} />
            <ReadonlyField label="Elevação opcional (m)" value={demo.elevation} />
            <ReadonlyField label="Data opcional" value="15/11/2026" />
            <ReadonlyField label="Título opcional" value={demo.title} />
          </div>
          <p className="calculation-note">O ritmo médio é calculado com base no tempo informado. Caso sua atividade tenha pausas, o resultado poderá ser diferente do registrado no seu relógio ou aplicativo.</p>
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
