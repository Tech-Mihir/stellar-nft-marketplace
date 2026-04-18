/**
 * Formats a bigint token balance into a human-readable string
 * with at least 4 decimal places.
 */
export function formatBalance(balance: bigint, decimals: number): string {
  const divisor = BigInt(10) ** BigInt(decimals)
  const whole = balance / divisor
  const remainder = balance % divisor

  // Pad remainder to full decimal width
  const remainderStr = remainder.toString().padStart(decimals, '0')

  // Ensure at least 4 decimal places
  const displayDecimals = Math.max(4, decimals)
  const truncated = remainderStr.slice(0, displayDecimals).padEnd(displayDecimals, '0')

  return `${whole}.${truncated}`
}
