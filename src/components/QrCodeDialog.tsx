import ContentCopy from '@mui/icons-material/ContentCopy'
import Download from '@mui/icons-material/Download'
import Print from '@mui/icons-material/Print'
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material'
import { QRCodeSVG } from 'qrcode.react'
import type { Box as InventoryBox } from '../models/inventory'
import { useFeedback } from './FeedbackProvider'

export function QrCodeDialog({ box, open, onClose }: { box: InventoryBox; open: boolean; onClose: () => void }) {
  const { notify } = useFeedback()
  const root = (import.meta.env.VITE_PUBLIC_APP_URL || window.location.href.split('#')[0]).replace(/\/?$/, '/')
  const url = `${root}#/box/${box.id}`
  function download() {
    const svg = document.getElementById(`qr-${box.id}`)
    if (!svg) return
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' })
    const anchor = document.createElement('a'); anchor.href = URL.createObjectURL(blob); anchor.download = `${box.code}-qr.svg`; anchor.click(); URL.revokeObjectURL(anchor.href)
  }
  return <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" className="qr-print"><DialogTitle className="no-print">QR Code da caixa</DialogTitle><DialogContent>
    <Stack alignItems="center" spacing={2.5} sx={{ py: 3 }}>
      <Typography variant="h2" textAlign="center">{box.name}</Typography><Typography color="text.secondary">{box.code}</Typography>
      <Box sx={{ bgcolor: '#fff', border: '1px solid', borderColor: 'divider', p: 2, borderRadius: 2 }}><QRCodeSVG id={`qr-${box.id}`} value={url} size={240} level="M" marginSize={2} /></Box>
      <Typography fontWeight={700}>Gestão de Armazém</Typography><Typography variant="caption" color="text.secondary" textAlign="center" sx={{ wordBreak: 'break-all' }}>{url}</Typography>
    </Stack>
  </DialogContent><DialogActions className="no-print" sx={{ p: 3, flexWrap: 'wrap' }}>
    <Button startIcon={<ContentCopy />} onClick={() => void navigator.clipboard.writeText(url).then(() => notify('URL copiado.'))}>Copiar URL</Button>
    <Button startIcon={<Download />} onClick={download}>Transferir SVG</Button>
    <Button startIcon={<Print />} variant="contained" onClick={() => window.print()}>Imprimir etiqueta</Button>
  </DialogActions></Dialog>
}
