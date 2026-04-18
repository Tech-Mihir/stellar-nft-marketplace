#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype,
    Address, Env, Vec,
};

/// Reward rate: tokens per ledger per staked NFT (in stroops, 7 decimals)
const REWARD_RATE: i128 = 1_000_000; // 0.1 RWD per ledger per NFT

#[contracttype]
pub enum DataKey {
    Admin,
    NftContract,
    TokenContract,
    StakedTokens(Address),
    StakeTime(Address, u32),
    PendingRewards(Address),
}

#[contract]
pub struct StakingContract;

#[contractimpl]
impl StakingContract {
    pub fn initialize(env: Env, admin: Address, nft_contract: Address, token_contract: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::NftContract, &nft_contract);
        env.storage().instance().set(&DataKey::TokenContract, &token_contract);
    }

    /// Stake an NFT — transfers it from user to this contract
    pub fn stake(env: Env, user: Address, token_id: u32) {
        user.require_auth();

        let nft: Address = env.storage().instance().get(&DataKey::NftContract).expect("not initialized");

        // Accrue any existing rewards first
        Self::accrue_rewards(&env, &user);

        // Transfer NFT from user to this contract (inter-contract call)
        let staking_contract = env.current_contract_address();
        env.invoke_contract::<()>(
            &nft,
            &soroban_sdk::symbol_short!("transfer"),
            soroban_sdk::vec![
                &env,
                user.clone().into(),
                staking_contract.into(),
                token_id.into(),
            ],
        );

        // Record stake
        let mut tokens: Vec<u32> = env
            .storage()
            .persistent()
            .get(&DataKey::StakedTokens(user.clone()))
            .unwrap_or(Vec::new(&env));
        tokens.push_back(token_id);
        env.storage().persistent().set(&DataKey::StakedTokens(user.clone()), &tokens);
        env.storage().persistent().set(&DataKey::StakeTime(user, token_id), &env.ledger().sequence());
    }

    /// Unstake an NFT — transfers it back to user
    pub fn unstake(env: Env, user: Address, token_id: u32) {
        user.require_auth();

        let nft: Address = env.storage().instance().get(&DataKey::NftContract).expect("not initialized");

        // Accrue rewards before unstaking
        Self::accrue_rewards(&env, &user);

        // Transfer NFT back to user (inter-contract call)
        let staking_contract = env.current_contract_address();
        env.invoke_contract::<()>(
            &nft,
            &soroban_sdk::symbol_short!("transfer"),
            soroban_sdk::vec![
                &env,
                staking_contract.into(),
                user.clone().into(),
                token_id.into(),
            ],
        );

        // Remove from staked list
        let mut tokens: Vec<u32> = env
            .storage()
            .persistent()
            .get(&DataKey::StakedTokens(user.clone()))
            .unwrap_or(Vec::new(&env));
        let pos = tokens.iter().position(|t| t == token_id).expect("token not staked");
        tokens.remove(pos as u32);
        env.storage().persistent().set(&DataKey::StakedTokens(user.clone()), &tokens);
        env.storage().persistent().remove(&DataKey::StakeTime(user, token_id));
    }

    /// Claim accumulated rewards
    pub fn claim_rewards(env: Env, user: Address) {
        user.require_auth();

        Self::accrue_rewards(&env, &user);

        let pending: i128 = env
            .storage()
            .persistent()
            .get(&DataKey::PendingRewards(user.clone()))
            .unwrap_or(0);

        if pending == 0 {
            panic!("no rewards to claim");
        }

        let token: Address = env.storage().instance().get(&DataKey::TokenContract).expect("not initialized");

        // Mint reward tokens to user (inter-contract call)
        env.invoke_contract::<()>(
            &token,
            &soroban_sdk::symbol_short!("mint"),
            soroban_sdk::vec![
                &env,
                user.clone().into(),
                pending.into(),
            ],
        );

        env.storage().persistent().set(&DataKey::PendingRewards(user), &0i128);
    }

    /// View pending rewards for a user
    pub fn pending_rewards(env: Env, user: Address) -> i128 {
        let tokens: Vec<u32> = env
            .storage()
            .persistent()
            .get(&DataKey::StakedTokens(user.clone()))
            .unwrap_or(Vec::new(&env));

        let current_ledger = env.ledger().sequence();
        let mut total: i128 = env
            .storage()
            .persistent()
            .get(&DataKey::PendingRewards(user.clone()))
            .unwrap_or(0);

        for token_id in tokens.iter() {
            let stake_time: u32 = env
                .storage()
                .persistent()
                .get(&DataKey::StakeTime(user.clone(), token_id))
                .unwrap_or(current_ledger);
            let ledgers_staked = (current_ledger - stake_time) as i128;
            total += ledgers_staked * REWARD_RATE;
        }

        total
    }

    /// View staked token IDs for a user
    pub fn staked_tokens(env: Env, user: Address) -> Vec<u32> {
        env.storage()
            .persistent()
            .get(&DataKey::StakedTokens(user))
            .unwrap_or(Vec::new(&env))
    }

    // Internal: snapshot rewards into pending balance
    fn accrue_rewards(env: &Env, user: &Address) {
        let tokens: Vec<u32> = env
            .storage()
            .persistent()
            .get(&DataKey::StakedTokens(user.clone()))
            .unwrap_or(Vec::new(env));

        let current_ledger = env.ledger().sequence();
        let mut pending: i128 = env
            .storage()
            .persistent()
            .get(&DataKey::PendingRewards(user.clone()))
            .unwrap_or(0);

        for token_id in tokens.iter() {
            let stake_time: u32 = env
                .storage()
                .persistent()
                .get(&DataKey::StakeTime(user.clone(), token_id))
                .unwrap_or(current_ledger);
            let ledgers_staked = (current_ledger - stake_time) as i128;
            pending += ledgers_staked * REWARD_RATE;
            // Reset stake time to now
            env.storage().persistent().set(&DataKey::StakeTime(user.clone(), token_id), &current_ledger);
        }

        env.storage().persistent().set(&DataKey::PendingRewards(user.clone()), &pending);
    }
}
