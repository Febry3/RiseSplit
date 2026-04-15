<img width="1844" height="969" alt="{BBACB986-F58E-4A40-B825-64795AC1B6EF}" src="https://github.com/user-attachments/assets/78c35176-56ac-4b88-a13a-418f05823d65" /># RiseSplit

RiseSplit is a Soroban-based royalty distribution app for creator collaborations. It allows one payer transaction to split funds atomically to multiple stakeholders using predefined basis-point shares.

## Why This Exists
Traditional royalty settlement is slow and opaque:
- Manual payout cycles delay cash flow.
- Contributors cannot easily verify split logic.
- Finance teams repeat the same reconciliation workflow.

RiseSplit moves split rules on-chain and executes payouts in one transaction.

## What The App Includes
- Soroban smart contract in Rust (`contracts/notes/src/lib.rs`)
- React + Vite frontend in `frontend/`
- Freighter wallet signing flow
- On-chain analytics reads (`shareholders`, `total revenue`, `last payment`)

## App Name
Product name: **RiseSplit**
Brand label in UI: **Ghost-Author**

## Test IDs (Current)
- Smart contract ID (`VITE_ROYALTY_CONTRACT_ID`): `CBVQM5DH4CNQOXYODIBD5ZBCPIGOWDVVRIMMNMGRH4RLUMINZC73PMA2`
- Dummy account 1: `GCG77MJHMK3QNHETQ5DY5G7K6YTBMTZTR7AB7NI3VH3OEQCXMGVG3ORH`
- Dummy account 2: `GCT7DYT7AQE7K5RFOWL24VOOU5CN6PNUUK2ZFZOAJGHVH62TRZ7YFDYF`

## Core Contract Functions
- `init(owner, shareholders)`
  - Sets/updates royalty configuration.
  - Requires total shares = `10000` bps.
- `pay(payer, asset, amount)`
  - Splits and transfers payment to all shareholders atomically.
- `get_owner()`
- `get_shareholders()`
- `get_total_revenue(asset)`
- `get_last_payment_at()`

Error variants:
- `InvalidPercentageSum`
- `InsufficientPayment`
- `UnauthorizedAccess`
- `NotInitialized`

## Project Structure
- `contracts/notes/src/lib.rs`: royalty splitter contract
- `frontend/src/pages/LandingPage.tsx`: landing page
- `frontend/src/pages/DashboardPage.tsx`: app dashboard
- `frontend/src/lib/contract.ts`: Soroban tx and read logic
- `frontend/src/lib/freighter.ts`: Freighter integration

## Prerequisites
- Rust toolchain
- Stellar CLI (`stellar`)
- Node.js 18+
- Freighter wallet extension

## Frontend Setup
```bash
cd frontend
npm install
Copy-Item .env.example .env
```

Fill `.env`:
```env
VITE_STELLAR_RPC_URL=https://soroban-testnet.stellar.org
VITE_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
VITE_STELLAR_NETWORK=TESTNET
VITE_STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
VITE_ROYALTY_CONTRACT_ID=CBVQM5DH4CNQOXYODIBD5ZBCPIGOWDVVRIMMNMGRH4RLUMINZC73PMA2
VITE_XLM_SAC_CONTRACT_ID=CHANGE_ME
VITE_USDC_SAC_CONTRACT_ID=CHANGE_ME
VITE_STELLAR_EXPERT_NETWORK=testnet
```

## How To Obtain Env Values

### 1) Generate funded testnet account
```bash
stellar keys generate deployer --network testnet --fund --overwrite
```

### 2) Build + deploy contract
```bash
stellar contract build
stellar contract deploy --network testnet --source-account deployer --alias ghost_author --package notes
```
Use returned contract ID as:
- `VITE_ROYALTY_CONTRACT_ID`

### 3) Get XLM SAC contract ID
```bash
stellar contract id asset --network testnet --asset native
```
Use result as:
- `VITE_XLM_SAC_CONTRACT_ID`

### 4) Get USDC SAC (optional)
Use the issuer account of your testnet USDC-like token:
```bash
stellar contract id asset --network testnet --asset "USDC:<ISSUER_G_ADDRESS>"
```
Use result as:
- `VITE_USDC_SAC_CONTRACT_ID`

## Run The App
```bash
cd frontend
npm run dev
```

Build check:
```bash
npm run build
```

## Test Flow (Manual)
1. Open `/` landing page, continue to `/app`.
2. Connect Freighter.
3. Ensure Freighter network is **Testnet**.
4. Enter collaborator addresses and percentages (must total exactly `100%`).
5. Click **Deploy / Update Royalty Config** and approve wallet signature.
6. Enter payment amount, choose asset, click **Pay Royalty**.
7. Verify success toast, analytics update, and tx link.

## Common Issues
- `Network Freighter harus testnet`
  - Switch Freighter network to Testnet.
- `Gagal membaca saldo account dari Horizon`
  - Account is not funded on testnet.
- `Kontrak belum diinisialisasi`
  - Run deploy/update (`init`) before payment.
- `Unsupported address type` / `Bad union switch`
  - Use full valid Stellar address format and ensure SDK/frontend versions are current.

## Notes
- Frontend signs through Freighter; private keys are not handled in app code.
- Transaction table is session-local (not persisted).
- This repository currently targets **Stellar Testnet**.


## Contract Details
Contract Address ID: CBVQM5DH4CNQOXYODIBD5ZBCPIGOWDVVRIMMNMGRH4RLUMINZC73PMA2
Or: https://lab.stellar.org/r/testnet/contract/CBVQM5DH4CNQOXYODIBD5ZBCPIGOWDVVRIMMNMGRH4RLUMINZC73PMA2
<img width="1844" height="969" alt="{BBACB986-F58E-4A40-B825-64795AC1B6EF}" src="https://github.com/user-attachments/assets/3bbfaee0-d48f-471f-a208-7d16ad66db7c" />

https://stellar.expert/explorer/testnet/contract/CBVQM5DH4CNQOXYODIBD5ZBCPIGOWDVVRIMMNMGRH4RLUMINZC73PMA2
<img width="1915" height="864" alt="{7AA2C636-B9C8-462A-B938-6027159C774F}" src="https://github.com/user-attachments/assets/be841787-c362-4770-b300-f9e9d9a41133" />


## Some Pic About The App
<img width="1897" height="880" alt="{F594D6FA-C7D9-476F-81E4-231A3E91BE3D}" src="https://github.com/user-attachments/assets/4d1daafa-f33e-4805-85b4-1ca113753b03" />
<img width="1898" height="870" alt="{57981FB6-B199-411F-AD24-6823D8289DFA}" src="https://github.com/user-attachments/assets/b26432b0-1bad-4c98-94ee-4cb27e54b5cf" />
<img width="1892" height="870" alt="{014DCB72-23A0-4F00-98AE-79AF8934CF55}" src="https://github.com/user-attachments/assets/0561cb67-a0be-4dbb-80e6-41f5067ee1b6" />



