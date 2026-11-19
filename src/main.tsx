import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Analyses } from './analyses'
import { Layout } from './layout'
import { History, Home, Login, NotFound, Profile } from './pages'
import { Studio } from './studio'
import { StudioSessionProvider } from './studio-session'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <StudioSessionProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="estudio" element={<Studio />} />
            <Route path="analises" element={<Analyses />} />
            <Route path="historico" element={<History />} />
            <Route path="perfil" element={<Profile />} />
            <Route path="entrar" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </StudioSessionProvider>
    </BrowserRouter>
  </StrictMode>,
)
