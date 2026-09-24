import Search from '@mui/icons-material/Search'
import { Box, Card, CardContent, InputAdornment, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { MovementList } from '../components/MovementList'
import { useInventory } from '../features/inventory/InventoryContext'
import { normalizeText } from '../utils/text'

export function HistoryPage() {
  const { movements, boxes } = useInventory(); const [search, setSearch] = useState(''); const [type, setType] = useState('all'); const [box, setBox] = useState('all')
  const visible = useMemo(() => movements.filter((movement) => {
    const text = normalizeText(`${movement.materialNameSnapshot} ${movement.person} ${movement.reason} ${movement.note}`)
    return text.includes(normalizeText(search)) && (type === 'all' || movement.type === type) && (box === 'all' || movement.sourceBoxId === box || movement.destinationBoxId === box)
  }), [box, movements, search, type])
  return <Stack spacing={3} className="page-enter"><Box><Typography variant="h1">Histórico</Typography><Typography color="text.secondary">Últimos {movements.length} movimentos</Typography></Box>
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}><TextField fullWidth placeholder="Pesquisar material, pessoa ou motivo…" value={search} onChange={(e) => setSearch(e.target.value)} slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search /></InputAdornment> } }} /><TextField select label="Tipo" value={type} onChange={(e) => setType(e.target.value)} sx={{ minWidth: 180 }}><MenuItem value="all">Todos</MenuItem><MenuItem value="stock_in">Entrada</MenuItem><MenuItem value="checkout">Retirada</MenuItem><MenuItem value="return">Devolução</MenuItem><MenuItem value="transfer">Transferência</MenuItem><MenuItem value="write_off_stock">Baixa</MenuItem><MenuItem value="write_off_checkout">Baixa em uso</MenuItem><MenuItem value="correction">Correção</MenuItem></TextField><TextField select label="Caixa" value={box} onChange={(e) => setBox(e.target.value)} sx={{ minWidth: 180 }}><MenuItem value="all">Todas</MenuItem>{boxes.map((item) => <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>)}</TextField></Stack>
    <Card><CardContent><MovementList movements={visible} empty="Nenhum movimento corresponde aos filtros." /></CardContent></Card>
  </Stack>
}
