import { useState, useEffect, useCallback } from 'react'
import { getContractConfig } from '../contracts/config'
import { readContract, buildContractCall, submitTransaction, Address } from '../contracts/stellar'
import { formatBalance } from '../utils/formatBalance'
import { parseTransactionError } from '../utils/parseError'
import { isMockMode, MOCK_REWARDS, mockDelay } from '../contracts/mock'

interface UseRewardsReturn {
  balance: string
  isLoading: boolean
  isClaiming: boolean
  error: string | null
  claim: () => Promise<void>
  refresh: () => Promise<void>
}

export function useRewards(
  publicKey: string,
  signTransaction: (xdr: string) => Promise<string>,
  addToast: (t: { type: 'pending' | 'success' | 'error'; message: string }) => void
): UseRewardsReturn {
  const [balance, setBalance] = useState('0.0000')
  const [isLoading, setIsLoading] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBalance = useCallback(async () => {
    if (!publicKey) { setBalance('0.0000'); return }
    setIsLoading(true)
    setError(null)
    try {
      if (isMockMode()) {
        await mockDelay(600)
        setBalance(MOCK_REWARDS)
        return
      }

      const config = getContractConfig()
      const pending = await readContract(publicKey, config.stakingContractId, 'pending_rewards', [
        new Address(publicKey).toScVal(),
      ]) as bigint
      const decimals = await readContract(publicKey, config.tokenContractId, 'decimals', []) as number
      setBalance(formatBalance(pending ?? 0n, decimals ?? 7))
    } catch (err) {
      setError(parseTransactionError(err))
      setBalance('0.0000')
    } finally {
      setIsLoading(false)
    }
  }, [publicKey])

  useEffect(() => { fetchBalance() }, [fetchBalance])

  const claim = useCallback(async () => {
    if (!publicKey) return
    setIsClaiming(true)
    setError(null)
    addToast({ type: 'pending', message: 'Claiming rewards...' })
    try {
      if (isMockMode()) {
        await mockDelay(1200)
        addToast({ type: 'success', message: 'Rewards claimed! (demo)' })
        setBalance('0.0000')
        return
      }

      const config = getContractConfig()
      const xdrStr = await buildContractCall(publicKey, config.stakingContractId, 'claim_rewards', [
        new Address(publicKey).toScVal(),
      ])
      const signed = await signTransaction(xdrStr)
      const hash = await submitTransaction(signed)
      addToast({ type: 'success', message: `Rewards claimed! Tx: ${hash.slice(0, 8)}...` })
      await fetchBalance()
    } catch (err) {
      const msg = parseTransactionError(err)
      setError(msg)
      addToast({ type: 'error', message: msg })
    } finally {
      setIsClaiming(false)
    }
  }, [publicKey, signTransaction, addToast, fetchBalance])

  return { balance, isLoading, isClaiming, error, claim, refresh: fetchBalance }
}
