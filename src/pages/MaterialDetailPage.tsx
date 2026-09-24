import Add from '@mui/icons-material/Add'
import ArrowForward from '@mui/icons-material/ArrowForward'
import DeleteOutline from '@mui/icons-material/DeleteOutline'
import Edit from '@mui/icons-material/Edit'
import LogoutOutlined from '@mui/icons-material/LogoutOutlined'
import Tune from '@mui/icons-material/Tune'
import { Alert, Box, Button, Card, CardContent, Chip, Divider, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MaterialDialog } from '../components/EntityDialogs'
import { InventoryActionDialog, type InventoryAction } from '../components/InventoryActionDialog'
import { MovementList } from '../components/MovementList'
import { useFeedback } from '../components/FeedbackProvider'
import { useInventory } from '../features/inventory/InventoryContext'
import { setMaterialActive } from '../services/inventoryService'
import { friendlyError } from '../utils/errors'

export function MaterialDetailPage() {
  const { id = '' } = useParams()
  const { materials, boxes, stocks, movements, stockFor, inUseFor } = useInventory()
  const { notify } = useFeedback()
  const [action, setAction] = useState<InventoryAction | null>(null)
  const [edit, setEdit] = useState(false)
  const material = materials.find((item) => item.id === id)
  if (!material) return <Alert severity="warning">Este material não existe. <Link to="/materials">Ver materiais</Link></Alert>
  const total = stockFor(id); const inUse = inUseFor(id)
  const locations = stocks.filter((stock) => stock.materialId === id && stock.quantity > 0).map((stock) => ({ ...stock, box: boxes.find((box) => box.id === stock.boxId) })).filter((item) => item.box)
  const low = material.minimumStock !== null && total < material.minimumStock
  async function toggleActive() { try { await setMaterialActive(id, !material!.active); notify(material!.active ? 'Material desativado.' : 'Material reativado.') } catch (error) { notify(friendlyError(error), 'error') } }
  return <Stack spacing={3} className="page-enter">
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2}><Box><Stack direction="row" gap={1} alignItems="center"><Typography variant="h1">{material.name}</Typography>{!material.active && <Chip label="Inativo" />}{low && <Chip color="warning" label="Stock baixo" />}</Stack><Typography color="text.secondary">{material.category || 'Sem categoria'} · {material.unit}</Typography></Box><Button startIcon={<Edit />} onClick={() => setEdit(true)}>Editar</Button></Stack>
    <Card><CardContent><Stack direction={{ xs: 'column', sm: 'row' }} spacing={4}><Box><Typography color="text.secondary">Disponível</Typography><Typography variant="h1">{total}</Typography></Box><Box><Typography color="text.secondary">Em uso</Typography><Typography variant="h1" color="info.main">{inUse}</Typography></Box>{material.minimumStock !== null && <Box><Typography color="text.secondary">Stock mínimo</Typography><Typography variant="h1">{material.minimumStock}</Typography></Box>}</Stack></CardContent></Card>
    {material.active && <Stack direction="row" flexWrap="wrap" gap={1}><Button variant="contained" startIcon={<LogoutOutlined />} onClick={() => setAction('checkout')}>Retirar</Button><Button variant="outlined" startIcon={<Add />} onClick={() => setAction('add')}>Adicionar stock</Button><Button variant="outlined" startIcon={<ArrowForward />} onClick={() => setAction('transfer')}>Transferir</Button><Button variant="outlined" color="warning" startIcon={<Tune />} onClick={() => setAction('correct')}>Corrigir</Button><Button color="error" startIcon={<DeleteOutline />} onClick={() => setAction('writeoff')}>Dar baixa</Button></Stack>}
    <Card><CardContent><Typography variant="h2" mb={2}>Distribuição</Typography>{locations.map((location, index) => <Box key={location.id}><Box component={Link} to={`/box/${location.box!.id}`} display="flex" justifyContent="space-between" py={1.5}><span>{location.box!.name}</span><strong>{location.quantity} {material.unit}</strong></Box>{index < locations.length - 1 && <Divider />}</Box>)}{!locations.length && <Typography color="text.secondary">Sem stock em caixas.</Typography>}</CardContent></Card>
    <Card><CardContent><Typography variant="h2">Histórico recente</Typography><MovementList movements={movements.filter((movement) => movement.materialId === id).slice(0, 20)} /></CardContent></Card>
    <Button color={material.active ? 'error' : 'primary'} onClick={() => void toggleActive()} disabled={material.active && (total > 0 || inUse > 0)}>{material.active ? 'Desativar material' : 'Reativar material'}</Button>
    {material.active && (total > 0 || inUse > 0) && <Typography variant="caption" textAlign="center" color="text.secondary">Para desativar, o material não pode ter stock nem unidades em uso.</Typography>}
    {action && <InventoryActionDialog open action={action} materialId={id} onClose={() => setAction(null)} />}
    <MaterialDialog open={edit} material={material} onClose={() => setEdit(false)} />
  </Stack>
}
