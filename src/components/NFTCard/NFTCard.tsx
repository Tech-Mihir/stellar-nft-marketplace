import { useState } from 'react'

interface NFTCardProps {
  tokenId: string
  imageUrl: string
  isStaked: boolean
  isPending: boolean
  onStake?: () => void
  onUnstake?: () => void
}

export function NFTCard({ tokenId, imageUrl, isStaked, isPending, onStake, onUnstake }: NFTCardProps) {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-brand-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-brand-500/10">
      {/* Image */}
      <div className="relative aspect-square bg-white/5">
        {imgError ? (
          <div className="w-full h-full flex items-center justify-center text-gray-500" role="img" aria-label={`NFT #${tokenId} image unavailable`}>
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={`NFT #${tokenId}`}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        )}
        {isStaked && (
          <span className="absolute top-2 right-2 bg-green-500/90 text-white text-xs font-bold px-2 py-1 rounded-full">
            Staked
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-white font-semibold mb-3">NFT #{tokenId}</p>
        {isPending ? (
          <button disabled aria-label={`NFT #${tokenId} transaction pending`} className="w-full min-h-[44px] rounded-lg bg-white/10 text-white/50 flex items-center justify-center gap-2 cursor-not-allowed text-sm">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Pending...
          </button>
        ) : isStaked ? (
          <button
            onClick={onUnstake}
            aria-label={`Unstake NFT #${tokenId}`}
            className="w-full min-h-[44px] rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30 transition-colors text-sm font-medium"
          >
            Unstake
          </button>
        ) : (
          <button
            onClick={onStake}
            aria-label={`Stake NFT #${tokenId}`}
            className="w-full min-h-[44px] rounded-lg bg-brand-600 hover:bg-brand-700 text-white transition-colors text-sm font-medium"
          >
            Stake
          </button>
        )}
      </div>
    </div>
  )
}
