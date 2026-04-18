
# Real USDC Deposits + Synthetic Trading + KYC

## Architecture

```
User wallet (MetaMask/WalletConnect)
        │ holds real USDC on Base/Polygon
        ▼
   ┌──────────┐
   │  Lock    │  user signs tx → USDC sent to your "TradingVault" contract
   │ Deposit  │  contract emits Deposit event (user, amount)
   └────┬─────┘
        ▼
   ┌──────────┐
   │ Indexer  │  edge function listens → credits usdc_balances
   └────┬─────┘
        ▼
   ┌──────────┐
   │Synthetic │  existing engine — open/close positions vs oracle prices
   │ trading  │  P&L adjusts usdc_balances
   └────┬─────┘
        ▼
   ┌──────────┐
   │ Withdraw │  user request → backend signs withdrawal → sent to wallet
   └──────────┘
```

**Key principle:** Your app never holds private keys. A smart contract holds USDC; the user signs deposits, your backend signs withdrawals based on the tracked balance.

## Phase 1 — Wallet connect + KYC (this turn)

### Dependencies
- `wagmi` + `viem` + `@web3modal/wagmi` (WalletConnect — MetaMask, Coinbase, mobile, Capacitor)
- Persona Inquiry SDK (~$1.50/verification, sandbox free, instant)

### Database
- `wallet_connections`: user_id, address, chain_id, verified_at
- `kyc_verifications`: user_id, provider, status, inquiry_id, verified_at, country
- Add `wallet_address` + `kyc_status` to `usdc_balances`

### Edge functions
- `kyc-create-inquiry` — creates Persona inquiry
- `kyc-webhook` — receives status updates
- `verify-wallet-signature` — proves wallet ownership via signed message

### UI
- Header: "Connect Wallet" button → shows address + balance
- Profile: wallet + KYC status panel
- Trade gate: trades over a threshold require KYC complete
- Deposit/Withdraw buttons stubbed with "Phase 2 — on-chain vault coming"

## Phase 2 — On-chain vault (next turn, separate plan)

Solidity contract on Base, event indexer, withdrawal signer. Out of scope for one Lovable turn — the existing `usdc_balances.balance` is reused; Phase 2 only changes how credits land.

## Phase 3 — Real on/off-ramp via MoonPay/Transak (later)

## Secrets needed
- `WALLETCONNECT_PROJECT_ID` (free, instant — cloud.walletconnect.com)
- `PERSONA_API_KEY` (free sandbox — withpersona.com)
- `PERSONA_WEBHOOK_SECRET`

## What you'll need to do
1. Create accounts at WalletConnect Cloud and Persona (both free for sandbox)
2. Provide the keys when I prompt for them
3. For Phase 2 (real deposits), we'll need a Solidity dev review or use a templated vault — discuss next turn

Approve and I'll start with the migration, then dependencies, then UI/edge functions.
