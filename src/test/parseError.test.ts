import { describe, it, expect } from 'vitest'
import { parseTransactionError } from '../utils/parseError'

describe('parseTransactionError', () => {
  it('handles null/undefined', () => {
    expect(parseTransactionError(null)).toBe('An unknown error occurred')
    expect(parseTransactionError(undefined)).toBe('An unknown error occurred')
  })

  it('detects user rejection by code', () => {
    expect(parseTransactionError({ code: 4001 })).toBe('Transaction cancelled by user')
  })

  it('detects user rejection by message', () => {
    expect(parseTransactionError({ message: 'user rejected the request' })).toBe('Transaction cancelled by user')
  })

  it('detects simulation failure', () => {
    const result = parseTransactionError({ message: 'Simulation failed: contract error' })
    expect(result).toBe('Contract error: contract error')
  })

  it('detects timeout', () => {
    const result = parseTransactionError({ message: 'Transaction confirmation timeout' })
    expect(result).toContain('timed out')
  })

  it('detects insufficient balance', () => {
    const result = parseTransactionError({ message: 'insufficient XLM' })
    expect(result).toContain('Insufficient')
  })

  it('returns generic message for unknown errors', () => {
    expect(parseTransactionError({ message: 'some random error' })).toBe('some random error')
  })

  it('returns fallback for non-error objects', () => {
    expect(parseTransactionError({})).toBe('An unknown error occurred')
  })
})
