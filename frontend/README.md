# RiseSplit (Ghost-Author) Frontend Documentation

## 1. What This App Does
RiseSplit (UI label: Ghost-Author) is a wallet-first royalty splitter DApp UI for your Soroban contract.

It lets users:
- Connect Freighter wallet
- Initialize royalty configuration (`init`) with collaborators + percentages
- Pay royalties (`pay`) in selected asset (XLM/USDC)
- Read analytics from chain (`get_shareholders`, `get_total_revenue`, `get_last_payment_at`)

The frontend talks directly to Soroban RPC + Horizon. There is no separate backend server.

## 2. System Architecture
- Frontend: React + Vite + Tailwind
- Wallet signing: Freighter
- Chain access: Soroban RPC
- Balance read: Horizon
- Contract: Rust Soroban contract in `contracts/notes/src/lib.rs`

Flow:
1. User action in UI
2. Frontend builds/simulates tx via RPC
3. Freighter signs tx
4. Frontend submits signed XDR to RPC
5. Frontend polls tx status and updates UI

## 3. Contract Mapping (Rust <-> UI)
Rust functions used by frontend:
- `init(owner, shareholders)`
- `pay(payer, asset, amount)`
- `get_shareholders()`
- `get_total_revenue(asset)`
- `get_last_payment_at()`

Rust errors mapped into friendly UI messages:
- `InvalidPercentageSum`
- `InsufficientPayment`
- `UnauthorizedAccess`
- `NotInitialized`

## 4. Important UI Modules
- Wallet Module (`Connect Wallet`): connects Freighter, validates network, reads XLM balance.
- Creator Studio: dynamic collaborator rows, auto total %, bps conversion, deploy/update button.
- Payer Interface: amount + asset selector, payout preview, submit payment.
- Analytics: total revenue, participant count, last payment timestamp.
- Transaction Table: session-level tx records + Stellar Expert links.
- Toast System: status feedback for every action.

## 5. Directory Guide
- `src/App.tsx`: main UI + user flow handlers
- `src/lib/freighter.ts`: wallet connect + sign adapter
- `src/lib/contract.ts`: Soroban invoke/simulate/send/read logic
- `src/lib/error-map.ts`: chain/wallet error translation
- `src/data/assets.ts`: asset options from env
- `src/lib/utils.ts`: formatting, parsing, amount conversion
- `src/polyfills.ts`: browser polyfills used by SDK/runtime

## 6. Environment Variables
Copy `.env.example` to `.env` and fill values:

- `VITE_ROYALTY_CONTRACT_ID`: `CBVQM5DH4CNQOXYODIBD5ZBCPIGOWDVVRIMMNMGRH4RLUMINZC73PMA2`
- `VITE_XLM_SAC_CONTRACT_ID`: native XLM SAC contract ID (`C...`)
- `VITE_USDC_SAC_CONTRACT_ID`: USDC SAC contract ID (`C...`, optional if unused)
- `VITE_STELLAR_RPC_URL`: Soroban RPC URL
- `VITE_STELLAR_HORIZON_URL`: Horizon URL
- `VITE_STELLAR_NETWORK`: `TESTNET`
- `VITE_STELLAR_NETWORK_PASSPHRASE`: `Test SDF Network ; September 2015`
- `VITE_STELLAR_EXPERT_NETWORK`: `testnet`

Test dummy accounts:
- `GCG77MJHMK3QNHETQ5DY5G7K6YTBMTZTR7AB7NI3VH3OEQCXMGVG3ORH`
- `GCT7DYT7AQE7K5RFOWL24VOOU5CN6PNUUK2ZFZOAJGHVH62TRZ7YFDYF`

## 7. Run Locally
```bash
cd frontend
npm install
npm run dev
```

Build check:
```bash
npm run build
```

## 8. How To Use (End-to-End)
1. Open app and connect Freighter.
2. Ensure Freighter network is Testnet.
3. In Creator Studio, input collaborators (total must equal 100%).
4. Click `Deploy / Update Royalty Config` and approve in Freighter.
5. In Payer Interface, select asset + amount.
6. Click `Pay Royalty` and approve in Freighter.
7. Verify analytics cards and tx table updates.

## 9. Amount/BPS Rules
- Percent input is converted to bps (`25.5%` -> `2550`)
- Total bps must be exactly `10000`
- Payment amount is converted to atomic units using asset decimals

## 10. Troubleshooting
- `Network Freighter harus Testnet`
  - Switch Freighter network to Testnet, then refresh.

- `Gagal membaca saldo account dari Horizon`
  - Wallet address is not funded on testnet. Use Friendbot and retry.

- `Kontrak belum diinisialisasi`
  - Run `Deploy / Update Royalty Config` first.

- `...tidak valid. Gunakan alamat Stellar lengkap...`
  - Use full `G...`/`C...` address, not shortened text.

- Deploy/Pay fails with stage message:
  - `PrepareTx failed`: simulation/build issue
  - `FreighterSign failed`: wallet signing issue
  - `SendTx failed`: RPC submission issue

## 11. Current Limitations
- Transaction table is session-local (not persisted in database).
- Analytics read failures fallback to safe defaults to keep UI usable.
- USDC flow requires a valid test asset + trustline + balance in wallet.

## 12. Security Notes
- Private keys are never handled by frontend; signing is delegated to Freighter.
- Contract enforces auth and percentage validation on-chain.
- Frontend validates address format and numeric inputs before submit.
