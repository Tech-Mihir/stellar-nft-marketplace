# Stellar NFT Game Marketplace

[![CI](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml)

A production-ready NFT Game Marketplace built on the **Stellar blockchain** using **Soroban smart contracts**, React (Vite), and Tailwind CSS.

## 🔴 Live Demo

[https://YOUR_DEPLOY_URL.netlify.app](https://YOUR_DEPLOY_URL.netlify.app)

> Deploy to Netlify: connect this repo, set build command `npm run build`, publish dir `dist`, and add env vars from `.env.example`.

## 📱 Mobile Responsive

The app is fully responsive across all screen sizes — navigation, NFT grid, staking panel, and wallet button all adapt to mobile viewports.

## ⚙️ CI/CD Pipeline

GitHub Actions runs on every push to `main`:
- Type check (`tsc --noEmit`)
- Unit tests (Vitest — 17 tests)
- Production build
- Build output verification

## 🏗️ Architecture

```
Frontend (React + Vite)
    ↓ @stellar/stellar-sdk
Soroban RPC (Stellar Testnet)
    ↓
┌──────────────────────────────────────────┐
│  NFT Contract                            │
│    mint(), balance_of(), transfer()      │
│  Reward Token Contract (custom SEP-41)   │
│    mint(), balance_of(), decimals()      │
│  Staking Contract                        │
│    stake()  ──→ inter-contract → NFT     │
│    unstake() ─→ inter-contract → NFT     │
│    claim_rewards() → inter-contract      │
│                      → Token (mint)      │
└──────────────────────────────────────────┘
```

### Inter-Contract Calls
The Staking contract calls the NFT contract to transfer tokens on stake/unstake, and calls the Reward Token contract to mint rewards on claim. This demonstrates advanced Soroban inter-contract call patterns.

## 🚀 Features

- Connect **Freighter wallet** (Stellar's browser wallet)
- View owned NFTs on Stellar
- **Mint** new game asset NFTs via Soroban contract
- **Stake NFTs** to earn custom RWD tokens (inter-contract calls)
- **Unstake NFTs** and claim accumulated rewards
- Real-time transaction status with toast notifications
- **Demo mode** — works without deployed contracts using mock data
- Network mismatch detection
- Error boundaries for graceful failure handling
- Fully mobile responsive

## 🛠️ Tech Stack

- React 18 + TypeScript + Vite
- Tailwind CSS
- `@stellar/stellar-sdk` v12 for Soroban RPC
- `@stellar/freighter-api` v1.7.1 for wallet signing
- React Router v6
- Vitest + React Testing Library
- GitHub Actions CI/CD
- Netlify / Vercel deployment

## 📦 Getting Started

### Prerequisites

1. Install [Freighter wallet](https://freighter.app) browser extension
2. Fund your testnet account at [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test)

### Setup

```bash
npm install
cp .env.example .env
npm run dev
```

The app runs in **demo mode** automatically if no contract IDs are configured — you'll see mock NFTs and rewards so you can explore the full UI.

### Environment Variables

| Variable | Description |
|---|---|
| `VITE_NFT_CONTRACT_ID` | Soroban NFT contract address (56-char, starts with C) |
| `VITE_TOKEN_CONTRACT_ID` | Soroban reward token contract address |
| `VITE_STAKING_CONTRACT_ID` | Soroban staking contract address |
| `VITE_SOROBAN_RPC_URL` | Soroban RPC endpoint (defaults to testnet) |
| `VITE_NETWORK_PASSPHRASE` | Stellar network passphrase (defaults to testnet) |

## 🔗 Contract Addresses (Testnet)

> Deploy your contracts using the instructions below and fill in these values.

| Contract | Address |
|---|---|
| NFT Contract | `REPLACE_WITH_DEPLOYED_NFT_CONTRACT_ID` |
| Reward Token | `REPLACE_WITH_DEPLOYED_TOKEN_CONTRACT_ID` |
| Staking Contract | `REPLACE_WITH_DEPLOYED_STAKING_CONTRACT_ID` |

**Deploy transaction hash:** `REPLACE_WITH_TX_HASH`

### Deploy Soroban Contracts

```bash
# Install Stellar CLI
cargo install --locked stellar-cli --features opt

# Generate and fund a testnet keypair
stellar keys generate deployer --network testnet
stellar keys fund deployer --network testnet

# Build and deploy all contracts (auto-updates .env)
cd contracts
bash deploy.sh
```

## 🧪 Running Tests

```bash
npm test
```

17 tests covering `formatBalance`, `parseTransactionError`, and `toastQueue` utilities.

## 📁 Project Structure

```
src/
├── components/
│   ├── ErrorBoundary/     # React error boundary
│   ├── Navigation/        # Responsive nav bar
│   ├── NFTCard/           # NFT display + stake/unstake
│   ├── ToastNotification/ # Transaction status toasts
│   └── WalletButton/      # Freighter connect/disconnect
├── contracts/
│   ├── abis/              # Contract ABI definitions
│   ├── config.ts          # Contract config + validation
│   ├── mock.ts            # Demo mode mock data
│   └── stellar.ts         # Soroban RPC helpers
├── hooks/
│   ├── useWallet.ts       # Freighter wallet connection
│   ├── useNFTs.ts         # NFT fetching + minting
│   ├── useStaking.ts      # Stake/unstake operations
│   ├── useRewards.ts      # Reward balance + claiming
│   └── useDebounce.ts     # Button debounce
├── pages/
│   ├── Home.tsx           # Landing page
│   ├── Dashboard.tsx      # NFT management
│   └── Staking.tsx        # Staking + rewards
└── utils/
    ├── formatBalance.ts   # Token balance formatting
    ├── parseError.ts      # Soroban error parsing
    ├── toastQueue.ts      # Toast state management
    └── validateEnv.ts     # Env var validation
contracts/
├── nft/                   # Soroban NFT contract (Rust)
├── reward_token/          # Soroban SEP-41 token (Rust)
├── staking/               # Soroban staking contract (Rust)
└── deploy.sh              # One-command deploy script
```

## 🌐 Deployment

**Netlify:**
1. Connect GitHub repo
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add env vars from `.env.example`

**Vercel:**
1. Import repo, framework: Vite
2. Add env vars from `.env.example`
