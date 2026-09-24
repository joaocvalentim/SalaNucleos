import { Alert, Box, Card, CardContent, Stack, Typography } from '@mui/material'

export function SetupPage() {
  return <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}>
    <Card sx={{ maxWidth: 680 }}><CardContent sx={{ p: 4 }}><Stack spacing={2}>
      <Typography variant="h2">Configuração necessária</Typography>
      <Alert severity="info">A aplicação está instalada, mas ainda não está ligada a um projeto Firebase.</Alert>
      <Typography>Cria um ficheiro <strong>.env.local</strong> a partir de <strong>.env.example</strong>, preenche a configuração pública da Web App Firebase e reinicia o servidor.</Typography>
      <Typography color="text.secondary">A password partilhada nunca deve ser colocada nesse ficheiro: ela é introduzida apenas no ecrã de login.</Typography>
    </Stack></CardContent></Card>
  </Box>
}
