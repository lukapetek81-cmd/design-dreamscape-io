import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { base, polygon } from 'wagmi/chains';
import type { Chain } from 'wagmi/chains';

// Reown (formerly WalletConnect) Project ID — publishable client-side identifier.
// Safe to expose in source: same security model as Stripe publishable keys.
export const WALLETCONNECT_PROJECT_ID = 'e7ec52beda46ef5c9cc313259c9eb737';

// USDC contract addresses on supported chains
export const USDC_ADDRESSES: Record<number, `0x${string}`> = {
  [base.id]: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  [polygon.id]: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
};

export const SUPPORTED_CHAINS = [base, polygon] as const satisfies readonly [Chain, ...Chain[]];

const metadata = {
  name: 'Commodity Hub',
  description: 'Synthetic commodity trading with USDC',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://commodity-hub.lovable.app',
  icons: ['https://commodity-hub.lovable.app/icon-only.png'],
};

export const wagmiConfig = defaultWagmiConfig({
  chains: SUPPORTED_CHAINS,
  projectId: WALLETCONNECT_PROJECT_ID,
  metadata,
  enableWalletConnect: true,
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbase: true,
});
