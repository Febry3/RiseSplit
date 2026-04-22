## Main Net:
Expert Url: https://stellar.expert/explorer/public/tx/2642e73586a3fa88d06413064def7066cbd279ee4175c619d3873e1258da960e
Lab Url: https://lab.stellar.org/r/mainnet/contract/CDZPBJQBSHQ2ZJD3X2QKCMQ2TLJTNRVEHSVEVKONGO2OWE2U7UTG6OWA
Deployed Url: https://rise-split.vercel.app/

<img width="1827" height="802" alt="{B6EF49B7-5E57-48DC-B3C8-5B2D38E2FB19}" src="https://github.com/user-attachments/assets/7b60971f-8899-4287-8e15-9ac92b43f927" />



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



## Some Pic About The App
<img width="1897" height="880" alt="{F594D6FA-C7D9-476F-81E4-231A3E91BE3D}" src="https://github.com/user-attachments/assets/4d1daafa-f33e-4805-85b4-1ca113753b03" />
<img width="1901" height="906" alt="{DD14D139-2AEC-4550-B5F4-049587BABF67}" src="https://github.com/user-attachments/assets/b9a81c25-1507-4a75-9660-6b92f2cf3f9a" />
<img width="1892" height="870" alt="{014DCB72-23A0-4F00-98AE-79AF8934CF55}" src="https://github.com/user-attachments/assets/0561cb67-a0be-4dbb-80e6-41f5067ee1b6" />



