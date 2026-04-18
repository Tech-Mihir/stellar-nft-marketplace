export interface NFT {
  tokenId: string
  imageUrl: string
  isStaked: boolean
  owner: string
}

export interface Toast {
  id: string
  type: 'pending' | 'success' | 'error'
  message: string
}

export interface RewardsState {
  balance: string
  isLoading: boolean
  isClaiming: boolean
  error: string | null
}

export interface ToastState {
  toasts: Toast[]
}

export interface NFTMetadata {
  name: string
  description: string
  image: string
  attributes?: Array<{
    trait_type: string
    value: string | number
  }>
}

export interface ContractConfig {
  nftContractId: string
  tokenContractId: string
  stakingContractId: string
  networkPassphrase: string
  rpcUrl: string
}

export interface StellarWallet {
  publicKey: string
  isConnected: boolean
  isConnecting: boolean
  connectingMessage: string
  error: string | null
  networkWarning: string | null
  connect: () => Promise<void>
  disconnect: () => void
  signTransaction: (xdr: string) => Promise<string>
}
