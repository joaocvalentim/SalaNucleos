import { Alert } from '@mui/material'
import { useEffect, useState } from 'react'

export function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine)
  useEffect(() => {
    const update = () => setOnline(navigator.onLine)
    window.addEventListener('online', update); window.addEventListener('offline', update)
    return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update) }
  }, [])
  return online ? null : <Alert severity="warning" className="no-print" sx={{ borderRadius: 0 }}>Sem Internet. Podes consultar dados já carregados, mas não guardar alterações.</Alert>
}
