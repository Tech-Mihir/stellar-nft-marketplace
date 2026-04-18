#!/bin/bash
set -e

NETWORK="testnet"
SOURCE="deployer"

echo "=== Building contracts ==="
cd "$(dirname "$0")"
stellar contract build

echo ""
echo "=== Deploying NFT contract ==="
NFT_ID=$(stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/nft.wasm \
  --source $SOURCE \
  --network $NETWORK)
echo "NFT Contract ID: $NFT_ID"

echo ""
echo "=== Deploying Reward Token contract ==="
TOKEN_ID=$(stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/reward_token.wasm \
  --source $SOURCE \
  --network $NETWORK)
echo "Token Contract ID: $TOKEN_ID"

echo ""
echo "=== Deploying Staking contract ==="
STAKING_ID=$(stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/staking.wasm \
  --source $SOURCE \
  --network $NETWORK)
echo "Staking Contract ID: $STAKING_ID"

DEPLOYER_ADDRESS=$(stellar keys address $SOURCE)

echo ""
echo "=== Initializing contracts ==="

stellar contract invoke \
  --id $NFT_ID \
  --source $SOURCE \
  --network $NETWORK \
  -- initialize \
  --admin $DEPLOYER_ADDRESS

stellar contract invoke \
  --id $TOKEN_ID \
  --source $SOURCE \
  --network $NETWORK \
  -- initialize \
  --admin $STAKING_ID

stellar contract invoke \
  --id $STAKING_ID \
  --source $SOURCE \
  --network $NETWORK \
  -- initialize \
  --admin $DEPLOYER_ADDRESS \
  --nft_contract $NFT_ID \
  --token_contract $TOKEN_ID

echo ""
echo "=== Done! Add these to your .env file ==="
echo ""
echo "VITE_NFT_CONTRACT_ID=$NFT_ID"
echo "VITE_TOKEN_CONTRACT_ID=$TOKEN_ID"
echo "VITE_STAKING_CONTRACT_ID=$STAKING_ID"
echo ""

# Auto-write to .env in project root
ENV_FILE="../.env"
sed -i "s|VITE_NFT_CONTRACT_ID=.*|VITE_NFT_CONTRACT_ID=$NFT_ID|" $ENV_FILE
sed -i "s|VITE_TOKEN_CONTRACT_ID=.*|VITE_TOKEN_CONTRACT_ID=$TOKEN_ID|" $ENV_FILE
sed -i "s|VITE_STAKING_CONTRACT_ID=.*|VITE_STAKING_CONTRACT_ID=$STAKING_ID|" $ENV_FILE
echo ".env updated automatically!"
