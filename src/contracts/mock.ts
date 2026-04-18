/**
 * Mock data layer — used when real Soroban contracts are not configured.
 * Simulates contract responses with realistic demo data.
 */
import type { NFT } from '../types'

export const MOCK_NFTS: NFT[] = [
  { tokenId: '1', imageUrl: 'https://placehold.co/400x400/1a0533/a78bfa?text=NFT+%231', isStaked: false, owner: '' },
  { tokenId: '2', imageUrl: 'https://placehold.co/400x400/0f1a33/7dd3fc?text=NFT+%232', isStaked: true,  owner: '' },
  { tokenId: '3', imageUrl: 'https://placehold.co/400x400/1a1a0f/fbbf24?text=NFT+%233', isStaked: false, owner: '' },
  { tokenId: '4', imageUrl: 'https://placehold.co/400x400/0f2a1a/34d399?text=NFT+%234', isStaked: true,  owner: '' },
]

export const MOCK_REWARDS = '12.5000'

export function isMockMode(): boolean {
  const nft = import.meta.env.VITE_NFT_CONTRACT_ID ?? ''
  const token = import.meta.env.VITE_TOKEN_CONTRACT_ID ?? ''
  const staking = import.meta.env.VITE_STAKING_CONTRACT_ID ?? ''
  const isPlaceholder = (id: string) => !id || /^C[A]+$/.test(id) || id.length !== 56
  return isPlaceholder(nft) || isPlaceholder(token) || isPlaceholder(staking)
}

/** Simulate a short async delay like a real network call */
export const mockDelay = (ms = 800) => new Promise((r) => setTimeout(r, ms))
