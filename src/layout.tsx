import { useEffect, useRef } from 'react'
import { Activity, ArrowUpRight } from 'lucide-react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'

const links = [
  ['/', 'Início'],
  ['/estudio', 'Estúdio'],
  ['/analises', 'Análises'],
  ['/historico', 'Histórico'],
  ['/perfil', 'Perfil'],
]

export function Brand() {
  return <span className="brand"><Activity size={21} aria-hidden="true" /> RUNLAB <small>STUDIO</small></span>
}

export function Layout() {
  const { pathname } = useLocation()
  const previousPath = useRef(pathname)
  useEffect(() => {
    if (previousPath.current === pathname) return
    previousPath.current = pathname
    const main = document.getElementById('conteudo')
    main?.focus({ preventScroll: true })
    window.scrollTo(0, 0)
  }, [pathname])

  return <>
    <a className="skip" href="#conteudo">Pular para o conteúdo</a>
    <header className="topbar">
      <div className="wrap topbar-inner">
        <Link to="/" aria-label="RUNLAB Studio, início"><Brand /></Link>
        <nav aria-label="Navegação principal">
          {links.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'}>{label}</NavLink>)}
        </nav>
        <NavLink className="sign-in" to="/entrar">Entrar <ArrowUpRight size={15} aria-hidden="true" /></NavLink>
      </div>
    </header>
    <main id="conteudo" className="wrap" tabIndex={-1}><Outlet /></main>
    <footer><div className="wrap footer-inner"><Link to="/"><Brand /></Link><span>Ferramentas para corredores amadores</span></div></footer>
  </>
}
