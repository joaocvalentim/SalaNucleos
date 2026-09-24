import Add from '@mui/icons-material/Add'
import Search from '@mui/icons-material/Search'
import { Button, InputAdornment, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MaterialDialog } from '../components/EntityDialogs'
import { MaterialCard } from '../components/MaterialCard'
import { useInventory } from '../features/inventory/InventoryContext'
import { normalizeText } from '../utils/text'

export function MaterialsPage() {
  const { materials, boxes, stocks, stockFor, inUseFor } = useInventory()
  const [params] = useSearchParams()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState(params.get('filter') || 'active')
  const [sort, setSort] = useState('name')
  const [boxId, setBoxId] = useState('all')
  const [category, setCategory] = useState('all')
  const [dialog, setDialog] = useState(false)
  const visible = useMemo(() => materials.filter((material) => {
    const matches = `${material.normalizedName} ${normalizeText(material.category)}`.includes(normalizeText(search))
    if (!matches || (category !== 'all' && material.category !== category)) return false
    if (boxId !== 'all' && !stocks.some((stock) => stock.materialId === material.id && stock.boxId === boxId && stock.quantity > 0)) return false
    if (filter === 'inactive') return !material.active
    if (!material.active) return false
    if (filter === 'low') return material.minimumStock !== null && stockFor(material.id) < material.minimumStock
    if (filter === 'inuse') return inUseFor(material.id) > 0
    if (filter === 'available') return stockFor(material.id) > 0
    return true
  }).sort((a, b) => sort === 'quantity' ? stockFor(b.id) - stockFor(a.id) : sort === 'recent' ? (b.updatedAt?.toMillis() || 0) - (a.updatedAt?.toMillis() || 0) : a.name.localeCompare(b.name, 'pt')), [boxId, category, filter, inUseFor, materials, search, sort, stockFor, stocks])
  const categories = [...new Set(materials.map((material) => material.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt'))
  return <Stack spacing={3} className="page-enter">
    <Stack direction="row" justifyContent="space-between" alignItems="center"><div><Typography variant="h1">Materiais</Typography><Typography color="text.secondary">{visible.length} resultados</Typography></div><Button variant="contained" startIcon={<Add />} onClick={() => setDialog(true)}>Novo material</Button></Stack>
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
      <TextField fullWidth placeholder="Pesquisar…" value={search} onChange={(e) => setSearch(e.target.value)} slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search /></InputAdornment> } }} />
      <TextField select label="Mostrar" value={filter} onChange={(e) => setFilter(e.target.value)} sx={{ minWidth: 160 }}><MenuItem value="active">Ativos</MenuItem><MenuItem value="available">Disponíveis</MenuItem><MenuItem value="inuse">Em uso</MenuItem><MenuItem value="low">Stock baixo</MenuItem><MenuItem value="inactive">Inativos</MenuItem></TextField>
      <TextField select label="Caixa" value={boxId} onChange={(e) => setBoxId(e.target.value)} sx={{ minWidth: 150 }}><MenuItem value="all">Todas</MenuItem>{boxes.filter((box) => box.active).map((box) => <MenuItem key={box.id} value={box.id}>{box.name}</MenuItem>)}</TextField>
      <TextField select label="Categoria" value={category} onChange={(e) => setCategory(e.target.value)} sx={{ minWidth: 150 }}><MenuItem value="all">Todas</MenuItem>{categories.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField>
      <TextField select label="Ordenar" value={sort} onChange={(e) => setSort(e.target.value)} sx={{ minWidth: 170 }}><MenuItem value="name">Nome</MenuItem><MenuItem value="quantity">Quantidade</MenuItem><MenuItem value="recent">Atualização recente</MenuItem></TextField>
    </Stack>
    <Stack spacing={1.4}>{visible.map((material) => <MaterialCard key={material.id} material={material} available={stockFor(material.id)} inUse={inUseFor(material.id)} />)}{!visible.length && <Typography color="text.secondary">Não existem materiais para mostrar.</Typography>}</Stack>
    <MaterialDialog open={dialog} onClose={() => setDialog(false)} />
  </Stack>
}
