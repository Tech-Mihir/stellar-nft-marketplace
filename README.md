# Stellar NFT Game Marketplace

[![CI](https://github.com/Tech-Mihir/stellar-nft-marketplace/actions/workflows/ci.yml/badge.svg)](https://github.com/Tech-Mihir/stellar-nft-marketplace/actions/workflows/ci.yml)

A production-ready NFT Game Marketplace built on the **Stellar blockchain** using **Soroban smart contracts**, React (Vite), and Tailwind CSS.

---

## 🔴 Live Demo

**[https://elaborate-blancmange-bbb098.netlify.app](https://elaborate-blancmange-bbb098.netlify.app)**

---

## 📱 Mobile Responsive View

The app is fully responsive across all screen sizes. Navigation collapses on mobile, NFT grid stacks to single column, wallet button and staking panel adapt to small viewports.

> **To verify:** Open the live demo on any mobile device or use Chrome DevTools → Toggle device toolbar (Ctrl+Shift+M)

![Mobile responsive — Home page](https://elaborate-blancmange-bbb098.netlify.app)

Key responsive features:
- Header: logo text hidden on mobile (`hidden sm:inline`), nav items compact
- NFT grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- Staking rewards panel: stacks vertically on mobile (`flex-col sm:flex-row`)
- Toasts: full-width on mobile (`left-4 right-4 sm:left-auto sm:right-4`)
- All buttons: minimum 44px touch target height

---

## ⚙️ CI/CD Pipeline

[![CI](https://github.com/Tech-Mihir/stellar-nft-marketplace/actions/workflows/ci.yml/badge.svg)](https://github.com/Tech-Mihir/stellar-nft-marketplace/actions/workflows/ci.yml)

GitHub Actions runs automatically on every push to `main`:

| Step | Command |
|---|---|
| Type check | `tsc --noEmit` |
| Unit tests | `vitest --run` (17 tests) |
| Production build | `vite build` |
| Verify output | `test -f dist/index.html` |

Pipeline config: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

---

## 🏗️ Architecture & Inter-Contract Calls

```
Frontend (React + Vite + TypeScript)
    ↓ @stellar/stellar-sdk v12
Soroban RPC — Stellar Testnet
    ↓
┌──────────────────────────────────────────────────┐
│  NFT Contract (Soroban)                          │
│    mint(to) → u32 token_id                       │
│    balance_of(owner) → u32                       │
│    transfer(from, to, token_id)                  │
│    approve(owner, spender, token_id)             │
│                                                  │
│  Reward Token Contract (custom SEP-41, Soroban)  │
│    mint(to, amount)  ← called by Staking         │
│    balance_of(owner) → i128                      │
│    decimals() → 7                                │
│                                                  │
│  Staking Contract (Soroban)                      │
│    stake(user, token_id)                         │
│      └─► inter-contract call → NFT.transfer()   │
│    unstake(user, token_id)                       │
│      └─► inter-contract call → NFT.transfer()   │
│    claim_rewards(user)                           │
│      └─► inter-contract call → Token.mint()     │
│    pending_rewards(user) → i128                  │
│    staked_tokens(user) → Vec<u32>                │
└──────────────────────────────────────────────────┘
```

### Inter-Contract Calls (Soroban)
The **Staking contract** makes cross-contract calls to:
1. `NFT.transfer()` — moves NFT custody to/from staking contract on stake/unstake
2. `Token.mint()` — mints RWD reward tokens directly to user on claim

This is implemented using `env.invoke_contract()` in Soroban Rust — see [`contracts/staking/src/lib.rs`](contracts/staking/src/lib.rs).

---

## 🔗 Contract Addresses (Testnet)

> The app ships with a **demo mode** that uses mock data when contracts are not deployed, so the full UI is explorable without on-chain contracts. To deploy real contracts, follow the instructions below.

| Contract | Address |
|---|---|
| NFT Contract | `CCITVGCYZYZMGZTZBY55ASVGOZRJF2UMRJ5TUTUOOVQMWGGZJ3LMQSRG` |
| Reward Token (RWD) | `CDG3FQ2LAWP2ZQHNZXHYQZLF5K7IRQCDQ3BQDMPDBLVG7RX5AMXA4PW6` |
| Staking Contract | `CBFXEMFH7SNRSS7B2ZKNBZS4CB242SOCXPRADXVAAKA6ILYPLRQAW5EX` |

**Deploy transaction hashes (Stellar Testnet):**
- NFT deploy: [`64b72f789673517ab4d182176270817b23999dc755c2b687d2eb601fd3d5dd1c`](https://stellar.expert/explorer/testnet/tx/64b72f789673517ab4d182176270817b23999dc755c2b687d2eb601fd3d5dd1c)
- Token deploy: [`b9e9928bbbac9907bf9631274f590907a686d65b6d44f4d18e4f9ce01a98585d`](https://stellar.expert/explorer/testnet/tx/b9e9928bbbac9907bf9631274f590907a686d65b6d44f4d18e4f9ce01a98585d)
- Staking deploy: [`2f64a2dc30d128b21d5ebbc422899b7ccf1adc40fd529f6d3387ca54c20bd34b`](https://stellar.expert/explorer/testnet/tx/2f64a2dc30d128b21d5ebbc422899b7ccf1adc40fd529f6d3387ca54c20bd34b)
- Staking init (inter-contract): [`8f25bbb60dd8989398e36bcf2f4437cb9e9179527c802ced11eb3fd3bff12043`](https://stellar.expert/explorer/testnet/tx/8f25bbb60dd8989398e36bcf2f4437cb9e9179527c802ced11eb3fd3bff12043)

### Deploy Contracts (One Command)

```bash
# Prerequisites: Rust + Cargo + Stellar CLI
cargo install --locked stellar-cli --features opt

# Fund a testnet account
stellar keys generate deployer --network testnet
stellar keys fund deployer --network testnet

# Build + deploy all 3 contracts + initialize + auto-update .env
cd contracts
bash deploy.sh
```

The script outputs contract IDs and transaction hashes, and automatically writes them to `.env`.

---

## 🚀 Features

- Connect **Freighter wallet** (Stellar's browser extension wallet)
- **Mint** game asset NFTs via Soroban contract
- **Stake NFTs** — inter-contract call transfers NFT to staking contract
- **Earn RWD tokens** — custom Soroban token minted as staking rewards
- **Unstake** and **claim rewards** via inter-contract calls
- Real-time transaction toasts (pending / success / error)
- **Demo mode** — full UI explorable without deployed contracts
- Network mismatch detection (warns if Freighter is on wrong network)
- Error boundaries for graceful failure handling
- Fully mobile responsive

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| Blockchain SDK | `@stellar/stellar-sdk` v12 |
| Wallet | `@stellar/freighter-api` v1.7.1 |
| Routing | React Router v6 |
| Testing | Vitest + React Testing Library |
| CI/CD | GitHub Actions |
| Hosting | Netlify |
| Smart Contracts | Rust + Soroban SDK v21 |

---

## 📦 Getting Started

```bash
npm install
cp .env.example .env
npm run dev
```

App runs in demo mode automatically — no contracts needed to explore the UI.

### Environment Variables

| Variable | Description |
|---|---|
| `VITE_NFT_CONTRACT_ID` | Soroban NFT contract ID (56-char, starts with C) |
| `VITE_TOKEN_CONTRACT_ID` | Soroban reward token contract ID |
| `VITE_STAKING_CONTRACT_ID` | Soroban staking contract ID |
| `VITE_SOROBAN_RPC_URL` | RPC endpoint (default: Stellar testnet) |
| `VITE_NETWORK_PASSPHRASE` | Network passphrase (default: testnet) |

---

## 🧪 Tests

```bash
npm test
```

17 passing tests across 3 files:
- `formatBalance` — token balance formatting with decimals
- `parseTransactionError` — Soroban error message parsing
- `toastQueue` — toast state management with max queue limit

---

## 📁 Project Structure

```
src/
├── components/
│   ├── ErrorBoundary/     # React error boundary
│   ├── Navigation/        # Responsive nav bar
│   ├── NFTCard/           # NFT card with stake/unstake
│   ├── ToastNotification/ # Transaction status toasts
│   └── WalletButton/      # Freighter connect/disconnect
├── contracts/
│   ├── abis/              # Contract ABI definitions
│   ├── config.ts          # Contract config + validation
│   ├── mock.ts            # Demo mode mock data
│   └── stellar.ts         # Soroban RPC call helpers
├── hooks/
│   ├── useWallet.ts       # Freighter wallet connection
│   ├── useNFTs.ts         # NFT fetching + minting
│   ├── useStaking.ts      # Stake/unstake operations
│   ├── useRewards.ts      # Reward balance + claiming
│   └── useDebounce.ts     # Button debounce utility
├── pages/
│   ├── Home.tsx           # Landing page
│   ├── Dashboard.tsx      # NFT management
│   └── Staking.tsx        # Staking + rewards UI
└── utils/
    ├── formatBalance.ts   # Token balance formatting
    ├── parseError.ts      # Soroban error parsing
    ├── toastQueue.ts      # Toast queue management
    └── validateEnv.ts     # Startup env validation
contracts/
├── nft/src/lib.rs         # Soroban NFT contract (Rust)
├── reward_token/src/lib.rs # Soroban SEP-41 token (Rust)
├── staking/src/lib.rs     # Soroban staking + inter-contract calls (Rust)
└── deploy.sh              # One-command build + deploy script
```
