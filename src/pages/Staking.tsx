import { useNFTs } from '../hooks/useNFTs'
import { useStaking } from '../hooks/useStaking'
import { useRewards } from '../hooks/useRewards'
import { useDebounce } from '../hooks/useDebounce'
import { NFTCard } from '../components/NFTCard/NFTCard'
import { isMockMode } from '../contracts/mock'
import type { Toast } from '../types'

interface StakingProps {
  publicKey: string
  signTransaction: (xdr: string) => Promise<string>
  addToast: (t: Omit<Toast, 'id'>) => void
}

export function Staking({ publicKey, signTransaction, addToast }: StakingProps) {
  const toastFn = (t: { type: 'pending' | 'success' | 'error'; message: string }) => addToast(t)
  const { nfts, isLoading, refresh } = useNFTs(publicKey, signTransaction, toastFn)
  const { unstake, isUnstaking } = useStaking(publicKey, signTransaction, toastFn, refresh)
  const { balance, isClaiming, claim } = useRewards(publicKey, signTransaction, toastFn)
  const debouncedUnstake = useDebounce(unstake)
  const debouncedClaim = useDebounce(claim)

  const stakedNFTs = nfts.filter((n) => n.isStaked)

  if (!publicKey) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center px-4">
        <div className="text-5xl mb-4">🔌</div>
        <h2 className="text-xl font-semibold text-white mb-2">Wallet not connected</h2>
        <p className="text-gray-400">Connect your Freighter wallet to manage staking.</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Contract integration banner */}
      {!isMockMode() && (
        <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 flex items-start gap-3">
          <span className="text-green-400 text-lg mt-0.5">✅</span>
          <div className="text-sm space-y-1 min-w-0">
            <p className="text-green-300 font-medium">Inter-contract calls active — Staking ↔ NFT ↔ Token on Stellar Testnet</p>
            <p className="text-gray-400 font-mono text-xs truncate">Token (RWD): {import.meta.env.VITE_TOKEN_CONTRACT_ID}</p>
            <p className="text-gray-400 font-mono text-xs truncate">Staking: {import.meta.env.VITE_STAKING_CONTRACT_ID}</p>
          </div>
        </div>
      )}
      {/* Rewards Panel */}
      <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-2xl p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-gray-400 text-sm mb-1">Pending Stellar Rewards</p>
            <p className="text-3xl font-bold text-white">{balance} <span className="text-purple-400 text-lg">RWD</span></p>
            <p className="text-gray-500 text-sm mt-1">{stakedNFTs.length} NFT{stakedNFTs.length !== 1 ? 's' : ''} staked on Soroban</p>
          </div>
          <button
            onClick={debouncedClaim}
            disabled={isClaiming || balance === '0.0000'}
            className="min-h-[44px] px-6 py-3 rounded-xl text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isClaiming ? (
              <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Claiming...</>
            ) : 'Claim Rewards'}
          </button>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-white mb-6">Staked NFTs</h1>

      {isLoading && (
        <div className="flex justify-center py-20">
          <svg className="animate-spin h-10 w-10 text-purple-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
      )}

      {!isLoading && stakedNFTs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-5xl mb-4">💎</div>
          <h2 className="text-xl font-semibold text-white mb-2">No staked NFTs</h2>
          <p className="text-gray-400">Stake your NFTs from the Dashboard to start earning Stellar rewards.</p>
        </div>
      )}

      {!isLoading && stakedNFTs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {stakedNFTs.map((nft) => (
            <NFTCard
              key={nft.tokenId}
              tokenId={nft.tokenId}
              imageUrl={nft.imageUrl}
              isStaked={true}
              isPending={!!isUnstaking[nft.tokenId]}
              onUnstake={() => debouncedUnstake(nft.tokenId)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
