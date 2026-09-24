import DeleteOutline from '@mui/icons-material/DeleteOutline'
import KeyboardReturn from '@mui/icons-material/KeyboardReturn'
import { Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { InventoryActionDialog, type InventoryAction } from '../components/InventoryActionDialog'
import { useInventory } from '../features/inventory/InventoryContext'
import type { Checkout } from '../models/inventory'
import { formatDate } from '../utils/dates'

export function InUsePage() {
  const { checkouts } = useInventory(); const [selected, setSelected] = useState<{ checkout: Checkout; action: InventoryAction } | null>(null)
  const open = checkouts.filter((checkout) => checkout.status === 'open').sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0))
  return <Stack spacing={3} className="page-enter"><Box><Typography variant="h1">Em uso</Typography><Typography color="text.secondary">{open.length} levantamentos abertos</Typography></Box>
    <Stack spacing={1.5}>{open.map((checkout) => <Card key={checkout.id}><CardContent><Stack direction={{ xs: 'column', sm: 'row' }} gap={2} alignItems={{ sm: 'center' }}><Box flex={1}><Stack direction="row" gap={1} alignItems="center"><Typography variant="h3">{checkout.pendingQuantity} × {checkout.materialNameSnapshot}</Typography>{checkout.pendingQuantity !== checkout.initialQuantity && <Chip size="small" label={`de ${checkout.initialQuantity}`} />}</Stack><Typography color="text.secondary">{checkout.person} · {checkout.reason}</Typography><Typography variant="caption" color="text.secondary">Retirado de {checkout.sourceBoxNameSnapshot} · {formatDate(checkout.createdAt)}</Typography>{checkout.note && <Typography mt={1}>{checkout.note}</Typography>}</Box><Stack direction="row" gap={1}><Button variant="contained" startIcon={<KeyboardReturn />} onClick={() => setSelected({ checkout, action: 'return' })}>Devolver</Button><Button color="error" startIcon={<DeleteOutline />} onClick={() => setSelected({ checkout, action: 'writeoffCheckout' })}>Dar baixa</Button></Stack></Stack></CardContent></Card>)}{!open.length && <Typography color="text.secondary">Não existem materiais pendentes de devolução.</Typography>}</Stack>
    {selected && <InventoryActionDialog open action={selected.action} materialId={selected.checkout.materialId} checkout={selected.checkout} onClose={() => setSelected(null)} />}
  </Stack>
}
