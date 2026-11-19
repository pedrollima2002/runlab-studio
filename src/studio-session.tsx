import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { EditorState } from './studio-config.ts'
import type { ActivityRoute } from './route-geometry.ts'

export const IMPORTED_ACTIVITY_SESSION_KEY = 'runlab-studio:imported-session'

type StudioSessionValue = {
  editorState: EditorState | null
  setEditorState: (state: EditorState | null) => void
  route: ActivityRoute | null
  setRoute: (route: ActivityRoute | null) => void
}

const StudioSessionContext = createContext<StudioSessionValue | null>(null)

export function StudioSessionProvider({ children }: { children: ReactNode }) {
  const [editorState, setEditorState] = useState<EditorState | null>(null)
  const [route, setRoute] = useState<ActivityRoute | null>(null)
  const value = useMemo(() => ({ editorState, setEditorState, route, setRoute }), [editorState, route])
  return <StudioSessionContext.Provider value={value}>{children}</StudioSessionContext.Provider>
}

export function useStudioSession(): StudioSessionValue {
  const value = useContext(StudioSessionContext)
  if (!value) throw new Error('StudioSessionProvider não foi configurado.')
  return value
}

export function markImportedSession(): void {
  try {
    window.sessionStorage.setItem(IMPORTED_ACTIVITY_SESSION_KEY, '1')
  } catch {
    // A integração continua na memória mesmo quando sessionStorage não está disponível.
  }
}

export function clearImportedSessionMark(): void {
  try {
    window.sessionStorage.removeItem(IMPORTED_ACTIVITY_SESSION_KEY)
  } catch {
    // Nada precisa ser limpo quando sessionStorage não está disponível.
  }
}

export function importedSessionWasLost(): boolean {
  try {
    return window.sessionStorage.getItem(IMPORTED_ACTIVITY_SESSION_KEY) === '1'
  } catch {
    return false
  }
}
