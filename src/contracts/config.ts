import type { ContractConfig } from '../types'
import { STELLAR_TESTNET_RPC, STELLAR_TESTNET_PASSPHRASE } from '../constants'

export { STELLAR_TESTNET_RPC, STELLAR_TESTNET_PASSPHRASE }
export const STELLAR_MAINNET_PASSPHRASE = 'Public Global Stellar Network ; September 2015'

// Stellar contract IDs start with C and are 56 chars — placeholders like CAAA... are invalid
function isValidContractId(id: string): boolean {
  return typeof id === 'string' && id.startsWith('C') && id.length === 56 && !/^C[A]+$/.test(id)
}

export function getContractConfig(): ContractConfig {
  const nftContractId = import.meta.env.VITE_NFT_CONTRACT_ID
  const tokenContractId = import.meta.env.VITE_TOKEN_CONTRACT_ID
  const stakingContractId = import.meta.env.VITE_STAKING_CONTRACT_ID
  const rpcUrl = import.meta.env.VITE_SOROBAN_RPC_URL || STELLAR_TESTNET_RPC
  const networkPassphrase = import.meta.env.VITE_NETWORK_PASSPHRASE || STELLAR_TESTNET_PASSPHRASE

  if (!nftContractId) throw new Error('Missing env var: VITE_NFT_CONTRACT_ID')
  if (!tokenContractId) throw new Error('Missing env var: VITE_TOKEN_CONTRACT_ID')
  if (!stakingContractId) throw new Error('Missing env var: VITE_STAKING_CONTRACT_ID')

  if (!isValidContractId(nftContractId) || !isValidContractId(tokenContractId) || !isValidContractId(stakingContractId)) {
    throw new Error('contracts_not_configured')
  }

  return { nftContractId, tokenContractId, stakingContractId, networkPassphrase, rpcUrl }
}
