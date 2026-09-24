import type { Timestamp } from 'firebase/firestore'

export type MovementType = 'stock_in' | 'checkout' | 'return' | 'transfer' | 'write_off_stock' | 'write_off_checkout' | 'correction'

export interface Material {
  id: string
  name: string
  normalizedName: string
  description: string
  category: string
  unit: string
  minimumStock: number | null
  notes: string
  active: boolean
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
}

export interface Box {
  id: string
  code: string
  name: string
  description: string
  roomLocation: string
  notes: string
  active: boolean
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
}

export interface Stock {
  id: string
  materialId: string
  boxId: string
  quantity: number
  updatedAt: Timestamp | null
  lastOperationId: string
}

export interface Checkout {
  id: string
  materialId: string
  materialNameSnapshot: string
  sourceBoxId: string
  sourceBoxNameSnapshot: string
  initialQuantity: number
  pendingQuantity: number
  person: string
  reason: string
  note: string
  status: 'open' | 'closed'
  createdAt: Timestamp | null
  closedAt: Timestamp | null
  lastOperationId: string
}

export interface Movement {
  id: string
  type: MovementType
  materialId: string
  materialNameSnapshot: string
  quantity: number
  delta: number | null
  sourceBoxId: string | null
  sourceBoxNameSnapshot: string | null
  destinationBoxId: string | null
  destinationBoxNameSnapshot: string | null
  checkoutId: string | null
  person: string
  reason: string
  note: string
  sourceQuantityBefore: number | null
  sourceQuantityAfter: number | null
  destinationQuantityBefore: number | null
  destinationQuantityAfter: number | null
  createdAt: Timestamp | null
}

export interface MaterialDraft {
  name: string
  description: string
  category: string
  unit: string
  minimumStock: number | null
  notes: string
}

export interface BoxDraft {
  code: string
  name: string
  description: string
  roomLocation: string
  notes: string
}

export interface ActionInput {
  materialId: string
  quantity: number
  sourceBoxId?: string
  destinationBoxId?: string
  checkoutId?: string
  person: string
  reason: string
  note: string
  newQuantity?: number
}
