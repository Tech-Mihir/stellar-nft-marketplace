import { useState, useCallback, useEffect } from 'react'
import type { StellarWallet } from '../types'
import {
  isConnected,
  isAllowed,
  setAllowed,
  getPublicKey,
  getUserInfo,
  getNetwork,
  signTransaction as freighterSignTx,
} from '@stellar/freighter-api'

export function useWallet(): StellarWallet {
  const [publicKey, setPublicKey] = useState<string>('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectingMessage, setConnectingMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [networkWarning, setNetworkWarning] = useState<string | null>(null)

  const checkNetwork = useCallback(async () => {
    try {
      const net = await getNetwork()
      const isTestnet = !net ||
        net.toUpperCase().includes('TEST') ||
        net === 'Test SDF Network ; September 2015'
      if (!isTestnet) {
        setNetworkWarning(
          `Freighter is on "${net}" but this app expects Testnet. Please switch networks in Freighter.`
        )
      } else {
        setNetworkWarning(null)
      }
    } catch { /* non-critical */ }
  }, [])

  // Silent reconnect on mount if already allowed
  useEffect(() => {
    const tryReconnect = async () => {
      try {
        const connected = await isConnected()
        if (!connected) return
        const allowed = await isAllowed()
        if (!allowed) return
        const info = await getUserInfo()
        if (info?.publicKey) {
          setPublicKey(info.publicKey)
          await checkNetwork()
        }
      } catch { /* ignore */ }
    }
    tryReconnect()
  }, [checkNetwork])

  const connect = useCallback(async () => {
    setIsConnecting(true)
    setConnectingMessage('Connecting...')
    setError(null)
    try {
      const connected = await isConnected()
      if (!connected) {
        setError('Freighter not detected. Please install it from freighter.app and refresh.')
        return
      }

      // Request permission — opens Freighter popup
      setConnectingMessage('Approve in Freighter...')
      const allowed = await setAllowed()
      if (!allowed) {
        setError('Please allow this site in Freighter to continue.')
        return
      }

      // Get the public key
      let address = ''
      try {
        const info = await getUserInfo()
        address = info?.publicKey ?? ''
      } catch {
        address = await getPublicKey()
      }

      if (address) {
        setPublicKey(address)
        await checkNetwork()
      } else {
        setError('Could not retrieve address. Please try again.')
      }
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? ''
      if (msg.toLowerCase().includes('user') || msg.toLowerCase().includes('reject')) {
        // User closed popup — no error banner needed
      } else {
        setError(msg || 'Connection failed. Please try again.')
      }
    } finally {
      setIsConnecting(false)
      setConnectingMessage('')
    }
  }, [checkNetwork])

  const disconnect = useCallback(() => {
    setPublicKey('')
    setError(null)
    setNetworkWarning(null)
  }, [])

  const signTransaction = useCallback(async (xdr: string): Promise<string> => {
    const result = await freighterSignTx(xdr, { network: 'TESTNET' })
    if (typeof result === 'string') return result
    throw new Error('Failed to sign transaction')
  }, [])

  return {
    publicKey,
    isConnected: !!publicKey,
    isConnecting,
    connectingMessage,
    error,
    networkWarning,
    connect,
    disconnect,
    signTransaction,
  }
}
