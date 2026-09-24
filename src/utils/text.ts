export function normalizeText(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, ' ')
}

export function isPositiveInteger(value: number) {
  return Number.isInteger(value) && value > 0
}
