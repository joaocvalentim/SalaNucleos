import Add from '@mui/icons-material/Add'
import ChevronRight from '@mui/icons-material/ChevronRight'
import Search from '@mui/icons-material/Search'
import { Box, Button, Card, CardActionArea, CardContent, Chip, InputAdornment, Stack, TextField, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BoxDialog } from '../components/EntityDialogs'
import { useInventory } from '../features/inventory/InventoryContext'
import { normalizeText } from '../utils/text'

export function BoxesPage() {
  const { boxes, stocks } = useInventory(); const [search, setSearch] = useState(''); const [dialog, setDialog] = useState(false)
  const visible = useMemo(() => boxes.filter((box) => box.active && normalizeText(`${box.name} ${box.code} ${box.roomLocation}`).includes(normalizeText(search))).sort((a, b) => a.name.localeCompare(b.name, 'pt')), [boxes, search])
  return <Stack spacing={3} className="page-enter">
    <Stack direction="row" justifyContent="space-between"><Box><Typography variant="h1">Caixas</Typography><Typography color="text.secondary">{visible.length} caixas ativas</Typography></Box><Button variant="contained" startIcon={<Add />} onClick={() => setDialog(true)}>Nova caixa</Button></Stack>
    <TextField placeholder="Pesquisar caixa…" value={search} onChange={(e) => setSearch(e.target.value)} slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search /></InputAdornment> } }} />
    <Stack spacing={1.5}>{visible.map((box) => { const boxStocks = stocks.filter((stock) => stock.boxId === box.id && stock.quantity > 0); const total = boxStocks.reduce((sum, stock) => sum + stock.quantity, 0); return <Card key={box.id}><CardActionArea component={Link} to={`/box/${box.id}`}><CardContent><Stack direction="row" alignItems="center" gap={2}><Box flex={1}><Stack direction="row" gap={1} alignItems="center"><Typography variant="h3">{box.name}</Typography><Chip size="small" label={box.code} /></Stack><Typography color="text.secondary">{box.roomLocation || 'Sem localização'} · {boxStocks.length} tipos · {total} unidades</Typography></Box><ChevronRight color="disabled" /></Stack></CardContent></CardActionArea></Card> })}{!visible.length && <Typography color="text.secondary">Não existem caixas para mostrar.</Typography>}</Stack>
    <BoxDialog open={dialog} onClose={() => setDialog(false)} />
  </Stack>
}
