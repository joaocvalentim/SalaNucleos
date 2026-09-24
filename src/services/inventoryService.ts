import {
  addDoc, collection, doc, runTransaction, serverTimestamp, updateDoc,
} from 'firebase/firestore'
import { requireDb } from '../firebase/client'
import type { ActionInput, Box, BoxDraft, Material, MaterialDraft, MovementType } from '../models/inventory'
import { isPositiveInteger, normalizeText } from '../utils/text'

const stockId = (materialId: string, boxId: string) => `${materialId}__${boxId}`
const fail = (message: string): never => { throw new Error(`APP:${message}`) }

function validatePerson(person: string) {
  if (!person.trim()) fail('Indica quem está a fazer esta ação.')
}

export async function createMaterial(draft: MaterialDraft) {
  if (!draft.name.trim()) fail('O nome do material é obrigatório.')
  return addDoc(collection(requireDb(), 'materials'), {
    ...draft,
    name: draft.name.trim(),
    normalizedName: normalizeText(draft.name),
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updateMaterial(id: string, draft: MaterialDraft) {
  if (!draft.name.trim()) fail('O nome do material é obrigatório.')
  return updateDoc(doc(requireDb(), 'materials', id), {
    ...draft,
    name: draft.name.trim(),
    normalizedName: normalizeText(draft.name),
    updatedAt: serverTimestamp(),
  })
}

export async function setMaterialActive(id: string, active: boolean) {
  return updateDoc(doc(requireDb(), 'materials', id), { active, updatedAt: serverTimestamp() })
}

export async function createBox(draft: BoxDraft) {
  if (!draft.name.trim() || !draft.code.trim()) fail('O nome e o código da caixa são obrigatórios.')
  return addDoc(collection(requireDb(), 'boxes'), {
    ...draft,
    code: draft.code.trim().toUpperCase(),
    name: draft.name.trim(),
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updateBox(id: string, draft: BoxDraft) {
  if (!draft.name.trim() || !draft.code.trim()) fail('O nome e o código da caixa são obrigatórios.')
  return updateDoc(doc(requireDb(), 'boxes', id), {
    ...draft,
    code: draft.code.trim().toUpperCase(),
    name: draft.name.trim(),
    updatedAt: serverTimestamp(),
  })
}

export async function setBoxActive(id: string, active: boolean) {
  return updateDoc(doc(requireDb(), 'boxes', id), { active, updatedAt: serverTimestamp() })
}

function movementBase(type: MovementType, input: ActionInput, material: Material) {
  return {
    type,
    materialId: material.id,
    materialNameSnapshot: material.name,
    quantity: input.quantity,
    delta: null,
    sourceBoxId: input.sourceBoxId ?? null,
    sourceBoxNameSnapshot: null,
    destinationBoxId: input.destinationBoxId ?? null,
    destinationBoxNameSnapshot: null,
    checkoutId: input.checkoutId ?? null,
    person: input.person.trim(),
    reason: input.reason.trim(),
    note: input.note.trim(),
    sourceQuantityBefore: null,
    sourceQuantityAfter: null,
    destinationQuantityBefore: null,
    destinationQuantityAfter: null,
    createdAt: serverTimestamp(),
  }
}

export async function addStock(input: ActionInput) {
  validatePerson(input.person)
  if (!isPositiveInteger(input.quantity) || !input.destinationBoxId) fail('Indica uma quantidade e uma caixa válidas.')
  const db = requireDb()
  const operationRef = doc(collection(db, 'movements'))
  await runTransaction(db, async (tx) => {
    const materialRef = doc(db, 'materials', input.materialId)
    const boxRef = doc(db, 'boxes', input.destinationBoxId!)
    const stockRef = doc(db, 'stocks', stockId(input.materialId, input.destinationBoxId!))
    const [materialSnap, boxSnap, stockSnap] = await Promise.all([tx.get(materialRef), tx.get(boxRef), tx.get(stockRef)])
    if (!materialSnap.exists() || !boxSnap.exists()) fail('Material ou caixa não encontrado.')
    const material = { id: materialSnap.id, ...materialSnap.data() } as Material
    const box = { id: boxSnap.id, ...boxSnap.data() } as Box
    if (!material.active || !box.active) fail('Não é possível usar um material ou caixa desativados.')
    const before = stockSnap.exists() ? Number(stockSnap.data().quantity) : 0
    const after = before + input.quantity
    tx.set(stockRef, { materialId: material.id, boxId: box.id, quantity: after, updatedAt: serverTimestamp(), lastOperationId: operationRef.id })
    tx.set(operationRef, { ...movementBase('stock_in', input, material), destinationBoxNameSnapshot: box.name, destinationQuantityBefore: before, destinationQuantityAfter: after })
  })
}

export async function checkoutStock(input: ActionInput) {
  validatePerson(input.person)
  if (!isPositiveInteger(input.quantity) || !input.sourceBoxId || !input.reason.trim()) fail('Preenche a quantidade, caixa e motivo.')
  const db = requireDb()
  const operationRef = doc(collection(db, 'movements'))
  const checkoutRef = doc(collection(db, 'checkouts'))
  await runTransaction(db, async (tx) => {
    const materialRef = doc(db, 'materials', input.materialId)
    const boxRef = doc(db, 'boxes', input.sourceBoxId!)
    const stockRef = doc(db, 'stocks', stockId(input.materialId, input.sourceBoxId!))
    const [materialSnap, boxSnap, stockSnap] = await Promise.all([tx.get(materialRef), tx.get(boxRef), tx.get(stockRef)])
    if (!materialSnap.exists() || !boxSnap.exists()) fail('Material ou caixa não encontrado.')
    const material = { id: materialSnap.id, ...materialSnap.data() } as Material
    const box = { id: boxSnap.id, ...boxSnap.data() } as Box
    const before = stockSnap.exists() ? Number(stockSnap.data().quantity) : 0
    if (before < input.quantity) fail(`Existem apenas ${before} unidades nesta caixa.`)
    const after = before - input.quantity
    tx.set(stockRef, { materialId: material.id, boxId: box.id, quantity: after, updatedAt: serverTimestamp(), lastOperationId: operationRef.id })
    tx.set(checkoutRef, {
      materialId: material.id, materialNameSnapshot: material.name, sourceBoxId: box.id, sourceBoxNameSnapshot: box.name,
      initialQuantity: input.quantity, pendingQuantity: input.quantity, person: input.person.trim(), reason: input.reason.trim(), note: input.note.trim(),
      status: 'open', createdAt: serverTimestamp(), closedAt: null, lastOperationId: operationRef.id,
    })
    tx.set(operationRef, { ...movementBase('checkout', input, material), sourceBoxNameSnapshot: box.name, sourceQuantityBefore: before, sourceQuantityAfter: after, checkoutId: checkoutRef.id })
  })
}

export async function transferStock(input: ActionInput) {
  validatePerson(input.person)
  if (!isPositiveInteger(input.quantity) || !input.sourceBoxId || !input.destinationBoxId) fail('Preenche a quantidade, origem e destino.')
  if (input.sourceBoxId === input.destinationBoxId) fail('A origem e o destino têm de ser diferentes.')
  const db = requireDb()
  const operationRef = doc(collection(db, 'movements'))
  await runTransaction(db, async (tx) => {
    const refs = {
      material: doc(db, 'materials', input.materialId), sourceBox: doc(db, 'boxes', input.sourceBoxId!), destinationBox: doc(db, 'boxes', input.destinationBoxId!),
      sourceStock: doc(db, 'stocks', stockId(input.materialId, input.sourceBoxId!)), destinationStock: doc(db, 'stocks', stockId(input.materialId, input.destinationBoxId!)),
    }
    const [materialSnap, sourceBoxSnap, destinationBoxSnap, sourceStockSnap, destinationStockSnap] = await Promise.all(Object.values(refs).map((ref) => tx.get(ref)))
    if (!materialSnap.exists() || !sourceBoxSnap.exists() || !destinationBoxSnap.exists()) fail('Material ou caixa não encontrado.')
    const material = { id: materialSnap.id, ...materialSnap.data() } as Material
    const sourceBox = { id: sourceBoxSnap.id, ...sourceBoxSnap.data() } as Box
    const destinationBox = { id: destinationBoxSnap.id, ...destinationBoxSnap.data() } as Box
    if (!destinationBox.active) fail('A caixa de destino está desativada.')
    const sourceBefore = sourceStockSnap.exists() ? Number(sourceStockSnap.data().quantity) : 0
    const destinationBefore = destinationStockSnap.exists() ? Number(destinationStockSnap.data().quantity) : 0
    if (sourceBefore < input.quantity) fail(`Existem apenas ${sourceBefore} unidades na origem.`)
    const sourceAfter = sourceBefore - input.quantity
    const destinationAfter = destinationBefore + input.quantity
    tx.set(refs.sourceStock, { materialId: material.id, boxId: sourceBox.id, quantity: sourceAfter, updatedAt: serverTimestamp(), lastOperationId: operationRef.id })
    tx.set(refs.destinationStock, { materialId: material.id, boxId: destinationBox.id, quantity: destinationAfter, updatedAt: serverTimestamp(), lastOperationId: operationRef.id })
    tx.set(operationRef, { ...movementBase('transfer', input, material), sourceBoxNameSnapshot: sourceBox.name, destinationBoxNameSnapshot: destinationBox.name, sourceQuantityBefore: sourceBefore, sourceQuantityAfter: sourceAfter, destinationQuantityBefore: destinationBefore, destinationQuantityAfter: destinationAfter })
  })
}

export async function writeOffStock(input: ActionInput) {
  validatePerson(input.person)
  if (!isPositiveInteger(input.quantity) || !input.sourceBoxId || !input.reason.trim()) fail('Preenche a quantidade, caixa e motivo.')
  const db = requireDb()
  const operationRef = doc(collection(db, 'movements'))
  await runTransaction(db, async (tx) => {
    const materialRef = doc(db, 'materials', input.materialId)
    const boxRef = doc(db, 'boxes', input.sourceBoxId!)
    const stockRef = doc(db, 'stocks', stockId(input.materialId, input.sourceBoxId!))
    const [materialSnap, boxSnap, stockSnap] = await Promise.all([tx.get(materialRef), tx.get(boxRef), tx.get(stockRef)])
    if (!materialSnap.exists() || !boxSnap.exists()) fail('Material ou caixa não encontrado.')
    const material = { id: materialSnap.id, ...materialSnap.data() } as Material
    const box = { id: boxSnap.id, ...boxSnap.data() } as Box
    const before = stockSnap.exists() ? Number(stockSnap.data().quantity) : 0
    if (before < input.quantity) fail(`Existem apenas ${before} unidades nesta caixa.`)
    const after = before - input.quantity
    tx.set(stockRef, { materialId: material.id, boxId: box.id, quantity: after, updatedAt: serverTimestamp(), lastOperationId: operationRef.id })
    tx.set(operationRef, { ...movementBase('write_off_stock', input, material), sourceBoxNameSnapshot: box.name, sourceQuantityBefore: before, sourceQuantityAfter: after })
  })
}

export async function correctStock(input: ActionInput) {
  validatePerson(input.person)
  if (!input.sourceBoxId || input.newQuantity === undefined || !Number.isInteger(input.newQuantity) || input.newQuantity < 0 || !input.reason.trim()) fail('Indica a quantidade real, caixa e motivo.')
  const db = requireDb()
  const correctedQuantity = input.newQuantity!
  const operationRef = doc(collection(db, 'movements'))
  await runTransaction(db, async (tx) => {
    const materialRef = doc(db, 'materials', input.materialId)
    const boxRef = doc(db, 'boxes', input.sourceBoxId!)
    const stockRef = doc(db, 'stocks', stockId(input.materialId, input.sourceBoxId!))
    const [materialSnap, boxSnap, stockSnap] = await Promise.all([tx.get(materialRef), tx.get(boxRef), tx.get(stockRef)])
    if (!materialSnap.exists() || !boxSnap.exists()) fail('Material ou caixa não encontrado.')
    const material = { id: materialSnap.id, ...materialSnap.data() } as Material
    const box = { id: boxSnap.id, ...boxSnap.data() } as Box
    const before = stockSnap.exists() ? Number(stockSnap.data().quantity) : 0
    if (before === correctedQuantity) fail('A quantidade indicada é igual à quantidade atual.')
    tx.set(stockRef, { materialId: material.id, boxId: box.id, quantity: correctedQuantity, updatedAt: serverTimestamp(), lastOperationId: operationRef.id })
    tx.set(operationRef, { ...movementBase('correction', { ...input, quantity: Math.abs(correctedQuantity - before) }, material), delta: correctedQuantity - before, sourceBoxNameSnapshot: box.name, sourceQuantityBefore: before, sourceQuantityAfter: correctedQuantity })
  })
}

export async function returnCheckout(input: ActionInput) {
  validatePerson(input.person)
  if (!input.checkoutId || !input.destinationBoxId || !isPositiveInteger(input.quantity)) fail('Preenche a quantidade e a caixa de destino.')
  const db = requireDb()
  const operationRef = doc(collection(db, 'movements'))
  await runTransaction(db, async (tx) => {
    const checkoutRef = doc(db, 'checkouts', input.checkoutId!)
    const destinationBoxRef = doc(db, 'boxes', input.destinationBoxId!)
    const checkoutSnap = await tx.get(checkoutRef)
    if (!checkoutSnap.exists()) fail('O levantamento já não existe.')
    const checkout = checkoutSnap.data()!
    const stockRef = doc(db, 'stocks', stockId(checkout.materialId, input.destinationBoxId!))
    const materialRef = doc(db, 'materials', checkout.materialId)
    const [boxSnap, stockSnap, materialSnap] = await Promise.all([tx.get(destinationBoxRef), tx.get(stockRef), tx.get(materialRef)])
    if (!boxSnap.exists() || !materialSnap.exists()) fail('Material ou caixa não encontrado.')
    if (checkout.status !== 'open' || checkout.pendingQuantity < input.quantity) fail(`Só existem ${checkout.pendingQuantity ?? 0} unidades pendentes.`)
    const material = { id: materialSnap.id, ...materialSnap.data() } as Material
    const box = { id: boxSnap.id, ...boxSnap.data() } as Box
    if (!box.active) fail('A caixa de destino está desativada.')
    const before = stockSnap.exists() ? Number(stockSnap.data().quantity) : 0
    const after = before + input.quantity
    const pending = checkout.pendingQuantity - input.quantity
    tx.set(stockRef, { materialId: material.id, boxId: box.id, quantity: after, updatedAt: serverTimestamp(), lastOperationId: operationRef.id })
    tx.update(checkoutRef, { pendingQuantity: pending, status: pending === 0 ? 'closed' : 'open', closedAt: pending === 0 ? serverTimestamp() : null, lastOperationId: operationRef.id })
    tx.set(operationRef, { ...movementBase('return', { ...input, materialId: material.id }, material), destinationBoxNameSnapshot: box.name, destinationQuantityBefore: before, destinationQuantityAfter: after })
  })
}

export async function writeOffCheckout(input: ActionInput) {
  validatePerson(input.person)
  if (!input.checkoutId || !isPositiveInteger(input.quantity) || !input.reason.trim()) fail('Preenche a quantidade e o motivo.')
  const db = requireDb()
  const operationRef = doc(collection(db, 'movements'))
  await runTransaction(db, async (tx) => {
    const checkoutRef = doc(db, 'checkouts', input.checkoutId!)
    const checkoutSnap = await tx.get(checkoutRef)
    if (!checkoutSnap.exists()) fail('O levantamento já não existe.')
    const checkout = checkoutSnap.data()!
    const materialRef = doc(db, 'materials', checkout.materialId)
    const materialSnap = await tx.get(materialRef)
    if (!materialSnap.exists()) fail('Material não encontrado.')
    if (checkout.status !== 'open' || checkout.pendingQuantity < input.quantity) fail(`Só existem ${checkout.pendingQuantity ?? 0} unidades pendentes.`)
    const material = { id: materialSnap.id, ...materialSnap.data() } as Material
    const pending = checkout.pendingQuantity - input.quantity
    tx.update(checkoutRef, { pendingQuantity: pending, status: pending === 0 ? 'closed' : 'open', closedAt: pending === 0 ? serverTimestamp() : null, lastOperationId: operationRef.id })
    tx.set(operationRef, { ...movementBase('write_off_checkout', { ...input, materialId: material.id }, material), sourceBoxId: checkout.sourceBoxId, sourceBoxNameSnapshot: checkout.sourceBoxNameSnapshot })
  })
}
