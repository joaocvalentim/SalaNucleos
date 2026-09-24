import AddCircleOutline from '@mui/icons-material/AddCircleOutline'
import ArrowForward from '@mui/icons-material/ArrowForward'
import DeleteOutline from '@mui/icons-material/DeleteOutline'
import EditOutlined from '@mui/icons-material/EditOutlined'
import KeyboardReturn from '@mui/icons-material/KeyboardReturn'
import LogoutOutlined from '@mui/icons-material/LogoutOutlined'
import { Box, Chip, Divider, List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material'
import type { Movement } from '../models/inventory'
import { formatRelativeDate } from '../utils/dates'

const labels = { stock_in: 'Entrada', checkout: 'Retirada', return: 'Devolução', transfer: 'Transferência', write_off_stock: 'Baixa', write_off_checkout: 'Baixa em uso', correction: 'Correção' }
const icons = { stock_in: <AddCircleOutline color="success" />, checkout: <LogoutOutlined color="info" />, return: <KeyboardReturn color="success" />, transfer: <ArrowForward color="primary" />, write_off_stock: <DeleteOutline color="error" />, write_off_checkout: <DeleteOutline color="error" />, correction: <EditOutlined color="warning" /> }

export function MovementList({ movements, empty = 'Ainda não existem movimentos.' }: { movements: Movement[]; empty?: string }) {
  if (!movements.length) return <Typography color="text.secondary" py={3}>{empty}</Typography>
  return <List disablePadding>{movements.map((movement, index) => <Box key={movement.id}>
    <ListItem alignItems="flex-start" sx={{ px: 0, py: 1.5 }}>
      <ListItemIcon sx={{ minWidth: 42, mt: .5 }}>{icons[movement.type]}</ListItemIcon>
      <ListItemText primary={<Box display="flex" gap={1} alignItems="center" flexWrap="wrap"><Typography fontWeight={700}>{movement.quantity} × {movement.materialNameSnapshot}</Typography><Chip size="small" label={labels[movement.type]} /></Box>} secondary={<>{movement.person}{movement.reason ? ` · ${movement.reason}` : ''}{movement.sourceBoxNameSnapshot ? ` · ${movement.sourceBoxNameSnapshot}` : ''}{movement.destinationBoxNameSnapshot ? ` → ${movement.destinationBoxNameSnapshot}` : ''}<br />{formatRelativeDate(movement.createdAt)}</>} />
    </ListItem>{index < movements.length - 1 && <Divider />}
  </Box>)}</List>
}
