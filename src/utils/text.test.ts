import { describe, expect, it } from 'vitest'
import { isPositiveInteger, normalizeText } from './text'

describe('normalizeText', () => {
  it('normaliza acentos, maiúsculas e espaços', () => {
    expect(normalizeText('  EXTENSÃO   Elétrica ')).toBe('extensao eletrica')
  })
})

describe('isPositiveInteger', () => {
  it('aceita apenas inteiros positivos', () => {
    expect(isPositiveInteger(2)).toBe(true)
    expect(isPositiveInteger(0)).toBe(false)
    expect(isPositiveInteger(1.5)).toBe(false)
  })
})
