import { createContext, useContext, useState, type ReactNode } from 'react'

interface ModuleState {
  systemKey: string | null
  setSystemKey: (key: string | null) => void
}

const ModuleContext = createContext<ModuleState | null>(null)

export function ModuleProvider({ children }: { children: ReactNode }) {
  const [systemKey, setSystemKey] = useState<string | null>(null)
  return (
    <ModuleContext.Provider value={{ systemKey, setSystemKey }}>
      {children}
    </ModuleContext.Provider>
  )
}

export function useModule() {
  const ctx = useContext(ModuleContext)
  if (!ctx) throw new Error('useModule must be used within ModuleProvider')
  return ctx
}
