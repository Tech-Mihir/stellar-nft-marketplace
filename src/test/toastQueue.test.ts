import { describe, it, expect } from 'vitest'
import { addToast, removeToast } from '../utils/toastQueue'
import type { Toast } from '../types'

const makeToast = (id: string): Toast => ({ id, type: 'success', message: `msg-${id}` })

describe('toastQueue', () => {
  it('adds a toast', () => {
    const result = addToast([], makeToast('1'))
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
  })

  it('evicts oldest when exceeding MAX_TOASTS (3)', () => {
    let queue: Toast[] = []
    queue = addToast(queue, makeToast('1'))
    queue = addToast(queue, makeToast('2'))
    queue = addToast(queue, makeToast('3'))
    queue = addToast(queue, makeToast('4'))
    expect(queue).toHaveLength(3)
    expect(queue[0].id).toBe('2')
    expect(queue[2].id).toBe('4')
  })

  it('removes a toast by id', () => {
    const queue = [makeToast('1'), makeToast('2'), makeToast('3')]
    const result = removeToast(queue, '2')
    expect(result).toHaveLength(2)
    expect(result.find((t) => t.id === '2')).toBeUndefined()
  })

  it('returns same queue if id not found', () => {
    const queue = [makeToast('1')]
    const result = removeToast(queue, 'nonexistent')
    expect(result).toHaveLength(1)
  })
})
