import type { Toast } from '../types'
import { MAX_TOASTS } from '../constants'

/**
 * Adds a toast to the queue, evicting the oldest if limit exceeded (FIFO).
 */
export function addToast(queue: Toast[], toast: Toast): Toast[] {
  const updated = [...queue, toast]
  if (updated.length > MAX_TOASTS) {
    return updated.slice(updated.length - MAX_TOASTS)
  }
  return updated
}

/**
 * Removes a toast by id.
 */
export function removeToast(queue: Toast[], id: string): Toast[] {
  return queue.filter((t) => t.id !== id)
}

/**
 * Generates a simple unique id for toasts.
 */
export function generateToastId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}
