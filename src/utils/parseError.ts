/**
 * Parses Soroban/Stellar transaction errors into user-friendly messages.
 */
export function parseTransactionError(error: unknown): string {
  if (error === null || error === undefined) return 'An unknown error occurred'

  const err = error as Record<string, unknown>

  if (typeof err.message === 'string' && err.message === 'contracts_not_configured') {
    return 'contracts_not_configured'
  }

  // User rejected transaction in Freighter
  if (
    err.code === 4001 ||
    (typeof err.message === 'string' && err.message.toLowerCase().includes('user rejected'))
  ) {
    return 'Transaction cancelled by user'
  }

  // Soroban simulation failure
  if (typeof err.message === 'string' && err.message.startsWith('Simulation failed:')) {
    return err.message.replace('Simulation failed: ', 'Contract error: ')
  }

  // Transaction confirmation timeout
  if (typeof err.message === 'string' && err.message.includes('confirmation timeout')) {
    return 'Transaction timed out. Check Stellar Explorer for status.'
  }

  // On-chain failure
  if (typeof err.message === 'string' && err.message.includes('failed on-chain')) {
    return 'Transaction was rejected on-chain. Please try again.'
  }

  // Insufficient XLM balance
  if (typeof err.message === 'string' && err.message.toLowerCase().includes('insufficient')) {
    return 'Insufficient XLM balance for this transaction'
  }

  // Contract revert reason
  if (typeof err.reason === 'string' && err.reason.length > 0) {
    return `Transaction failed: ${err.reason}`
  }

  // Generic error message
  if (typeof err.message === 'string') return err.message

  return 'An unknown error occurred'
}
