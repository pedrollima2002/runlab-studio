import { Activity, ArrowUpRight, ChartNoAxesCombined, History as HistoryIcon, Image, ShieldCheck, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CourseArt, Metrics, Sticker } from './preview'
import { templates } from './demo'

export function Home() {
  return <>
    <section className="hero">
      <div>
        <span className="eyebrow"><Activity size={17} aria-hidden="true" /> Estúdio e análise de corrida</span>
        <h1>Sua corrida.<br /><em>Seu ritmo.</em></h1>
        <p>Crie artes com suas métricas e acompanhe o que mudou de uma corrida para a próxima.</p>
        <div className="hero-actions">
          <Link className="button primary" to="/estudio"><Image size={18} aria-hidden="true" />Criar figurinha<ArrowUpRight size={16} aria-hidden="true" /></Link>
          <Link className="button primary" to="/analises"><ChartNoAxesCombined size={18} aria-hidden="true" />Analisar corrida<ArrowUpRight size={16} aria-hidden="true" /></Link>
        </div>
      </div>
      <div className="hero-visual panel">
        <div className="preview-heading"><h2>Modelos de figurinha</h2><span>Exemplos</span></div>
        <div className="home-models">{templates.map((template) => <figure key={template}><Sticker template={template} /><figcaption>{template}</figcaption></figure>)}</div>
      </div>
    </section>
    <section className="access panel"><ShieldCheck aria-hidden="true" /><div><h2>Acesso sem conta</h2><p>Explore o Estúdio e as Análises como visitante. A conta será opcional para quem quiser salvar atividades e acompanhar o histórico.</p></div></section>
  </>
}

export function Analyses() {
  return <>
    <div className="page-heading"><span className="eyebrow">Recurso em desenvolvimento</span><h1>Análises</h1><p>Exemplo de painel com dados fictícios.</p></div>
    <div className="analysis-grid">
      <section className="panel content-panel"><h2>Resumo da corrida</h2><Metrics /></section>
      <section className="panel content-panel"><h2>Gráfico de ritmo</h2><div className="chart-placeholder"><CourseArt /></div><p className="muted">Traçado ilustrativo. O gráfico será preenchido a partir de uma atividade importada.</p></section>
    </div>
  </>
}

export function History() {
  return <>
    <div className="page-heading"><h1>Histórico</h1><p>Atividades salvas e evolução de corrida.</p></div>
    <section className="panel content-panel empty"><HistoryIcon aria-hidden="true" /><h2>Nenhuma atividade salva</h2><p>Uma conta opcional permitirá guardar corridas e comparar sua evolução.</p><Link className="button" to="/analises">Ver demonstração de análise</Link></section>
  </>
}

export function Profile() {
  return <>
    <div className="page-heading"><h1>Perfil</h1><p>Preferências e zonas cardíacas em desenvolvimento.</p></div>
    <div className="analysis-grid">
      <section className="panel content-panel"><h2>Preferências</h2><fieldset disabled className="field-grid">
        <label className="field">Unidade de distância<select><option>Quilômetros</option></select></label>
        <label className="field">Idioma<select><option>Português (Brasil)</option></select></label>
      </fieldset></section>
      <section className="panel content-panel"><h2>Zonas cardíacas</h2><fieldset disabled className="field-grid">
        <label className="field">Frequência máxima (bpm)<input placeholder="—" /></label>
        <label className="field">Frequência de repouso (bpm)<input placeholder="—" /></label>
      </fieldset><p className="muted mt-4">As zonas poderão ser configuradas quando o recurso estiver disponível.</p></section>
    </div>
  </>
}

export function Login() {
  return <section className="panel content-panel empty login">
    <UserRound aria-hidden="true" /><h1>Entrar ou criar conta</h1><p>O acesso com conta está em desenvolvimento.</p>
    <fieldset disabled className="login-fields"><label className="field">E-mail<input type="email" placeholder="Seu e-mail" /></label>
      <label className="field">Senha<input type="password" placeholder="Sua senha" /></label>
      <button className="button" type="button">Entrar</button><button className="button" type="button">Criar conta</button>
    </fieldset>
    <Link className="button primary" to="/estudio">Explorar como visitante</Link>
  </section>
}

export function NotFound() {
  return <section className="panel content-panel empty login"><span className="eyebrow">Erro 404</span><h1>Página não encontrada</h1><Link className="button primary" to="/">Voltar ao início</Link></section>
}
