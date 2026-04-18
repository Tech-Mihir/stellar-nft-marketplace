#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    Address, Env, String, Vec,
};

#[contracttype]
pub enum DataKey {
    Admin,
    NextId,
    Owner(u32),
    TokenUri(u32),
    OwnerTokens(Address),
    Approved(u32),
}

#[contract]
pub struct NFTContract;

#[contractimpl]
impl NFTContract {
    /// Initialize with an admin address
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::NextId, &1u32);
    }

    /// Mint a new NFT to `to`, returns the new token ID
    pub fn mint(env: Env, to: Address) -> u32 {
        to.require_auth();
        let token_id: u32 = env.storage().instance().get(&DataKey::NextId).unwrap_or(1);
        env.storage().instance().set(&DataKey::NextId, &(token_id + 1));
        env.storage().persistent().set(&DataKey::Owner(token_id), &to);

        // Build a simple token URI
        let uri = String::from_str(&env, "https://placehold.co/400x400/1a0533/a78bfa?text=NFT");
        env.storage().persistent().set(&DataKey::TokenUri(token_id), &uri);

        // Add to owner's token list
        let mut tokens: Vec<u32> = env
            .storage()
            .persistent()
            .get(&DataKey::OwnerTokens(to.clone()))
            .unwrap_or(Vec::new(&env));
        tokens.push_back(token_id);
        env.storage().persistent().set(&DataKey::OwnerTokens(to), &tokens);

        token_id
    }

    /// Number of NFTs owned by `owner`
    pub fn balance_of(env: Env, owner: Address) -> u32 {
        let tokens: Vec<u32> = env
            .storage()
            .persistent()
            .get(&DataKey::OwnerTokens(owner))
            .unwrap_or(Vec::new(&env));
        tokens.len()
    }

    /// Get token ID at `index` for `owner`
    pub fn token_of_owner_by_index(env: Env, owner: Address, index: u32) -> u32 {
        let tokens: Vec<u32> = env
            .storage()
            .persistent()
            .get(&DataKey::OwnerTokens(owner))
            .unwrap_or(Vec::new(&env));
        tokens.get(index).expect("index out of bounds")
    }

    /// Get token URI
    pub fn token_uri(env: Env, token_id: u32) -> String {
        env.storage()
            .persistent()
            .get(&DataKey::TokenUri(token_id))
            .expect("token does not exist")
    }

    /// Approve `spender` to transfer `token_id`
    pub fn approve(env: Env, owner: Address, spender: Address, token_id: u32, _approved: bool) {
        owner.require_auth();
        let actual_owner: Address = env
            .storage()
            .persistent()
            .get(&DataKey::Owner(token_id))
            .expect("token does not exist");
        if actual_owner != owner {
            panic!("not owner");
        }
        env.storage().persistent().set(&DataKey::Approved(token_id), &spender);
    }

    /// Transfer token — called by staking contract
    pub fn transfer(env: Env, from: Address, to: Address, token_id: u32) {
        // Caller must be owner or approved
        let actual_owner: Address = env
            .storage()
            .persistent()
            .get(&DataKey::Owner(token_id))
            .expect("token does not exist");

        if actual_owner == from {
            from.require_auth();
        } else {
            let approved: Address = env
                .storage()
                .persistent()
                .get(&DataKey::Approved(token_id))
                .expect("not approved");
            if approved != from {
                panic!("not authorized");
            }
            from.require_auth();
        }

        // Remove from sender's list
        let mut from_tokens: Vec<u32> = env
            .storage()
            .persistent()
            .get(&DataKey::OwnerTokens(from.clone()))
            .unwrap_or(Vec::new(&env));
        let pos = from_tokens.iter().position(|t| t == token_id).expect("token not found");
        from_tokens.remove(pos as u32);
        env.storage().persistent().set(&DataKey::OwnerTokens(from), &from_tokens);

        // Add to receiver's list
        let mut to_tokens: Vec<u32> = env
            .storage()
            .persistent()
            .get(&DataKey::OwnerTokens(to.clone()))
            .unwrap_or(Vec::new(&env));
        to_tokens.push_back(token_id);
        env.storage().persistent().set(&DataKey::OwnerTokens(to.clone()), &to_tokens);

        // Update owner
        env.storage().persistent().set(&DataKey::Owner(token_id), &to);
        // Clear approval
        env.storage().persistent().remove(&DataKey::Approved(token_id));
    }

    /// Get owner of token
    pub fn owner_of(env: Env, token_id: u32) -> Address {
        env.storage()
            .persistent()
            .get(&DataKey::Owner(token_id))
            .expect("token does not exist")
    }
}
