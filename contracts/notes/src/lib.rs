#![no_std]
use soroban_sdk::{contract, contracterror, contractimpl, contracttype, token, Address, Env, Vec};

const BPS_DENOMINATOR: u32 = 10_000;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Shareholder {
    pub address: Address,
    pub bps: u32,
}

#[contracttype]
#[derive(Clone)]
enum DataKey {
    Owner,
    Shareholders,
    LastPaymentAt,
    AssetRevenue(Address),
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ContractError {
    InvalidPercentageSum = 1,
    InsufficientPayment = 2,
    UnauthorizedAccess = 3,
    NotInitialized = 4,
}

#[contract]
pub struct RoyaltySplitterContract;

#[contractimpl]
impl RoyaltySplitterContract {
    pub fn init(env: Env, owner: Address, shareholders: Vec<Shareholder>) -> Result<(), ContractError> {
        if env.storage().persistent().has(&DataKey::Owner) {
            let current_owner: Address = env.storage().persistent().get(&DataKey::Owner).unwrap();
            current_owner.require_auth();
            if current_owner != owner {
                return Err(ContractError::UnauthorizedAccess);
            }
        } else {
            owner.require_auth();
            env.storage().persistent().set(&DataKey::Owner, &owner);
        }

        validate_shareholders(&shareholders)?;
        env.storage().persistent().set(&DataKey::Shareholders, &shareholders);

        Ok(())
    }

    pub fn pay(env: Env, payer: Address, asset: Address, amount: i128) -> Result<(), ContractError> {
        if amount <= 0 {
            return Err(ContractError::InsufficientPayment);
        }

        let shareholders = get_shareholders_or_err(&env)?;
        if shareholders.is_empty() {
            return Err(ContractError::NotInitialized);
        }

        payer.require_auth();

        let token = token::Client::new(&env, &asset);
        let mut distributed: i128 = 0;
        let last_index = shareholders.len() - 1;

        for i in 0..shareholders.len() {
            let shareholder = shareholders.get(i).unwrap();
            let payout = if i == last_index {
                amount - distributed
            } else {
                let part = amount
                    .checked_mul(shareholder.bps as i128)
                    .ok_or(ContractError::InsufficientPayment)?
                    / (BPS_DENOMINATOR as i128);

                if shareholder.bps > 0 && part == 0 {
                    return Err(ContractError::InsufficientPayment);
                }

                part
            };

            distributed = distributed
                .checked_add(payout)
                .ok_or(ContractError::InsufficientPayment)?;

            token.transfer(&payer, &shareholder.address, &payout);
        }

        let revenue_key = DataKey::AssetRevenue(asset);
        let total_revenue: i128 = env.storage().persistent().get(&revenue_key).unwrap_or(0);
        let updated_revenue = total_revenue
            .checked_add(amount)
            .ok_or(ContractError::InsufficientPayment)?;
        env.storage().persistent().set(&revenue_key, &updated_revenue);
        env.storage()
            .persistent()
            .set(&DataKey::LastPaymentAt, &env.ledger().timestamp());

        Ok(())
    }

    pub fn get_owner(env: Env) -> Result<Address, ContractError> {
        env.storage()
            .persistent()
            .get(&DataKey::Owner)
            .ok_or(ContractError::NotInitialized)
    }

    pub fn get_shareholders(env: Env) -> Result<Vec<Shareholder>, ContractError> {
        get_shareholders_or_err(&env)
    }

    pub fn get_total_revenue(env: Env, asset: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::AssetRevenue(asset))
            .unwrap_or(0)
    }

    pub fn get_last_payment_at(env: Env) -> u64 {
        env.storage().persistent().get(&DataKey::LastPaymentAt).unwrap_or(0)
    }
}

fn get_shareholders_or_err(env: &Env) -> Result<Vec<Shareholder>, ContractError> {
    env.storage()
        .persistent()
        .get(&DataKey::Shareholders)
        .ok_or(ContractError::NotInitialized)
}

fn validate_shareholders(shareholders: &Vec<Shareholder>) -> Result<(), ContractError> {
    if shareholders.is_empty() {
        return Err(ContractError::InvalidPercentageSum);
    }

    let mut total_bps: u32 = 0;
    for i in 0..shareholders.len() {
        let shareholder = shareholders.get(i).unwrap();
        total_bps = total_bps
            .checked_add(shareholder.bps)
            .ok_or(ContractError::InvalidPercentageSum)?;
    }

    if total_bps != BPS_DENOMINATOR {
        return Err(ContractError::InvalidPercentageSum);
    }

    Ok(())
}

mod test;
