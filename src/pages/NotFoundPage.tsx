import { Button, Stack, Typography } from '@mui/material'
import { Link } from 'react-router-dom'

export function NotFoundPage() { return <Stack alignItems="flex-start" spacing={2}><Typography variant="h1">Página não encontrada</Typography><Typography color="text.secondary">O endereço pode estar incorreto ou já não existir.</Typography><Button component={Link} to="/" variant="contained">Voltar ao início</Button></Stack> }
