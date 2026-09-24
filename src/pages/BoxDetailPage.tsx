import Add from '@mui/icons-material/Add'
import ArrowForward from '@mui/icons-material/ArrowForward'
import DeleteOutline from '@mui/icons-material/DeleteOutline'
import Edit from '@mui/icons-material/Edit'
import LogoutOutlined from '@mui/icons-material/LogoutOutlined'
import QrCode2 from '@mui/icons-material/QrCode2'
import Search from '@mui/icons-material/Search'
import Tune from '@mui/icons-material/Tune'
import { Alert, Box, Button, Card, CardContent, Chip, Divider, IconButton, InputAdornment, Stack, TextField, Tooltip, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BoxDialog } from '../components/EntityDialogs'
import { useFeedback } from '../components/FeedbackProvider'
import { InventoryActionDialog, type InventoryAction } from '../components/InventoryActionDialog'
import { MovementList } from '../components/MovementList'
import { QrCodeDialog } from '../components/QrCodeDialog'
import { useInventory } from '../features/inventory/InventoryContext'
import { setBoxActive } from '../services/inventoryService'
import { friendlyError } from '../utils/errors'
import { normalizeText } from '../utils/text'

export function BoxDetailPage() {
  const { id = '' } = useParams(); const { boxes, stocks, materials, movements } = useInventory(); const { notify } = useFeedback()
  const [search, setSearch] = useState(''); const [qr, setQr] = useState(false); const [edit, setEdit] = useState(false)
  const [selected, setSelected] = useState<{ materialId: string; action: InventoryAction } | null>(null)
  const box = boxes.find((item) => item.id === id)
  const contents = useMemo(() => stocks.filter((stock) => stock.boxId === id && stock.quantity > 0).map((stock) => ({ stock, material: materials.find((material) => material.id === stock.materialId) })).filter((item) => item.material && normalizeText(item.material.name).includes(normalizeText(search))).sort((a, b) => a.material!.name.localeCompare(b.material!.name, 'pt')), [id, materials, search, stocks])
  if (!box) return <Alert severity="warning">Esta caixa já não existe. <Link to="/boxes">Ver todas as caixas</Link></Alert>
  const total = contents.reduce((sum, item) => sum + item.stock.quantity, 0)
  async function toggleActive() { try { await setBoxActive(id, !box!.active); notify(box!.active ? 'Caixa desativada.' : 'Caixa reativada.') } catch (error) { notify(friendlyError(error), 'error') } }
  return <Stack spacing={3} className="page-enter">
    {!box.active && <Alert severity="warning">Esta caixa está desativada. O histórico continua disponível, mas não podem ser feitas novas operações.</Alert>}
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2}><Box><Stack direction="row" alignItems="center" gap={1}><Typography variant="h1">{box.name}</Typography><Chip label={box.code} /></Stack><Typography color="text.secondary">{box.roomLocation || 'Sem localização definida'}</Typography></Box><Stack direction="row"><Button startIcon={<Edit />} onClick={() => setEdit(true)}>Editar</Button><Button variant="contained" startIcon={<QrCode2 />} onClick={() => setQr(true)}>Ver QR Code</Button></Stack></Stack>
    <Card><CardContent><Stack direction="row" spacing={5}><Box><Typography color="text.secondary">Tipos</Typography><Typography variant="h2">{contents.length}</Typography></Box><Box><Typography color="text.secondary">Unidades</Typography><Typography variant="h2">{total}</Typography></Box></Stack></CardContent></Card>
    <TextField placeholder="Pesquisar nesta caixa…" value={search} onChange={(e) => setSearch(e.target.value)} slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search /></InputAdornment> } }} />
    <Card><CardContent><Typography variant="h2" mb={1}>Conteúdo</Typography>{contents.map((item, index) => <Box key={item.stock.id}><Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} py={1.5} gap={1}><Box component={Link} to={`/material/${item.material!.id}`} flex={1}><Typography fontWeight={750}>{item.material!.name}</Typography><Typography color="text.secondary">{item.stock.quantity} {item.material!.unit}</Typography></Box>{box.active && <Stack direction="row" flexWrap="wrap"><Tooltip title="Retirar"><IconButton color="info" onClick={() => setSelected({ materialId: item.material!.id, action: 'checkout' })}><LogoutOutlined /></IconButton></Tooltip><Tooltip title="Adicionar"><IconButton color="success" onClick={() => setSelected({ materialId: item.material!.id, action: 'add' })}><Add /></IconButton></Tooltip><Tooltip title="Transferir"><IconButton color="primary" onClick={() => setSelected({ materialId: item.material!.id, action: 'transfer' })}><ArrowForward /></IconButton></Tooltip><Tooltip title="Corrigir"><IconButton color="warning" onClick={() => setSelected({ materialId: item.material!.id, action: 'correct' })}><Tune /></IconButton></Tooltip><Tooltip title="Dar baixa"><IconButton color="error" onClick={() => setSelected({ materialId: item.material!.id, action: 'writeoff' })}><DeleteOutline /></IconButton></Tooltip></Stack>}</Stack>{index < contents.length - 1 && <Divider />}</Box>)}{!contents.length && <Typography color="text.secondary" py={2}>Nenhum material nesta caixa.</Typography>}</CardContent></Card>
    <Card><CardContent><Typography variant="h2">Histórico da caixa</Typography><MovementList movements={movements.filter((movement) => movement.sourceBoxId === id || movement.destinationBoxId === id).slice(0, 20)} /></CardContent></Card>
    <Button color={box.active ? 'error' : 'primary'} onClick={() => void toggleActive()} disabled={box.active && total > 0}>{box.active ? 'Desativar caixa' : 'Reativar caixa'}</Button>
    {box.active && total > 0 && <Typography variant="caption" textAlign="center" color="text.secondary">Transfere ou corrige todo o stock antes de desativar esta caixa.</Typography>}
    <QrCodeDialog box={box} open={qr} onClose={() => setQr(false)} /><BoxDialog box={box} open={edit} onClose={() => setEdit(false)} />
    {selected && <InventoryActionDialog open action={selected.action} materialId={selected.materialId} sourceBoxId={selected.action === 'add' ? undefined : id} destinationBoxId={selected.action === 'add' ? id : undefined} onClose={() => setSelected(null)} />}
  </Stack>
}
