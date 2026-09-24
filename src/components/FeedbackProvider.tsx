import { Alert, Snackbar } from '@mui/material'
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

interface FeedbackValue { notify: (message: string, severity?: 'success' | 'error' | 'info') => void }
const FeedbackContext = createContext<FeedbackValue | null>(null)

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ message: string; severity: 'success' | 'error' | 'info' } | null>(null)
  const value = useMemo(() => ({ notify: (message: string, severity: 'success' | 'error' | 'info' = 'success') => setState({ message, severity }) }), [])
  return <FeedbackContext.Provider value={value}>
    {children}
    <Snackbar open={Boolean(state)} autoHideDuration={4500} onClose={() => setState(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
      <Alert severity={state?.severity} onClose={() => setState(null)} variant="filled">{state?.message}</Alert>
    </Snackbar>
  </FeedbackContext.Provider>
}

export function useFeedback() {
  const value = useContext(FeedbackContext)
  if (!value) throw new Error('useFeedback tem de ser usado dentro de FeedbackProvider')
  return value
}
