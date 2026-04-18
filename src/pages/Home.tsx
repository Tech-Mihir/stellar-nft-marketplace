import { Link } from 'react-router-dom'
import { WalletButton } from '../components/WalletButton/WalletButton'

interface HomeProps {
  publicKey: string
  isConnecting: boolean
  connectingMessage?: string
  onConnect: () => void
  onDisconnect: () => void
}

const features = [
  { icon: '🌟', title: 'Stellar Blockchain', description: 'Built on Stellar with Soroban smart contracts for fast, low-cost transactions.' },
  { icon: '🎮', title: 'Game Asset NFTs', description: 'Mint unique game asset NFTs directly on the Stellar network.' },
  { icon: '💎', title: 'Stake & Earn', description: 'Stake your NFTs to earn custom Stellar tokens passively over time.' },
  { icon: '⚡', title: 'Inter-Contract Calls', description: 'Advanced Soroban contract interactions for seamless staking and rewards.' },
]

export function Home({ publicKey, isConnecting, connectingMessage, onConnect, onDisconnect }: HomeProps) {
  return (
    <div className="min-h-screen">
      <section className="text-center py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-2 text-purple-400 text-sm mb-6">
            <span>⭐</span> Built on Stellar + Soroban
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6 leading-tight">
            Stellar NFT{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Game Marketplace
            </span>
          </h1>
          <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto">
            Mint game asset NFTs on Stellar, stake them via Soroban smart contracts, and earn custom token rewards.
          </p>
          {publicKey ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/dashboard" className="min-h-[44px] px-8 py-3 rounded-xl text-base font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors">
                View My NFTs
              </Link>
              <Link to="/staking" className="min-h-[44px] px-8 py-3 rounded-xl text-base font-semibold bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/20">
                Go to Staking
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <WalletButton publicKey={publicKey} isConnecting={isConnecting} connectingMessage={connectingMessage} onConnect={onConnect} onDisconnect={onDisconnect} />
              <p className="text-sm text-gray-500">
                Connect your{' '}
                <a href="https://freighter.app" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">
                  Freighter wallet
                </a>{' '}
                to get started
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-12">Why Stellar?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-purple-500/40 transition-colors">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
