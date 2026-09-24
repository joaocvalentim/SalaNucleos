import ChevronRight from '@mui/icons-material/ChevronRight'
import WarningAmber from '@mui/icons-material/WarningAmber'
import { Box, Card, CardActionArea, CardContent, Chip, Stack, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import type { Material } from '../models/inventory'

export function MaterialCard({ material, available, inUse, compact = false }: { material: Material; available: number; inUse: number; compact?: boolean }) {
  const low = material.minimumStock !== null && available < material.minimumStock
  return <Card><CardActionArea component={Link} to={`/material/${material.id}`}><CardContent sx={{ p: compact ? 2 : 2.5 }}>
    <Box display="flex" alignItems="center" gap={2}>
      <Box flex={1} minWidth={0}><Typography fontWeight={750} noWrap>{material.name}</Typography><Typography color="text.secondary" variant="body2">{available} {material.unit} disponíveis{inUse ? ` · ${inUse} em uso` : ''}</Typography></Box>
      <Stack direction="row" alignItems="center" spacing={1}>{low && <Chip size="small" color="warning" icon={<WarningAmber />} label="Stock baixo" />}<ChevronRight color="disabled" /></Stack>
    </Box>
  </CardContent></CardActionArea></Card>
}
