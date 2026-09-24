import LockOutlined from '@mui/icons-material/LockOutlined'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { Alert, Box, Button, Card, CardContent, CircularProgress, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material'
import { FormEvent, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import { friendlyError } from '../utils/errors'

export function LoginPage() {
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const destination = (location.state as { from?: string } | null)?.from || sessionStorage.getItem('authDestination') || '/'

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(''); setSaving(true)
    try {
      await login(password)
      sessionStorage.removeItem('authDestination')
      navigate(destination, { replace: true })
    } catch (nextError) { setError(friendlyError(nextError)) } finally { setSaving(false) }
  }

  return <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2, background: 'radial-gradient(circle at 10% 10%, #dcebe5, transparent 40%), #f5f4ef' }}>
    <Card sx={{ width: '100%', maxWidth: 430 }}><CardContent sx={{ p: { xs: 3, sm: 5 } }}>
      <Stack spacing={3} component="form" onSubmit={submit}>
        <Box sx={{ width: 52, height: 52, bgcolor: 'primary.main', color: 'white', borderRadius: 3, display: 'grid', placeItems: 'center' }}><LockOutlined /></Box>
        <Box><Typography variant="h2">Entrar no inventário</Typography><Typography color="text.secondary" mt={1}>Introduz a password partilhada pela equipa.</Typography></Box>
        {destination.startsWith('/box/') && <Alert severity="info">Depois de entrar, abriremos diretamente a caixa pedida.</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
        <TextField autoFocus fullWidth label="Password de acesso" type={show ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} slotProps={{ input: { endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShow((value) => !value)} aria-label={show ? 'Ocultar password' : 'Mostrar password'}>{show ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> } }} />
        <Button type="submit" size="large" variant="contained" disabled={!password || saving}>{saving ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}</Button>
      </Stack>
    </CardContent></Card>
  </Box>
}
