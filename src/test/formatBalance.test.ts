import { describe, it, expect } from 'vitest'
import { formatBalance } from '../utils/formatBalance'

describe('formatBalance', () => {
  it('formats zero correctly', () => {
    expect(formatBalance(0n, 7)).toBe('0.0000000')
  })

  it('formats whole number with decimals', () => {
    expect(formatBalance(10_000_000n, 7)).toBe('1.0000000')
  })

  it('formats fractional amount', () => {
    expect(formatBalance(1_234_567n, 7)).toBe('0.1234567')
  })

  it('pads to at least 4 decimal places', () => {
    const result = formatBalance(100n, 2)
    expect(result).toBe('1.0000')
  })

  it('handles large balances', () => {
    expect(formatBalance(1_000_000_000_000n, 7)).toBe('100000.0000000')
  })
})
