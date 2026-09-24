import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { collection, limit, onSnapshot, orderBy, query, type DocumentData, type QueryDocumentSnapshot } from 'firebase/firestore'
import { requireDb } from '../../firebase/client'
import type { Box, Checkout, Material, Movement, Stock } from '../../models/inventory'
import { useAuth } from '../auth/AuthContext'

interface InventoryContextValue {
  materials: Material[]
  boxes: Box[]
  stocks: Stock[]
  checkouts: Checkout[]
  movements: Movement[]
  loading: boolean
  stockFor: (materialId: string, boxId?: string) => number
  inUseFor: (materialId: string) => number
}

const InventoryContext = createContext<InventoryContextValue | null>(null)
const mapDoc = <T,>(snap: QueryDocumentSnapshot<DocumentData>) => ({ id: snap.id, ...snap.data() }) as T

export function InventoryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [materials, setMaterials] = useState<Material[]>([])
  const [boxes, setBoxes] = useState<Box[]>([])
  const [stocks, setStocks] = useState<Stock[]>([])
  const [checkouts, setCheckouts] = useState<Checkout[]>([])
  const [movements, setMovements] = useState<Movement[]>([])
  const [ready, setReady] = useState(0)

  useEffect(() => {
    if (!user) return
    const db = requireDb()
    const subscriptions = [
      onSnapshot(collection(db, 'materials'), (snapshot) => { setMaterials(snapshot.docs.map(mapDoc<Material>)); setReady((value) => value | 1) }),
      onSnapshot(collection(db, 'boxes'), (snapshot) => { setBoxes(snapshot.docs.map(mapDoc<Box>)); setReady((value) => value | 2) }),
      onSnapshot(collection(db, 'stocks'), (snapshot) => { setStocks(snapshot.docs.map(mapDoc<Stock>)); setReady((value) => value | 4) }),
      onSnapshot(collection(db, 'checkouts'), (snapshot) => { setCheckouts(snapshot.docs.map(mapDoc<Checkout>)); setReady((value) => value | 8) }),
      onSnapshot(query(collection(db, 'movements'), orderBy('createdAt', 'desc'), limit(100)), (snapshot) => { setMovements(snapshot.docs.map(mapDoc<Movement>)); setReady((value) => value | 16) }),
    ]
    return () => subscriptions.forEach((unsubscribe) => unsubscribe())
  }, [user])

  const value = useMemo<InventoryContextValue>(() => ({
    materials,
    boxes,
    stocks,
    checkouts,
    movements,
    loading: Boolean(user) && ready !== 31,
    stockFor: (materialId, boxId) => stocks.filter((stock) => stock.materialId === materialId && (!boxId || stock.boxId === boxId)).reduce((sum, stock) => sum + stock.quantity, 0),
    inUseFor: (materialId) => checkouts.filter((checkout) => checkout.materialId === materialId && checkout.status === 'open').reduce((sum, checkout) => sum + checkout.pendingQuantity, 0),
  }), [boxes, checkouts, materials, movements, ready, stocks, user])

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>
}

export function useInventory() {
  const value = useContext(InventoryContext)
  if (!value) throw new Error('useInventory tem de ser usado dentro de InventoryProvider')
  return value
}
