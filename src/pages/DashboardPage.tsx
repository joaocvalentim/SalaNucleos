import ArchiveOutlined from '@mui/icons-material/ArchiveOutlined'
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined'
import Search from '@mui/icons-material/Search'
import WarningAmber from '@mui/icons-material/WarningAmber'
import WidgetsOutlined from '@mui/icons-material/WidgetsOutlined'
import { Box, Card, CardContent, Grid, InputAdornment, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MaterialCard } from '../components/MaterialCard'
import { MovementList } from '../components/MovementList'
import { useInventory } from '../features/inventory/InventoryContext'
import { normalizeText } from '../utils/text'

export function DashboardPage() {
  const { materials, boxes, checkouts, movements, stockFor, inUseFor } = useInventory()
  const [search, setSearch] = useState('')
  const activeMaterials = materials.filter((material) => material.active)
  const lowStock = activeMaterials.filter((material) => material.minimumStock !== null && stockFor(material.id) < material.minimumStock)
  const term = normalizeText(search)
  const results = term ? activeMaterials.filter((material) => `${material.normalizedName} ${normalizeText(material.category)}`.includes(term)).slice(0, 8) : []
  const stats = [
    { label: 'Em uso', value: checkouts.filter((item) => item.status === 'open').length, icon: <ArchiveOutlined color="info" />, path: '/in-use' },
    { label: 'Stock baixo', value: lowStock.length, icon: <WarningAmber color="warning" />, path: '/materials?filter=low' },
    { label: 'Caixas', value: boxes.filter((item) => item.active).length, icon: <WidgetsOutlined color="primary" />, path: '/boxes' },
    { label: 'Materiais', value: activeMaterials.length, icon: <Inventory2Outlined color="primary" />, path: '/materials' },
  ]
  return <Stack spacing={4} className="page-enter">
    <Box><Typography variant="overline" color="primary" fontWeight={800}>Gestão de armazém</Typography><Typography variant="h1">Onde está e quanto temos?</Typography></Box>
    <Box>
      <TextField fullWidth placeholder="Pesquisar material…" value={search} onChange={(event) => setSearch(event.target.value)} slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search /></InputAdornment>, sx: { minHeight: 62, fontSize: '1.1rem', bgcolor: 'background.paper' } } }} />
      {search && <Stack spacing={1.2} mt={2}>{results.length ? results.map((material) => <MaterialCard key={material.id} material={material} available={stockFor(material.id)} inUse={inUseFor(material.id)} compact />) : <Typography color="text.secondary">Nenhum material encontrado.</Typography>}</Stack>}
    </Box>
    <Grid container spacing={2}>{stats.map((stat) => <Grid key={stat.label} size={{ xs: 6, md: 3 }}><Card component={Link} to={stat.path} sx={{ display: 'block', height: '100%' }}><CardContent><Box display="flex" justifyContent="space-between">{stat.icon}<Typography variant="h2">{stat.value}</Typography></Box><Typography color="text.secondary" mt={1}>{stat.label}</Typography></CardContent></Card></Grid>)}</Grid>
    {lowStock.length > 0 && <Box><Typography variant="h2" mb={2}>Stock baixo</Typography><Stack spacing={1.2}>{lowStock.slice(0, 4).map((material) => <MaterialCard key={material.id} material={material} available={stockFor(material.id)} inUse={inUseFor(material.id)} compact />)}</Stack></Box>}
    <Card><CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}><Typography variant="h2">Movimentos recentes</Typography><MovementList movements={movements.slice(0, 6)} /></CardContent></Card>
  </Stack>
}
