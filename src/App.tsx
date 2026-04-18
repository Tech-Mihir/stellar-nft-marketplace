import { useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useWallet } from './hooks/useWallet'
import { Navigation } from './components/Navigation/Navigation'
import { WalletButton } from './components/WalletButton/WalletButton'
import { ToastNotification } from './components/ToastNotification/ToastNotification'
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary'
import { Home } from './pages/Home'
import { Dashboard } from './pages/Dashboard'
import { Staking } from './pages/Staking'
import { addToast as addToastUtil, removeToast } from './utils/toastQueue'
import type { Toast } from './types'

export default function App() {
  const { publicKey, isConnecting, connectingMessage, networkWarning, connect, disconnect, signTransaction } = useWallet()
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const t: Toast = { ...toast, id: crypto.randomUUID() }
    setToasts((prev) => addToastUtil(prev, t))
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => removeToast(prev, id))
  }, [])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950 text-white">
        <header className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-md border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-lg font-bold text-white whitespace-nowrap" aria-label="Stellar NFT Market">
                ⭐ <span className="hidden sm:inline">Stellar NFT Market</span>
              </span>
              <div className="w-px h-5 bg-white/20 hidden sm:block" aria-hidden="true" />
              <Navigation />
            </div>
            <WalletButton
              publicKey={publicKey}
              isConnecting={isConnecting}
              connectingMessage={connectingMessage}
              onConnect={connect}
              onDisconnect={disconnect}
            />
          </div>
        </header>

        {networkWarning && (
          <div className="bg-yellow-500/10 border-b border-yellow-500/30 px-4 py-2 text-center" role="alert">
            <p className="text-yellow-400 text-sm">{networkWarning}</p>
          </div>
        )}

        <main>
          <ErrorBoundary>
            <Routes>
              <Route
                path="/"
                element={
                  <Home
                    publicKey={publicKey}
                    isConnecting={isConnecting}
                    connectingMessage={connectingMessage}
                    onConnect={connect}
                    onDisconnect={disconnect}
                  />
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ErrorBoundary>
                    <Dashboard publicKey={publicKey} signTransaction={signTransaction} addToast={addToast} />
                  </ErrorBoundary>
                }
              />
              <Route
                path="/staking"
                element={
                  <ErrorBoundary>
                    <Staking publicKey={publicKey} signTransaction={signTransaction} addToast={addToast} />
                  </ErrorBoundary>
                }
              />
            </Routes>
          </ErrorBoundary>
        </main>

        <ToastNotification toasts={toasts} onDismiss={dismissToast} />
      </div>
    </BrowserRouter>
  )
}
