import { useRef, useCallback } from 'react'
import { CONTRACT_CALL_DEBOUNCE_MS } from '../constants'

/**
 * Returns a debounced version of the given async function.
 * Prevents duplicate contract calls from rapid button clicks.
 */
export function useDebounce<T extends unknown[]>(
  fn: (...args: T) => Promise<void>,
  delay = CONTRACT_CALL_DEBOUNCE_MS
): (...args: T) => Promise<void> {
  const lastCall = useRef(0)

  return useCallback(
    async (...args: T) => {
      const now = Date.now()
      if (now - lastCall.current < delay) return
      lastCall.current = now
      await fn(...args)
    },
    [fn, delay]
  )
}
