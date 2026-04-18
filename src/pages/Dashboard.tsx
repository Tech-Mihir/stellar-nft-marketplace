import { useNFTs } from '../hooks/useNFTs'
import { useStaking } from '../hooks/useStaking'
import { useDebounce } from '../hooks/useDebounce'
import { NFTCard } from '../components/NFTCard/NFTCard'
import type { Toast } from '../types'

interface DashboardProps {
  publicKey: string
  signTransaction: (xdr: string) => Promise<string>
  addToast: (t: Omit<Toast, 'id'>) => void
}

export function Dashboard({ publicKey, signTransaction, addToast }: DashboardProps) {
  const toastFn = (t: { type: 'pending' | 'success' | 'error'; message: string }) => addToast(t)
  const { nfts, isLoading, isMinting, error, refresh, mint } = useNFTs(publicKey, signTransaction, toastFn)
  const { stake, isStaking } = useStaking(publicKey, signTransaction, toastFn, refresh)
  const debouncedMint = useDebounce(mint)
  const debouncedStake = useDebounce(stake)

  if (!publicKey) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center px-4">
        <div className="text-5xl mb-4">🔌</div>
        <h2 className="text-xl font-semibold text-white mb-2">Wallet not connected</h2>
        <p className="text-gray-400">Connect your Freighter wallet to view your NFTs.</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">My Stellar NFTs</h1>
          <p className="text-gray-400 text-sm mt-1">{nfts.length} asset{nfts.length !== 1 ? 's' : ''} on Stellar</p>
        </div>
        <button
          onClick={debouncedMint}
          disabled={isMinting || !publicKey}
          className="min-h-[44px] px-6 py-2 rounded-xl text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {isMinting ? (
            <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Minting...</>
          ) : '+ Mint NFT'}
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-20">
          <svg className="animate-spin h-10 w-10 text-purple-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
      )}

      {error && !isLoading && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={refresh} className="min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">Retry</button>
        </div>
      )}      {!isLoading && !error && nfts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-5xl mb-4">🌟</div>
          <h2 className="text-xl font-semibold text-white mb-2">No NFTs yet</h2>
          <p className="text-gray-400 mb-6">Mint your first Stellar game asset to get started.</p>
        </div>
      )}

      {!isLoading && !error && nfts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {nfts.map((nft) => (
            <NFTCard
              key={nft.tokenId}
              tokenId={nft.tokenId}
              imageUrl={nft.imageUrl}
              isStaked={nft.isStaked}
              isPending={!!isStaking[nft.tokenId]}
              onStake={!nft.isStaked ? () => debouncedStake(nft.tokenId) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}
